var request = require ('supertest');
var assert = require ('assert');

var seed = require ('../seeds/default');
var app  = require ('../app');
var auth = require ('../../lib/router/auth');

app.use (auth (app.config.router.auth));

///////////////////////////////////////////////////////////////////////////////
// Begin Test Cases

describe ('router.auth', function () {
  before (function (done) {
    seed.seed (done);
  });

  after (function (done) {
    seed.unseed (done);
  });

  describe ('POST /auth/login', function () {
    var loginClient = seed.data.clients[3];

    /**
     * Test creating an event. This test case will create 4 events that
     * will be used in later test cases.
     */
    it ('should login the user', function (done) {
      user = seed.data.users[0];

      request (app)
        .post ('/auth/login')
        .send ({username: user.username, password: user.password, client: loginClient.id, client_secret: loginClient.secret})
        .expect (200)
        .end (function (err, res) {
          if (err)
            return done (err);

          assert.equal (res.body.token.length, 256);
          assert.equal (res.body.refresh_token.length, 256);

          return done ();
        });
    });

    /**
     * Test logging in a user with an incorrect password. We should be 
     * redirected to the login page.
     */
    it ('should not login user because of incorrect password', function (done) {
      user = seed.data.users[0];

      request (app)
        .post ('/auth/login')
        .send ({username: user.username, password: '1', client: loginClient.id, client_secret: loginClient.secret})
        .expect (302)
        .end (function (err, res) {
          assert.equal (res.headers.location, '/auth/login');
          return done ()
        });
    });
 
    /**
     * Test logging in a user with an incorrect email address. We should be
     * redirected to the login page.
     */
    it ('should not login user because of invalid username', function (done) {
      user = seed.data.users[0];

      request (app)
        .post ('/auth/login')
        .send ({username: 'who@email.me', password: user.password, client: loginClient.id, client_secret: loginClient.secret})
        .expect (302)
        .end (function (err, res) {
          assert.equal (res.headers.location, '/auth/login');
          return done ()
        });
    });
  });

  describe ('GET /auth/logout', function () {
    it ('should logout the user', function (done) {
      var req = request (app).get ('/auth/logout');

      req.expect (302).end (function (err, res) {
        assert.equal (res.headers.location, '/auth/login');
        return done ();
      });
    });
  });
});
