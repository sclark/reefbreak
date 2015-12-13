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

module.exports = router;
