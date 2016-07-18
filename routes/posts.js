var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var Post     = require('../models/Post');
var Counter  = require('../models/Counter');
var async    = require('async');
var User     = require('../models/User');

// index
router.get('/', function(req,res){
  var vistorCounter = null;
  var page = Math.max(1,req.query.page)>1?parseInt(req.query.page):1;
  var limit = Math.max(1,req.query.limit)>1?parseInt(req.query.limit):10;
  var search = createSearch(req.query);

  async.waterfall([function(callback){
      Counter.findOne({name:"vistors"}, function (err,counter) {
        if(err) callback(err);
        vistorCounter = counter;
        callback(null);
      });
    },function(callback){
      if(!search.findUser) return callback(null);
      User.find(search.findUser,function(err,users){
        if(err) callback(err);
        var or = [];
        users.forEach(function(user){
          or.push({author:mongoose.Types.ObjectId(user._id)});
        });
        if(search.findPost.$or){
          search.findPost.$or = search.findPost.$or.concat(or);
        } else if(or.length>0){
          search.findPost = {$or:or};
        }
        callback(null);
      });
    },function(callback){
      if(search.findUser && !search.findPost.$or) return callback(null, null, 0);
      Post.count(search.findPost,function(err,count){
        if(err) callback(err);
        skip = (page-1)*limit;
        maxPage = Math.ceil(count/limit);
        callback(null, skip, maxPage);
      });
    },function(skip, maxPage, callback){
      if(search.findUser && !search.findPost.$or) return callback(null, [], 0);
      Post.find(search.findPost, {title:1, author:1, views:1, numId:1, comments:1, createdAt:1})
      .populate({path:'author',select:'nickname'}).sort('-createdAt').skip(skip).limit(limit)
      .exec(function (err,posts) {
        if(err) callback(err);
        callback(null, posts, maxPage);
      });
    }],function(err, posts, maxPage){
      if(err) return res.json({success:false, message:err});
      return res.render("posts/index",{
        posts:posts, user:req.user, page:page, maxPage:maxPage,
        urlQuery:createQuery(req._parsedUrl.query), search:search,
        counter:vistorCounter, postsMessage:req.flash("postsMessage")[0]
      });
    });
});

// new
router.get('/new', isLoggedIn, function(req,res){
  res.render("posts/new", {user:req.user,urlQuery:createQuery(req._parsedUrl.query)});
});

// create
router.post('/', isLoggedIn, function(req,res){
  async.waterfall([function(callback){
    Counter.findOne({name:"posts"}, function (err,counter) {
      if(err) callback(err);
      if(counter){
         callback(null, counter);
      } else {
        Counter.create({name:"posts",totalCount:0},function(err,counter){
          if(err) return res.json({success:false, message:err});
          callback(null, counter);
        });
      }
    });
  }],function(callback, counter){
    var newPost = req.body.post;
    newPost.author = req.user._id;
    newPost.numId = counter.totalCount+1;
    Post.create(req.body.post,function (err,post) {
      if(err) return res.json({success:false, message:err});
      counter.totalCount++;
      counter.save();
      res.redirect('/posts/'+post._id+createQuery(req._parsedUrl.query)('?',['page','searchType','searchText']));
    });
  });
});

// show
router.get('/:id', function(req,res){
  Post.findById(req.params.id)
  .populate([{path:'author'},{path:'comments.author'}])
  .exec(function (err,post) {
    if(err) return res.json({success:false, message:err});
    post.views++;
    post.save();
    res.render("posts/show", {post:post, urlQuery:createQuery(req._parsedUrl.query),
      user:req.user, search:createSearch(req.query)});
  });
});

// edit
router.get('/:id/edit', isLoggedIn, function(req,res){
  Post.findById(req.params.id, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!req.user._id.equals(post.author)) return res.json({success:false, message:"Unauthrized Attempt"});
    res.render("posts/edit", {post:post, user:req.user, urlQuery:createQuery(req._parsedUrl.query)});
  });
});

// update
router.put('/:id', isLoggedIn, function(req,res){
  req.body.post.updatedAt=Date.now();
  Post.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.post, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to update"});
    res.redirect('/posts/'+req.params.id+createQuery(req._parsedUrl.query)('?',['_method']));
  });
});

// destroy
router.delete('/:id', isLoggedIn, function(req,res){
  Post.findOneAndRemove({_id:req.params.id, author:req.user._id}, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to delete"});
    res.redirect('/posts'+createQuery(req._parsedUrl.query)('?',['_method']));
  });
});

// comments/create
router.post('/:id/comments', function(req,res){
  var newComment = req.body.comment;
  newComment.author = req.user._id;
  Post.update({_id:req.params.id},{$push:{comments:newComment}},function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts/'+req.params.id+"?"+req._parsedUrl.query);
  });
});

// comments/destroy
router.delete('/:postId/comments/:commentId', function(req,res){
  Post.update({_id:req.params.postId},{$pull:{comments:{_id:req.params.commentId}}},
    function(err,post){
      if(err) return res.json({success:false, message:err});
      res.redirect('/posts/'+req.params.postId+"?"+req._parsedUrl.query.replace(/_method=(.*?)(&|$)/ig,""));
  });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("postsMessage","Please login first.");
  res.redirect('/');
}

function createSearch(queries){
  var findPost = {}, findUser = null, highlight = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){
    var searchTypes = queries.searchType.toLowerCase().split(",");
    var postQueries = [];
    if(searchTypes.indexOf("title")>=0){
      postQueries.push({ title : { $regex : new RegExp(queries.searchText, "i") } });
      highlight.title = queries.searchText;
    }
    if(searchTypes.indexOf("body")>=0){
      postQueries.push({ body : { $regex : new RegExp(queries.searchText, "i") } });
      highlight.body = queries.searchText;
    }
    if(searchTypes.indexOf("author!")>=0){
      findUser = { nickname : queries.searchText };
      highlight.author = queries.searchText;
    } else if(searchTypes.indexOf("author")>=0){
      findUser = { nickname : { $regex : new RegExp(queries.searchText, "i") } };
      highlight.author = queries.searchText;
    }
    if(postQueries.length > 0) findPost = {$or:postQueries};
  }
  return { searchType:queries.searchType, searchText:queries.searchText,
    findPost:findPost, findUser:findUser, highlight:highlight };
}

function createQuery(queryString){
  return function(connectorChar, deleteArray){
    var newQueryString = queryString?queryString:"";
    if(deleteArray){
      deleteArray.forEach(function(e){
        var regex = new RegExp(e+"=(.*?)(&|$)", "ig");
        newQueryString = newQueryString.replace(regex,"");
      });
    }
    if(newQueryString){
      newQueryString = newQueryString.replace(/&$/,"");
    }
    if(newQueryString){
      newQueryString = connectorChar+newQueryString;
    }
    return newQueryString;
  };
}
