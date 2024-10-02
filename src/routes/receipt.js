var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('receipt', { title: 'Receipt' });
});

module.exports = router;
