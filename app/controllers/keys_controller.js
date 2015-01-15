var r        = require('project-base');
var level    = require('level');
var settings = require(r+'config/settings.js');

var db = level(settings.dbPath);

module.exports.create = function (request, reply) {
  var key = request.params.key;
  var ln = request.payload.language_code;
  var value = request.payload.value;

  var composite = [ln, key].join('~');

  db.put(composite, value, function (err) {
    if (err) return reply(err);
    return reply({message: 'key saved'});
  });
};

module.exports.list = function (request, reply) {
  var result = [];

  var lnParam = request.url.query.language_code;

  db.createReadStream()
    .on('data', function (data) {
      var split = data.key.split('~');

      var ln = split[0];
      var key = split[1];
      var value = data.value;

      result.push({
        key: key,
        language_code: ln,
        value: value
      });
    })
    .on('error', function (err) {
      return reply(err);
    })
    .on('end', function () {
      // Filter by language if it's a url param
      if (lnParam)
        result = result.filter(function(x) { return x.language_code === lnParam });

      return reply(result);
    });
};

module.exports.destroy = function(request, reply) {
  var key = request.params.key;
  var ln = request.payload.language_code;
  var composite = [ln, key].join('~');

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
