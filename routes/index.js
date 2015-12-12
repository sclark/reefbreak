var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Method = mongoose.model('Method');

router.get('/', function(req, res, next) {
  res.render('index');
});  

router.get('/new', function(req, res) {
  Method.find({}).exec(
    function (e, methods) {
      res.render('new', {methods: methods} );
    }
  );
});

router.post('/new', function(req, res) {
    res.render('error', { message: "Unimplemented", status: "This feature is not available yet.", error: {} });
});  

router.get('/p/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) res.render('error', { message: "Poll Not Found", status: "It must have gotten lost in the swells..." });
      else {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) res.render('error', { message: "Method Not Found", status: "It seems that this poll is broken. Try recerating it..." });
            res.render('poll', { poll: poll, method: method });
          }
        );
      }
    }
  );
});

router.post('/p/:name/cast', function(req, res) {
  Poll.update({name: req.params.name, 'options.name': req.body.vote}, {$inc: {'options.$.votes': 1}}, function(e, status) {
    if (e || status.ok === 0) res.render('error', { message: "Vote Not Counted", status: "Please go back to your poll and try to vote again. If this error persists, contact help...", error: {} });
    res.redirect('/p/'+req.params.name+'/r');
  });
});

router.get('/p/:id/r', function(req, res, next) {
  res.render('error', { message: "Unimplemented", status: "This feature is not available yet.", error: {} });
});

router.get('/about/:method', function(req, res, next) {
  Method.findOne({code: req.params.method}).exec(
    function(e, method) {
      if (e || method == null) res.render('error', { message: "Method Not Found", status: "This method does not exist!" });
      else {
        res.render('about', {method: method});
      }
    }
  );
});

module.exports = router;
