var me = module.exports;

var r = require('project-base');
var bookshelf = require(r + 'lib/bookshelf.js');
var knex = bookshelf.knex;
var Promise = require(r + 'node_modules/knex/node_modules/bluebird/');

// Models
var Role     = require(r + 'app/models/role.js');
var Session  = require(r + 'app/models/session.js');
var User     = require(r + 'app/models/user.js');
var UserRole = require(r + 'app/models/user_role.js');

// returns a promise
me.clearDb = function() {
  // intentionally leave out `roles` because it is seeded by sqitch
  return knex.raw('truncate table idento.users_roles cascade;')
  .then(function() {
    return knex.raw('truncate table idento.sessions cascade;');
  }).then(function() {
    return knex.raw('truncate table idento.dynamic_fields cascade;');
  }).then(function() {
    return knex.raw('truncate table idento.users cascade;');
  }).then(function() {
    return knex.raw('truncate table idento.roles cascade;');
  })
  .catch(function(e){ console.error(e); });
};

me.seedDb = function() {
  // create a user with "my_password" as the password and the
  // "idento_admin" role
  var identoAdminRoleId;
  var identoValidateTokensRoleId;

  // adapted from http://bookshelfjs.org/#Collection-forge
  var Roles = bookshelf.Collection.extend({
    model: Role
  });

  var roles = Roles.forge([
    { name: 'idento_admin' },
    { name: 'idento_manage_users' },
    { name: 'idento_validate_tokens' }
  ]);

  // create base roles
  return Promise.all(roles.invoke('save')).then(function() {

    // create idento_admin user
    return new Role({ name: 'idento_admin' }).fetch().then(function(role){
      identoAdminRoleId = role.get('id');
      return new User({
        email: 'john@smith.com',
        first_name: 'John',
        last_name: 'Smith',
        password_digest: '$2a$10$EEcmXNwvsXcQV5NGP6tZYuilVvbUVhIfbHwbz1vLdtcIPQsVedjwq' // my_password
      }).save()
    }).then(function(user) {
      return new UserRole({ role_id: identoAdminRoleId, user_id: user.get('id') }).save()
    }).then(function() {
      return new Role({ name: 'idento_validate_tokens' }).fetch();
    }).then(function(role) {
      identoValidateTokensRoleId = role.get('id');

      return new User({
        email: 'jane@doe.com',
        first_name: 'Jane',
        last_name: 'Doe',
        password_digest: '$2a$10$EEcmXNwvsXcQV5NGP6tZYuilVvbUVhIfbHwbz1vLdtcIPQsVedjwq' // my_password
      }).save()
    }).then(function(user) {
      return new UserRole({ role_id: identoValidateTokensRoleId, user_id: user.get('id') }).save()
    });
  });

};

me.clearAndSeedDb = function() {
  return me.clearDb().then(function() {
    return me.seedDb()
  });
};
