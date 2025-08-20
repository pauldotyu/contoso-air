const express = require("express");

const navbarService = require("../services").NavbarService();
const dealsService = require("../services").DealsService();
const bookFormService = require("../services").BookFormService();

const router = express.Router();

router.get("/", function (req, res, next) {
  const form = bookFormService.getForm();
  const vm = {
    nav: navbarService.getData(req),
    deals: {
      destinations: dealsService.getBestDestinations(3),
      flights: dealsService.getFlightDeals(4),
    },
  form, // contains limited airports lists to keep render fast
  };
  res.render("home", vm);
});

module.exports = router;
