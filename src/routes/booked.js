var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('booked', { title: 'Booked' });
});

module.exports = router;
