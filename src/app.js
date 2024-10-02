var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var i18n = require('i18n');

var app = express();

app.use(i18n.init);
i18n.configure({
  locales: ['en', 'es'], // Add your supported locales here
  directory: path.join(__dirname, 'locales'), // Path to your translation files
  defaultLocale: 'en',
  objectNotation: true,
  register: global
});
i18n.setLocale('en');
app.use(function(req, res, next) {
  // express helper for natively supported engines
  res.locals.__ = res.__ = function() {
      return i18n.__.apply(req, arguments);
  };

  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes'));

app.use(function(req, res, next) {
  res.locals.__ = res.__ = function() {
    return i18n.__.apply(req, arguments);
  };
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
