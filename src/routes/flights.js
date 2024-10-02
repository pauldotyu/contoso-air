var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('flights', { title: 'Flights' });
});

module.exports = router;
