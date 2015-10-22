// import modules
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');

// connect database
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open",function () {
  console.log("DB connected!");
});
db.on("error",function (err) {
  console.log("DB ERROR :", err);
});

// model setting

// view setting
app.set("view engine", 'ejs');

// set middlewares
app.use(express.static(path.join(__dirname, 'public')));

// set routes

// start server
app.listen(3000, function(){
  console.log('Server On!');
});
