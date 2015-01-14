var settings = require('../config/settings.js');
var Hapi = require('hapi');
var Joi = require('joi');

// Controllers
var applicationController = require('../app/controllers/application_controller.js');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: applicationController.index
  }
];
