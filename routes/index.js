var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Method = mongoose.model('Method');
var Time = mongoose.model('Time');
var methodFunctions = require('../method-functions');

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/new', function(req, res) {
  Method.find({}).exec(
    function (e, methods) {
      Time.find({}).exec(
        function (e, times) {
          res.render('new', {methods: methods, times: times});
        }
      )
    }
  );
});

router.post('/new', function(req, res) {
  var i = 0;
  var options = [];
  while (req.body["option-"+i] != undefined && req.body["option-"+i] != '') {
    options.push({name: req.body["option-"+i], votes: 0});
    i++;
  }
  Method.findOne({code: req.body.method}).exec(
    function(e, method) {
      if (e || method == null) throw new Error("Method Not Found");
      var poll = new Poll({created: new Date().getTime(), winner: "", time: req.body.time, prompt: req.body.prompt, options: options, votes: [], name: req.body.name, method: req.body.method});
      poll.save(function(e, d) {
        if (e) throw new Error("Poll Not Created");
        else res.redirect('/p/'+req.body.name);
      });
    }
  );
});

router.get('/p/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) throw new Error("Poll Not Found");
      else if (new Date().getTime() - poll.created > poll.time && poll.time != -1) {
        res.redirect('/p/'+req.params.name+'/r');
      }
      else {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) throw new Error("Method Not Found");
            res.render('poll', { poll: poll, method: method });
          }
        );
      }
    }
  );
});

router.post('/p/:name/cast', function(req, res, next) {
  var ident = {ip: req.connection.remoteAddress, useragent: req.useragent.source};
  try {
    var vote = JSON.parse(req.body.vote);
  } catch (e) {
    var vote = [req.body.vote];
  }
  Poll.findOne({name: req.params.name, 'votes.ip': ident.ip, 'votes.useragent': ident.useragent}).exec(
    function (e, poll) {
      if (poll) next(new Error("Duplicate Vote"));
      else if (req.useragent.isBot || req.useragent.browser === "unknown") throw new Error("Automation Of Operation Disallowed");
      else {
        Poll.update({name: req.params.name, 'options.name': vote[0]}, {$inc: {'options.$.votes': 1}, $push: {votes: {vote: vote, ip: req.connection.remoteAddress, useragent: req.useragent.source}}}, function(e, status) {
          if (e || status.ok === 0) throw new Error("Vote Not Counted");
          res.redirect('/p/'+req.params.name+'/r');
        });
      }
    }
  );
});

router.get('/p/:name/r', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) throw new Error("Poll Not Found");
      else if ((poll.winner === "") && new Date().getTime() - poll.created > poll.time && poll.time != -1) {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) throw new Error("Method Not Found");
            Poll.update({name: req.params.name}, {$set: {winner: methodFunctions[method.code](poll.votes, poll.options).name}}, function (e, status) {
              if (e || status.ok === 0) throw new Error("Winner Cannot Be Determined");
              res.redirect('/p/'+req.params.name+'/r');
            });
          }
        );
      }
      else {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) throw new Error("Method Not Found");
            res.render('results', { poll: poll, method: method });
          }
        );
      }
    }
  );
});

router.get('/about/:method', function(req, res, next) {
  Method.findOne({code: req.params.method}).exec(
    function(e, method) {
      if (e || method == null) throw new Error("Method Not Found");
      else {
        res.render('about', {method: method});
      }
    }
  );
});

module.exports = router;
