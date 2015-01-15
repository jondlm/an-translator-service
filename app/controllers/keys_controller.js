var r        = require('project-base');
var level    = require('level');
var settings = require(r+'config/settings.js');

var db = level(settings.dbPath);

module.exports.create = function (request, reply) {
  var key = request.params.key;
  var ln = request.payload.language_code;
  var rg = request.payload.region_code;
  var value = request.payload.value;

  var composite = [ln, rg, key].join('~');

  db.put(composite, value, function (err) {
    if (err) return reply(err);
    return reply({message: 'key saved'});
  });
};

module.exports.list = function (request, reply) {
  var result = [];

  db.createReadStream()
    .on('data', function (data) {
      var split = data.key.split('~');

      var ln = split[0];
      var rg = split[1];
      var key = split[2];
      var value = data.value;

      result.push({
        key: key,
        language_code: ln,
        region_code: rg,
        value: value
      });
    })
    .on('error', function (err) {
      return reply(err);
    })
    .on('end', function () {
      return reply(result);
    });
};

module.exports.destroy = function(request, reply) {
  var key = request.params.key;
  var ln = request.payload.language_code;
  var rg = request.payload.region_code;
  var composite = [ln, rg, key].join('~');

  db.del(composite, function(err) {
    if (err) return reply(err);
    return reply({message: 'successfully deleted'});
  });
}

module.exports.destroyAll = function(request, reply) {
  db.close();

  level.destroy(settings.dbPath, function(err) {
    if (err) return reply(err);
    db = level(settings.dbPath); // re-create the database
    return reply({message: 'all database records deleted'});
  })
}
