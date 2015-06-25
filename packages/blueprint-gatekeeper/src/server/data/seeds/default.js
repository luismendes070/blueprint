var async       = require ('async')
  , AccessToken = require ('../../lib/models/oauth2/accessToken')
  , Account     = require ('../../lib/models/account')
  , Client      = require ('../../lib/models/oauth2/client')
  ;

var users = [
  { username: 'john.doe@test.me', password: '123456789' },
  { username: 'jack.black@test.me', password: '0987654321' },
];

var clients = [
  {name: 'Test Client 1', secret: 'abc123', redirect_uri: 'http://localhost:5000/client1/redirect'},
  {name: 'Test Client 2', secret: 'xyz890', redirect_uri: 'http://localhost:5000/client2/redirect'},
  {name: 'Test Client 3 (disabled)', secret: 'xyz890', redirect_uri: 'http://localhost:5000/client3/redirect', disabled: true},
  {name: 'Test Client 4 (direct login)', secret: '12xdft', redirect_uri: 'http://localhost:5000/client4/redirect', direct_login: true}
];

exports.data = {
  users   : users,
  clients : clients
};

exports.seed = function (opts, done) {
  if (!done) 
    done = opts;

  opts = opts || { };

  // Seed the database with users and events that will be used in the test 
  // cases throughout this test suite.
  async.series ([
    function (callback) {
      Account.create (users, function (err, user0, user1) {
        if (err)
          return callback (err);

        users[0].id = user0.id;
        users[1].id = user1.id;
        return callback ();
      });
    },
    function (callback) {
      Client.create (clients, function (err, client1, client2, client3, client4) {
        if (err)
          return callback (err);

        clients[0].id = client1.id;
        clients[1].id = client2.id;
        clients[2].id = client3.id;
        clients[3].id = client4.id;
        
        return callback ();
      });
    }],
    function (err, results) {
      return done (err);
    });
}

exports.unseed = function (done) {
  async.series ([
    function (callback) {
      AccessToken.remove ({}, function (err) { callback (err); });
    },
    function (callback) {
      Client.remove ({}, function (err) { callback (err); });
    },
    function (callback) {
      Account.remove ({}, function (err) { callback (err); });
    }],
    function (err, results) {
      return done (err);
    });
}
