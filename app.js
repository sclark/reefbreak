var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require( 'mongoose' );
var useragent = require('express-useragent');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/reefbreak');
mongoose.model('Poll', new mongoose.Schema({
  name: {type: String, unique: true},
  prompt: String,
  options: [{name: String, votes: Number}],
  votes: [{vote: [String], ip: String, useragent: String}],
  winner: String,
  single: Boolean,
  created: Number,
  time: Number,
  method: String
}));
mongoose.model('Method', new mongoose.Schema({
  name: String,
  code: String,
  type: String,
  slogan: String,
  description: String,
  links: [{name: String, link: String}]
}));
mongoose.model('Time', new mongoose.Schema({
  name: String,
  time: Number
}));

var app = express();
var routes = require('./routes/index');
var api = require('./routes/api');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(useragent.express());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/v1', api);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      status: err.status,
      error: err
    });
  });
}
else {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      status: err.status,
      error: {}
    });
  });
}

module.exports = app;
