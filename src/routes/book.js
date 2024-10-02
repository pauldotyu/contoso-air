var express = require('express');
var router = express.Router();

const navbarService = require('../services').NavbarService();
const dealsService = require('../services').DealsService();
const bookFormService = require('../services').BookFormService();

const dateFormat = 'YYYY-MM-DD';

router.get('/', function(req, res, next) {
  const vm = {
    nav: navbarService.getData(req),
    deals: {
      destinations: dealsService.getBestDestinations(3),
      flights: dealsService.getFlightDeals(4)
    },
    form: bookFormService.getForm(dateFormat),
  };
  res.render('book', vm);
});

module.exports = router;
