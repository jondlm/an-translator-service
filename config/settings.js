var n = require('nconf');
var r = require('project-base');
var path = require('path');

var defaults = { // aka development
  port: 8081,
  dbPath: r+'mydb'
};

//
// Overrides
// -------------------------------------
var allOverrides = {
  qa: {},
  integration: {},
  production: {},
  prime: {}
};

// If the machine has the env var `NODE_ENV` set then load its overrides
var overrides = {};
if (process.env.NODE_ENV) {
  overrides = allOverrides[process.env.NODE_ENV];
}

// Load configuration
n.env({ separator: '__' })
 .add('overrides', { type: 'literal', store: overrides })
 .defaults(defaults);

//
// Export the combined settings
// -------------------------------------
module.exports = n.get();

