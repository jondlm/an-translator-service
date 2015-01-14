
//
// Dependencies
// -------------------------------------
var r = require('project-base');
var Hapi = require('hapi');
var Good = require('good');
var Lout = require('lout');
var logi = require('logi');
var routes = require(r+'config/routes.js');
var settings = require(r+'config/settings.js');
var env = process.env.NODE_ENV;

var server = new Hapi.Server();
server.connection({ port: settings.port });

//
// Hooks
// -------------------------------------
var hooks = require('./config/hooks.js');

server.ext('onRequest', hooks.onRequest);
server.ext('onPreResponse', hooks.onPreResponse);

//
// Logging
// -------------------------------------
server.on('internalError', function(req, err) { logi('error', err); });
server.on('log', function(event, tags) {
  // logi that shiz
  logi(JSON.stringify(event.tags) + ' ' + event.data);
});

//
// Register packs
// -------------------------------------
var packs = [Lout];

server.register(packs, function(err) {

  //
  // Routes
  // -------------------------------------
  server.route(routes);

  //
  // Server start
  // -------------------------------------
  server.start(function() {
    server.log('init', 'Server started at ' + server.info.uri);
  });
});


// Export the server for testing
module.exports = server;

