var express = require('express');
var router = express.Router();

const navbarService = require('../services').NavbarService();

router.get('/', function (req, res, next) {
  const vm = {
    nav: navbarService.getData(req),
  };
  res.render('login', vm);
});

module.exports = router;
