'use strict';

var util = require ('util')
  ;

var BaseController    = require ('./BaseController')
  , Application       = require ('./Application')
  , ApplicationModule = require ('./ApplicationModule')
  , Messaging         = require ('./Messaging')
  ;

exports.BaseController = BaseController;
exports.ApplicationModule = ApplicationModule;
exports.Messaging = Messaging;

function theApp () {
  return process.mainModule.blueprint;
}

function verifyInitialized () {
  if (!theApp ())
    throw new Error ('Application not initialized; must call Application(appPath) first');
}

/**
 * Get the Schema definition for Blueprint.js models.
 */
Object.defineProperty (exports, 'Schema', {
  enumerable:   true,
  configurable: true,
  get : function () {
    verifyInitialized ();
    return theApp ().database.Schema;
  }
});

/**
 * Get the application for the module. If the application has not been
 * initialized, then an exception is thrown.
 */
Object.defineProperty (exports, 'app', {
  get : function () {
    verifyInitialized ();
    return theApp ();
  }
});

/**
 * Helper method to define different controllers. This method ensures the controller
 * is an instance of BaseController.
 */
exports.controller = function (controller, base) {
  base = base || BaseController;
  util.inherits (controller, base);
};

/**
 * Register a model with the application database.
 *
 * @param name
 * @param schema
 */
exports.model = function (name, schema) {
  verifyInitialized ();
  return theApp ().database.registerModel (name, schema);
}

/**
 * Factory method for creating an Blueprint.js application. The application is installed
 * in the main module.
 *
 * @param appPath
 * @constructor
 */
exports.Application = function (appPath) {
  var app = theApp ();
  if (app) throw new Error ('Application is already initialized');

  // Create a new application.
  app = new Application (appPath);

  // Install the application in the main module. We define it as a property
  // so that it cannot be set.
  Object.defineProperty (process.mainModule, 'blueprint', {
    get : function () { return app; }
  });

  // Initialize the application.
  app.init ();

  return app;
};
