var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  title: {type:String, required:true},
  body: {type:String, required:true},
  author: {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  createdAt: {type:Date, default:Date.now},
  updatedAt: Date
});
var Post = mongoose.model('post',postSchema);

module.exports = Post;
