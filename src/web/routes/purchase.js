const express = require("express");

const { encodeData, secured } = require("./helpers");
const services = require("../services");
const navbarService = services.NavbarService();
const bookService = services.BookService();
const flightsService = services.FlightsService();
const selectionService = services.SelectionService();
const moment = require("moment");

const router = express.Router();

router.get("/", secured, async function (req, res, next) {
  let booked = await bookService.getBooked(req.user.name);
  // Fallback: if nothing booked yet but we still have a legacy pending selection in session, persist it now
  if (!booked && req.session && req.session.pendingBooking) {
    try {
      const { partingFlight, returningFlight, passengers } =
        req.session.pendingBooking;
      await bookService.bookFlight(
        req.user.name,
        partingFlight,
        returningFlight,
        passengers
      );
      delete req.session.pendingBooking;
      booked = await bookService.getBooked(req.user.name);
    } catch (e) {
      // ignore and fall through to redirect
    }
  }
  // Handle compact selection via SelectionService
  let sel = selectionService.loadPending(req);
  if (!booked && sel) {
    try {
      const {
        fromCode,
        toCode,
        dpa,
        dpb,
        depFlightId,
        retFlightId,
        passengers,
      } = sel;
      const partingFlight = flightsService.getFlightById(
        fromCode,
        toCode,
        moment(dpa),
        depFlightId
      );
      const returningFlight = flightsService.getFlightById(
        toCode,
        fromCode,
        moment(dpb),
        retFlightId
      );
      await bookService.bookFlight(
        req.user.name,
        partingFlight,
        returningFlight,
        passengers
      );
      selectionService.clearPending(req, res);
      booked = await bookService.getBooked(req.user.name);
    } catch (e) {
      // ignore
    }
  }
  if (!booked) {
    return res.redirect("/book");
  }
  const { parting, returning } = booked;
  const price = (parting.price + returning.price) * booked.passengers;
  const vm = {
    nav: navbarService.getData(req),
    name: req.user.name,
    summary: {
      parting,
      returning,
    },
    totals: { price, passengers: booked.passengers },
  };
  res.render("purchase", vm);
});

router.post("/", secured, async function (req, res, next) {
  const id = await bookService.purchase(req.user.name);
  res.redirect("/book/receipt?" + encodeData({ id }));
});

module.exports = router;
