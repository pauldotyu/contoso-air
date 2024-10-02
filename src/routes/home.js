var express = require('express');
var router = express.Router();

const navbarService = require('../services').NavbarService();
const dealsService = require('../services').DealsService();

router.get('/', function(req, res, next) {
  const vm = {
    nav: navbarService.getData(req),
    deals: {
      destinations: dealsService.getBestDestinations(3),
      flights: dealsService.getFlightDeals(4)
    }
  };
  res.render('home', vm);
});

module.exports = router;
