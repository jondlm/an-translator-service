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
    handler: applicationController.index,
    config: {
      cors: true
    }
  },
  {
    method: 'GET',
    path: '/keys',
    handler: keysController.list,
    config: {
      cors: true
    }
  },
  {
    method: 'GET',
    path: '/keys/destroy_all',
    handler: keysController.destroyAll,
    config: {
      cors: true
    }
  },
  {
    method: 'POST',
    path: '/keys/bulk',
    handler: keysController.bulk,
    config: {
      cors: true
      // TODO: validate array
    }
  },
  {
    method: 'POST',
    path: '/keys/{key}',
    handler: keysController.create,
    config: {
      cors: true,
      validate: {
        payload: {
          language_code: Joi.string().lowercase().required().default('en'),
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
      cors: true,
      validate: {
        payload: {
          language_code: Joi.string().lowercase().required().default('en'),
        }
      }
    }
  }
];
