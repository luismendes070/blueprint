var passport     = require ('passport')
  , mongoose     = require ('mongoose')
  , express      = require ('express')
  , session      = require ('express-session')
  , cookieParser = require ('cookie-parser')
  , morgan       = require ('morgan')
  , bodyParser   = require ('body-parser')
  , winston      = require ('winston')
  ;

var Account = require ('./models/account');

// Define the serialization/deserialization methods. The serialization method
// just returns to user id. The deserialization method locates the account by
// the user id.
passport.serializeUser (function (user, done) {
  winston.info ('serializing user: %s', user.id);
  done (null, user.id);
});

passport.deserializeUser (function (id, done) {
  winston.info ('deserializing user: %s', id);

  Account.findById (id, function (err, user) {
    if (err)
      return done (err);

    if (!user)
      return done (new Error ('Account does not exist'));

    done (null, user);
  });
});

// Define the database connection event handlers.
mongoose.connection.on ('error', function (err) {
  winston.error (err);
});

mongoose.connection.on ('disconnect', function () {
  winston.info ('connection to database terminated');
});

/**
 * @class Server
 *
 * Wrapper class for the server object. The server is a wrapper around the
 * Express server.
 */
function Server (opts) {
  if (!opts)
    throw new Error ('Must provide options for the server');

  // Take the options, or use the default options.
  this._opts = opts;
  this.app = express ();

  winston.info ('initializing the server application');

  // Configure the application.
  this.app.use (morgan (this._opts.morgan));
  this.app.use (bodyParser (this._opts.bodyParser));
  this.app.use (cookieParser (this._opts.cookieParser));
  this.app.use (session (this._opts.session));

  this.app.use (passport.initialize ());

  // Initialize the application router.
  var router = require ('./router');
  this.app.use (router (this._opts));

  // Define the error handler.
  this.app.use (function (err, req, res, next) {
    res.status (500).send ('Something broke!');
  });
}

/**
 * Start the server. This method configures the server using the provided
 * options, and starts listening for requests.
 */
Server.prototype.start = function () {
  // Connect to the database.
  winston.info ('connecting to database ' + this._opts.connstr);
  mongoose.connect (this._opts.connstr, this._opts.mongodb);

  // Start listening for requests.
  this.http_ = this.app.listen (this._opts.port);
  winston.info ('listening on port ' + this._opts.port);
};

/**
 * Stop the server. This method closes the database connection, and stops
 * listening for events.
 */
Server.prototype.stop = function () {
  // Close the database connection.
  mongoose.connection.close ();

  // Stop listening for events.
  this.http_.close ();
}

module.exports = exports = Server;