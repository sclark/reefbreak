var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Method = mongoose.model('Method');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.get('/poll/exists/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function (e, poll) {
      if (poll) res.send({exists: true, status: "success"});
      else res.send({exists: false, status: "error: poll not found"})
    }
  );
});

router.get('/poll/votes/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function (e, poll) {
      if (poll) res.send({votes: poll.votes.length, status: "success"});
      else res.send({votes: false, status: "error: poll not found"})
    }
  );
});

router.get('/poll/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function (e, poll) {
      if (poll) res.send({poll: poll, status: "success"});
      else res.send({poll: null, status: "error: poll not found"})
    }
  );
});

router.get('/poll/:name/r', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function (e, poll) {
      if (poll) res.send({options: poll.options, status: "success"});
      else res.send({options: null, status: "error: poll not found"})
    }
  );
});

router.post('/poll/:name/cast', function(req, res) {
  if (req.body.single) {
    Poll.update({name: req.params.name, 'options.name': req.body.vote}, {$inc: {'options.$.votes': 1, votes: 1}, $push: {voters: {ip: req.connection.remoteAddress, useragent: req.useragent.source}}}, function(e, status) {
      if (e || status.ok === 0) res.render('error', { message: "Vote Not Counted", status: "Please go back to your poll and try to vote again. If this error persists, contact help...", error: {} });
      res.redirect('/p/'+req.params.name+'/r');
    });
  }
  else res.send({});
});

router.post('/new', function(req, res) {
  var poll = req.body;
  if (method in poll && duration in poll && prompt in poll && options in poll && 'name' in poll) {
    Method.findOne({code: poll.method}).exec(
      function(e, method) {
        if (e || method == null) res.send({status: "error: method not found"});
        var poll = new Poll({created: new Date().getTime(), winner: "", time: poll.duration, single: method.single, prompt: poll.prompt, options: poll.options, votes: 0, name: poll.name, method: poll.method});
        poll.save(function(e, d) {
          if (e) res.send({status: "error: poll not created"});
          else res.send({status: "success"});
        });
      }
    );
  }
});

module.exports = router;
