/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const multer = require('multer');
const reactViews = require('express-react-views');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./server/app/controllers/home');
const userController = require('./server/app/controllers/user');
const apiController = require('./server/app/controllers/api');
const contactController = require('./server/app/controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.engine('jsx', reactViews.createEngine({ beautify: true }));
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user &&
    (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/admin/', passportConfig.isAuthenticated, homeController.index);
app.get('/admin/login', userController.getLogin);
app.post('/admin/login', userController.postLogin);
app.get('/admin/logout', userController.logout);
app.get('/admin/forgot', userController.getForgot);
app.post('/admin/forgot', userController.postForgot);
app.get('/admin/reset/:token', userController.getReset);
app.post('/admin/reset/:token', userController.postReset);
app.get('/admin/signup', passportConfig.isAuthenticated, userController.getSignup);
app.post('/admin/signup', passportConfig.isAuthenticated, userController.postSignup);
app.get('/admin/contact', contactController.getContact);
app.post('/admin/contact', contactController.postContact);
app.get('/admin/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/admin/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/admin/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/admin/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/admin/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get('/admin/api', apiController.getApi);
app.get('/admin/api/lastfm', apiController.getLastfm);
app.get('/admin/api/nyt', apiController.getNewYorkTimes);
app.get('/admin/api/aviary', apiController.getAviary);
app.get('/admin/api/steam', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getSteam);
app.get('/admin/api/stripe', apiController.getStripe);
app.post('/admin/api/stripe', apiController.postStripe);
app.get('/admin/api/scraping', apiController.getScraping);
app.get('/admin/api/twilio', apiController.getTwilio);
app.post('/admin/api/twilio', apiController.postTwilio);
app.get('/admin/api/clockwork', apiController.getClockwork);
app.post('/admin/api/clockwork', apiController.postClockwork);
app.get('/admin/api/foursquare', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFoursquare);
app.get('/admin/api/tumblr', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTumblr);
app.get('/admin/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/admin/api/github', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getGithub);
app.get('/admin/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/admin/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/admin/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/admin/api/instagram', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getInstagram);
app.get('/admin/api/paypal', apiController.getPayPal);
app.get('/admin/api/paypal/success', apiController.getPayPalSuccess);
app.get('/admin/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/admin/api/lob', apiController.getLob);
app.get('/admin/api/upload', apiController.getFileUpload);
app.post('/admin/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/admin/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getPinterest);
app.post('/admin/api/pinterest', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postPinterest);
app.get('/admin/api/google-maps', apiController.getGoogleMaps);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/admin/auth/instagram', passport.authenticate('instagram'));
app.get('/admin/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});
app.get('/admin/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/admin/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});
app.get('/admin/auth/github', passport.authenticate('github'));
app.get('/admin/auth/github/callback', passport.authenticate('github', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});
app.get('/admin/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/admin/auth/google/callback', passport.authenticate('google', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});
app.get('/admin/auth/twitter', passport.authenticate('twitter'));
app.get('/admin/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});
app.get('/admin/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/admin/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/admin/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/admin/auth/foursquare', passport.authorize('foursquare'));
app.get('/admin/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/admin/api' }), (req, res) => {
  res.redirect('/admin/api/foursquare');
});
app.get('/admin/auth/tumblr', passport.authorize('tumblr'));
app.get('/admin/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/admin/api' }), (req, res) => {
  res.redirect('/admin/api/tumblr');
});
app.get('/admin/auth/steam', passport.authorize('openid', { state: 'SOME STATE' }));
app.get('/admin/auth/steam/callback', passport.authorize('openid', { failureRedirect: '/admin/api' }), (req, res) => {
  res.redirect(req.session.returnTo);
});
app.get('/admin/auth/pinterest', passport.authorize('pinterest', { scope: 'read_public write_public' }));
app.get('/admin/auth/pinterest/callback', passport.authorize('pinterest', { failureRedirect: '/admin/login' }), (req, res) => {
  res.redirect('/admin/api/pinterest');
});

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
