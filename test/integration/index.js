var Lab = require('lab');
var lab = exports.lab = Lab.script();
var _ = require('lodash');

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var expect = Lab.expect;

var server = require('../../index.js');
var helpers = require('./helpers.js');


// Override console.log so console messages dont leak out
console.log = function(){};

before(function(done) {
  helpers.clearAndSeedDb().then(function() {
    done();
  });
});

describe('real idento_admin user', function() {
  var injector = {};

  beforeEach(function(done) {
    injector = {
      url: '/',
      headers: {
        'Authorization': 'Basic am9obkBzbWl0aC5jb206bXlfcGFzc3dvcmQ=' // john@smith.com:my_password
      }
    };
    done();
  });

  it('should succeed with a GET to /', function(done) {
    server.inject(injector, function(res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should get a single user back from GET /users', function(done) {
    injector.url = '/users';
    server.inject(injector, function(res) {
      var users = JSON.parse(res.payload);
      expect(res.statusCode).to.equal(200);
      expect(users.length).to.equal(2);
      expect(users[0].first_name).to.equal('John');
      expect(users[0].roles).to.be.instanceof(Array);
      expect(users[0].roles[0].name).to.equal('idento_admin');
      expect(users[0].session).to.be.instanceof(Object);
      done();
    });
  });

  it('should create a new role with a POST to /roles', function(done) {
    injector.url = '/roles';
    injector.method = 'POST';
    injector.payload = {name: 'my_cool_role', description: 'This is an awesome rolie polie.'};

    server.inject(injector, function(res) {
      expect(res.statusCode).to.equal(200);

      injector.method = 'GET';
      delete injector.payload;

      server.inject(injector, function(res) {
        var roles = JSON.parse(res.payload);
        expect(_.where(roles, { name: 'my_cool_role' })[0].name).to.equal('my_cool_role');
        expect(_.where(roles, { name: 'my_cool_role' })[0].description).to.equal('This is an awesome rolie polie.');
        done();
      });
    });
  });

  it('should allow role assignments with PUTs to /users/{id}/roles/{role_id}', function(done) {
    var user = {};
    var role = {};

    injector.url = '/users';

    server.inject(injector, function(res) {
      user = _.find(JSON.parse(res.payload), {email: 'jane@doe.com'}); // grab jane

      injector.url = '/roles';

      server.inject(injector, function(res) {
        role = _.find(JSON.parse(res.payload), {name: 'my_cool_role'}); // grab the 'my_cool_role' role

        injector.url = '/users/' + user.id + '/roles/' + role.id;
        injector.method = 'PUT';

        server.inject(injector, function(res) {
          var user = JSON.parse(res.payload);

          expect(res.statusCode).to.equal(200);
          expect(_.where(user.roles, {id: role.id})[0].id).to.equal(role.id);
          done();
        });
      });
    });
  });

  // Assumes that jane already has the 'my_cool_role' assigned to her
  it('should allow role removals with DELETEs to /users/{id}/roles/{role_id}', function(done) {
    var user = {};
    var role = {};

    injector.url = '/users';

    server.inject(injector, function(res) {
      user = _.find(JSON.parse(res.payload), {email: 'jane@doe.com'}); // grab jane

      injector.url = '/roles';

      server.inject(injector, function(res) {
        role = _.find(JSON.parse(res.payload), {name: 'my_cool_role'}); // grab the 'my_cool_role' role

        injector.url = '/users/' + user.id + '/roles/' + role.id;
        injector.method = 'DELETE';

        server.inject(injector, function(res) {
          var message = JSON.parse(res.payload).message;

          expect(res.statusCode).to.equal(200);
          expect(message).to.equal('User role successfully removed.');
          done();
        });
      });
    });
  });

});

describe('real idento_validate_tokens user', function() {
  var injector = {};

  beforeEach(function(done) {
    injector = {
      url: '/',
      headers: {
        'Authorization': 'Basic amFuZUBkb2UuY29tOm15X3Bhc3N3b3Jk' // jane@doe.com:my_password
      }
    };
    done();
  });

  it('should not allow a GET to /users', function(done) {
    injector.url = '/users';
    server.inject(injector, function(res) {
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('should allow a login and logout with POST and DELETE to /sessions', function(done) {
    injector.url = '/sessions';
    injector.method = 'POST';
    injector.payload = {email: 'jane@doe.com', password: 'my_password'};

    server.inject(injector, function(res) {
      var sessionWithUser = JSON.parse(res.payload);
      var token = sessionWithUser.token;
      expect(res.statusCode).to.equal(200);

      injector.url = '/sessions/' + token;
      injector.method = 'DELETE';
      delete injector.payload;

      server.inject(injector, function(res) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  it('should not allow a POST to /roles', function(done) {
    injector.url = '/roles';
    injector.method = 'POST';
    injector.payload = {name: 'bad_role', description: 'This role should not be created.'};

    server.inject(injector, function(res) {
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('should allow a login and then retrieval by token', function(done) {
    injector.url = '/sessions';
    injector.method = 'POST';
    injector.payload = {email: 'jane@doe.com', password: 'my_password'};

    server.inject(injector, function(res) {
      var sessionWithUser = JSON.parse(res.payload);
      var token = sessionWithUser.token;
      expect(res.statusCode).to.equal(200);

      injector.url = '/sessions/' + token;
      injector.method = 'GET';
      delete injector.payload;

      server.inject(injector, function(res) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});

describe('unauthorized GETs', function() {
  it('should return a 403 to /', function(done) {
    server.inject('/', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('should return a 403 to /roles', function(done) {
    server.inject('/roles', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('should return a 403 to /users', function(done) {
    server.inject('/users', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('should return a 403 to /users/{id}', function(done) {
    server.inject('/users/12', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('should return a 403 to /sessions', function(done) {
    server.inject('/sessions', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('should return a 403 to /sessions/{token}', function(done) {
    server.inject('/sessions/abc-123', function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
});

describe('sessions', function() {
  var injector = {};

  beforeEach(function(done) {
    injector = {
      url: '/',
      headers: {
        'Authorization': 'Basic am9obkBzbWl0aC5jb206bXlfcGFzc3dvcmQ='
      }
    };
    done();
  });

  it('should create and destroy a session', function(done) {
    injector.url = '/sessions';
    injector.method = 'POST';
    injector.payload = {email: 'john@smith.com', password: 'my_password'};

    server.inject(injector, function(res) {
      var sessionWithUser = JSON.parse(res.payload);
      var token = sessionWithUser.token;
      expect(res.statusCode).to.equal(200);

      injector.url = '/sessions/' + token;
      injector.method = 'DELETE';
      delete injector.payload;

      server.inject(injector, function(res) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

  it('should create a sessions for a valid user', function(done) {
    injector.url = '/sessions';
    injector.method = 'POST';
    injector.payload = {email: 'john@smith.com', password: 'my_password'};

    server.inject(injector, function(res) {
      expect(res.statusCode).to.equal(200);

      var sessionWithUser = JSON.parse(res.payload);

      expect(sessionWithUser.user_id).to.equal(sessionWithUser.user.id);
      expect(sessionWithUser.user.roles.length).to.be.above(0);
      done();
    });
  });
});

describe('invalid url', function() {
  describe('/imnothere', function() {
    it('should return a 404', function(done) {
      server.inject('/imnothere', function(res) {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });
});
