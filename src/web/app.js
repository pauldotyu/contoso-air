const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const session = require("express-session");
const flash = require("express-flash");
const favicon = require("serve-favicon");
const passport = require("./config/passport.config");
const i18n = require("i18n");
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({ includeMethod: true });
const services = require("./services");
const { isCosmosConfigured, getDbStatus } = require("./repositories");
const globalNavbarService = services.NavbarService();

const app = express();

// Basic hardening
app.disable("x-powered-by");
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

// Register the metrics middleware using the express-prom-bundle
app.use(metricsMiddleware);

// Configure i18n
i18n.configure({
  objectNotation: true,
  locales: ["en", "es"],
  directory: path.join(__dirname, "locales"),
});

// Register i18n as a middleware
app.use(i18n.init);

// Register the i18n helper with Handlebars
var hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  helpers: {
    i18n: function (str) {
      return new Handlebars.SafeString(i18n.__(str));
    },
  },
});

// view engine setup
app.engine("hbs", hbs.engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(favicon(path.join(__dirname, "public/assets/favicon.ico")));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure:
        !!process.env.SESSION_SECURE || process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

// Make navbar data available to all views by default
app.use((req, res, next) => {
  try {
    res.locals.nav = globalNavbarService.getData(req);
  } catch (e) {
    // In case of any unexpected error, fall back to empty nav to avoid breaking views
    res.locals.nav = {
      greeting: "",
      publicMenu: [],
      securedMenu: [],
      onlyPublicMenu: [],
    };
  }
  next();
});

// Expose DB connectivity status and developer-facing warning
app.use((req, res, next) => {
  res.locals.dbIsConfigured = isCosmosConfigured();
  res.locals.dbStatus = getDbStatus();
  // Only show the warning on routes that rely on booking persistence
  const path = req.path || "";
  const needsDb =
    path.startsWith("/book/purchase") ||
    path.startsWith("/book/receipt") ||
    path.startsWith("/booked") ||
    path.startsWith("/book/flights") ||
    path === "/book";
  const s = res.locals.dbStatus || {};
  const shouldWarn =
    needsDb && (!s.configured || (s.configured && (!s.connected || s.lastError)));
  res.locals.dbWarning = shouldWarn
    ? {
        headline: !s.configured
          ? "Bookings are in demo mode — no database configured"
          : "Bookings are in demo mode — database unreachable",
        note: !s.configured
          ? "This environment isn’t connected to Azure Cosmos DB. Changes won’t persist. Configure credentials to enable live bookings."
          : "Azure Cosmos DB connection failed. Changes won’t persist. Check credentials, network access, and firewall rules.",
        missingEnv: Array.isArray(s.missingEnv) ? s.missingEnv : [],
        error: s.lastError || null,
        lastCheckedAt: s.lastCheckedAt || null,
      }
    : null;
  next();
});

app.use("/", require("./routes"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
