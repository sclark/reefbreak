var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Method = mongoose.model('Method');

router.get('/', function(req, res, next) {
  res.render('index');
});  
  
router.get('/p/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function(e, poll) {
      if (e || poll == null) res.render('error', { message: "Poll Not Found", status: "It must have gotten lost in the swells..." });
      else {
        Method.findOne({code: poll.method}).exec(
          function(e, method) {
            //should never error due to database invariants on insert
            res.render('poll', { poll: poll, method: method });
          }
        );
      }
    }
  );
});

router.get('/p/:id/c/:vote', function(req, res, next) {
  res.render('error', { message: "Unimplemented", status: "This feature is not available yet.", error: {} });
});

router.get('/p/:id/r', function(req, res, next) {
  res.render('error', { message: "Unimplemented", status: "This feature is not available yet.", error: {} });
});

router.get('/about/:method', function(req, res, next) {
  res.render('error', { message: "Unimplemented", status: "This feature is not available yet.", error: {} });
});

module.exports = router;
