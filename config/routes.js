var r = require('project-base');
var settings = require(r+'config/settings.js');
var Hapi = require('hapi');
var Joi = require('joi');

// Controllers
var applicationController = require(r+'app/controllers/application_controller.js');
var keysController = require(r+'app/controllers/keys_controller.js');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: applicationController.index
  },
  {
    method: 'GET',
    path: '/keys',
    handler: keysController.list
  },
  {
    method: 'GET',
    path: '/keys/destroy_all',
    handler: keysController.destroyAll
  },
  {
    method: 'POST',
    path: '/keys/{key}',
    handler: keysController.create,
    config: {
      validate: {
        payload: {
          language_code: Joi.string().lowercase().required().default('en'),
          region_code: Joi.string().lowercase().required().default('us'),
          value: Joi.string().required()
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/keys/{key}',
    handler: keysController.destroy,
    config: {
      validate: {
        payload: {
          language_code: Joi.string().lowercase().required().default('en'),
          region_code: Joi.string().lowercase().required().default('us')
        }
      }
    }
  }
];
