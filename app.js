require('dotenv').config()

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require("method-override");
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const mongoSanitize = require('express-mongo-sanitize');
const dbURL = process.env.db_url || "mongodb://localhost:27017/sanpo-trails"

const userRoutes = require('./routes/users');
const trailRoutes = require('./routes/trails');
const commentRoutes = require('./routes/comments');



mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(console.log("Connected to MongoDB via Mongoose"))
  .catch((err) => {
    console.log("Error", err);
  });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dygnlinhg/", 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

const secret = process.env.secret || 'sanpotrailssecret'

const store = MongoStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret
  }
});

store.on('error', function(e) {
  console.log('Session store error', e)
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if(!['/login', '/register', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/trails', trailRoutes);
app.use('/trails/:id/comments', commentRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oops. Looks like something went wrong.'
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port}.`);
});
