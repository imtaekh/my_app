var mongoose = require('mongoose');
var bcrypt   = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  email: {type:String, required:true, unique:true},
  nickname: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  createdAt: {type:Date, default:Date.now}
});
userSchema.pre("save", function (next){
  var user = this;
  if(!user.isModified("password")){
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};
var User = mongoose.model('user',userSchema);

module.exports = User;
