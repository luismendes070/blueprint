'use strict';

var winston = require ('winston')
  , path    = require ('path')
  , util    = require ('util')
  ;

var Server            = require ('./Server')
  , RouterBuilder     = require ('./RouterBuilder')
  , Configuration     = require ('./Configuration')
  , Database          = require ('./Database')
  , ApplicationModule = require ('./ApplicationModule')
  , Framework         = require ('./Framework')
  ;

var messaging = Framework ().messaging;

/**
 * @class Application
 *
 * The main Blueprint.js application.
 *
 * @param appPath
 * @constructor
 */
function Application (appPath) {
  ApplicationModule.call (this, appPath);
}

util.inherits (Application, ApplicationModule);

/**
 * Initialize the application.
 */
Application.prototype.init = function () {
  winston.log ('info', 'application path: %s', this.appPath);

  // Load all configurations first. This is because other entities in the
  // application may need the configuration object for initialization.
  var configPath = path.join (this.appPath, 'configs');
  this._config = Configuration (configPath, this.env);

  // Next, load all the listeners. This allows the listeners to receive
  // events about the initialization process.
  this.listeners;

  // Initialize the database object, if a configuration exists. If we
  // have a database configuration, then we can have models.
  if (this._config['database']) {
    this._db = new Database (this._config['database']);
    this._db.setMessenger (messaging);

    // Force loading of the models since we have a database. If there
    // was not database in the application, then we would not load any
    // of the models.
    this.models;
  }

  // Make the server object.
  this._server = new Server (this.appPath, this._config['server']);

  // Make the router for the application. Then, install the router in the
  // server object. Part of loading the routers requires force loading of
  // the controllers. Otherwise, the router builder will not be able to
  // resolve any of the defined actions.
  var routersPath = path.resolve (this.appPath, 'routers');
  var routerBuilder = new RouterBuilder (routersPath, this.controllers);

  this._router = routerBuilder.addRouters (this.routers).getRouter ();

  // Set the main router for the server.
  this._server.setMainRouter (this._router);

  // Notify all listeners the application is initialized.
  messaging.emit ('app.init', this);
};

/**
 * Start the application. This method connects to the database, creates a
 * new server, and starts listening for incoming messages.
 *
 * @param callback
 */
Application.prototype.start = function (callback) {
  var self = this;

  function onConnected (err) {
    if (err)
      return callback (err);

    self._server.listen (function () {
      messaging.emit ('app.start', self);
      process.nextTick (callback);
    });
  }

  // If there is a database, connect to the database. Otherwise, proceed
  // with acting as if we are connected to an imaginary database.
  if (this._db)
    this._db.connect (onConnected);
  else
    onConnected (null);
};

/**
 * Get the application database.
 */
Application.prototype.__defineGetter__ ('database', function () {
  if (!this._db)
    throw new Error ('application did not configure database');

  return this._db;
});

/**
 * Get the application database.
 */
Application.prototype.__defineGetter__ ('config', function () {
  return this._config;
});

/**
 * Get the application server.
 */
Application.prototype.__defineGetter__ ('server', function () {
  if (!this._server)
    throw new Error ('application did not configure server');

  return this._server;
});

module.exports = Application;