var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var Post     = require('../models/Post');

router.get('/', function(req,res){
  var Counter = require('../models/Counter');
  var vistorCounter = null;
  Counter.findOne({name:"vistors"}, function (err,counter) {
    if(!err) vistorCounter = counter;
  });

  var page = Math.max(1,req.query.page);
  var limit = 10;
  Post.count({},function(err,count){
    if(err) return res.json({success:false, message:err});
    var skip = (page-1)*limit;
    var maxPage = Math.ceil(count/limit);
    Post.find().populate("author").sort('-createdAt').skip(skip).limit(limit).exec(function (err,posts) {
      if(err) return res.json({success:false, message:err});
      res.render("posts/index",{
            posts:posts, user:req.user, page:page, maxPage:maxPage,
            counter:vistorCounter, postsMessage:req.flash("postsMessage")[0]
          });
    });
  });
}); // index
router.get('/new', isLoggedIn, function(req,res){
  res.render("posts/new", {user:req.user});
}); // new
router.post('/', isLoggedIn, function(req,res){
  req.body.post.author=req.user._id;
  Post.create(req.body.post,function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
}); // create
router.get('/:id', function(req,res){
  Post.findById(req.params.id).populate("author").exec(function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.render("posts/show", {post:post, page:req.query.page, user:req.user});
  });
}); // show
router.get('/:id/edit', isLoggedIn, function(req,res){
  Post.findById(req.params.id, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!req.user._id.equals(post.author)) return res.json({success:false, message:"Unauthrized Attempt"});
    res.render("posts/edit", {post:post, user:req.user});
  });
}); // edit
router.put('/:id', isLoggedIn, function(req,res){
  req.body.post.updatedAt=Date.now();
  Post.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.post, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to update"});
    res.redirect('/posts/'+req.params.id);
  });
}); //update
router.delete('/:id', isLoggedIn, function(req,res){
  Post.findOneAndRemove({_id:req.params.id, author:req.user._id}, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to delete"});
    res.redirect('/posts');
  });
}); //destroy
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("postsMessage","Please login first.");
  res.redirect('/');
}

module.exports = router;
