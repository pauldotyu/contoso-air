const express = require("express");
const passport = require("passport");
const services = require("../services");
const bookService = services.BookService();
const flightsService = services.FlightsService();
const selectionService = services.SelectionService();
const moment = require("moment");

const navbarService = require("../services").NavbarService();

const router = express.Router();

router.get("/", function (req, res, next) {
  const isLogout = req.baseUrl === "/logout";
  if (isLogout) {
    // Explicit logout path
    return req.logout((err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  }

  // Login page: if already authenticated, honor returnTo if present
  if (req.isAuthenticated && req.isAuthenticated()) {
    const returnTo =
      (req.session && req.session.returnTo) || req.query.returnTo || "/";
    if (req.session) delete req.session.returnTo;
    return res.redirect(returnTo);
  }

  const errors = req.flash("error");
  const vm = {
    nav: navbarService.getData(req),
    errors,
    returnTo:
      (req.session && req.session.returnTo) || req.query.returnTo || "/",
  };
  return res.render("login", vm);
});

// Login with custom callback to finalize pending booking and honor returnTo
router.post("/", function (req, res, next) {
  passport.authenticate("local", async function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, async function (err) {
      if (err) {
        return next(err);
      }
      try {
        // Legacy pendingBooking support (before compact session payload)
        if (req.session && req.session.pendingBooking) {
          const { partingFlight, returningFlight, passengers } =
            req.session.pendingBooking;
          await bookService.bookFlight(
            req.user.name,
            partingFlight,
            returningFlight,
            passengers
          );
          delete req.session.pendingBooking;
        }
        // New compact pendingSelection support via SelectionService
        let sel = selectionService.loadPending(req);
        if (sel) {
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
        }
      } catch (e) {
        // If something fails, proceed to purchase page anyway; errors will surface there
      }
      const returnTo =
        (req.session && req.session.returnTo) || req.body.returnTo || "/";
      if (req.session) delete req.session.returnTo;
      return req.session
        ? req.session.save(() => res.redirect(returnTo))
        : res.redirect(returnTo);
    });
  })(req, res, next);
});

module.exports = router;
