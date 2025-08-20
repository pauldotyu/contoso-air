const passport = require("passport");

const encodeData = function (data) {
  return Object.keys(data)
    .map(function (key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
};

const secured = function (req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // Remember where the user wanted to go
  if (req.session) {
    req.session.returnTo = req.originalUrl || req.url || "/";
  }
  return req.session
    ? req.session.save(() => res.redirect("/login"))
    : res.redirect("/login");
};

module.exports = {
  encodeData,
  secured,
};
