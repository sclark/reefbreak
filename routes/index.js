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
      if (e || method == null) res.render('error', { message: "Method Not Found", status: "It seems that something is broken. Try recerating the poll..." });
      var poll = new Poll({created: new Date().getTime(), winner: "", time: req.body.time, single: method.single, prompt: req.body.prompt, options: options, votes: 0, name: req.body.name, method: req.body.method});
      poll.save(function(e, d) {
        if (e) res.render('error', { message: "Poll Not Created", status: "Your poll was not created. Please try again, maybe another name...", error: {} });
        else res.redirect('/p/'+req.body.name);
      });
    }
  );
});

router.get('/p/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) res.render('error', { message: "Poll Not Found", status: "It must have gotten lost in the swells..." });
      else if (new Date().getTime() - poll.created > poll.time && poll.time != -1) {
        res.redirect('/p/'+req.params.name+'/r');
      }
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
  var ident = {ip: req.connection.remoteAddress, useragent: req.useragent.source};
  if (req.body.single) {
    Poll.findOne({name: req.params.name, 'voters.ip': ident.ip, 'voters.useragent': ident.useragent}).exec(
      function (e, poll) {
        if (poll) res.render('error', { message: "Duplicate Vote", status: "It looks like you already voted on this poll..." });
        else if (req.useragent.isBot || req.useragent.browser === "unknown") res.render('error', { message: "Hóla Señor Roboto", status: "Tu miras como un robot y por eso tu no puedes votar. Adiós..." });
        else {
          Poll.update({name: req.params.name, 'options.name': req.body.vote}, {$inc: {'options.$.votes': 1, votes: 1}, $push: {voters: {ip: req.connection.remoteAddress, useragent: req.useragent.source}}}, function(e, status) {
            if (e || status.ok === 0) res.render('error', { message: "Vote Not Counted", status: "Please go back to your poll and try to vote again. If this error persists, contact help...", error: {} });
            res.redirect('/p/'+req.params.name+'/r');
          });
        }
      }
    );
  }
  else {
    res.render('error', { message: "Multiple Votes", status: "This type of poll is not yet supported." });
  }
});

router.get('/p/:name/r', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) res.render('error', { message: "Poll Not Found", status: "It must have gotten lost in the swells..." });
      else if ((poll.winner === "") && new Date().getTime() - poll.created > poll.time && poll.time != -1) {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) res.render('error', { message: "Method Not Found", status: "It seems that this poll is broken. Try recerating it..." });
            Poll.update({name: req.params.name}, {$set: {winner: methodFunctions[method.code](poll.options).name}}, function (e, status) {
              if (e || status.ok === 0) res.render('error', { message: "Winner Calculation Failed", status: "Please try refreshing this page to try again..", error: {} });
              res.redirect('/p/'+req.params.name+'/r');
            });
          }
        );
      }
      else {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            if (e || poll == null) res.render('error', { message: "Method Not Found", status: "It seems that this poll is broken. Try recerating it..." });
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
      if (e || method == null) res.render('error', { message: "Method Not Found", status: "This method does not exist!" });
      else {
        res.render('about', {method: method});
      }
    }
  );
});

module.exports = router;
