var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Method = mongoose.model('Method');

router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.get('/poll-exists/:name', function(req, res) {
  Poll.findOne({name: req.params.name}).exec(
    function (e, poll) {
      res.send({pollExists: poll!=null, pollName: req.params.name, status: "success"});
    }
  );
});

router.get('/poll/:name', function(req, res) {
  res.send({});
});

router.get('/poll/:name/r', function(req, res) {
  res.send({});
});

router.post('/new', function(req, res) {
  res.send({});
});

module.exports = router;
