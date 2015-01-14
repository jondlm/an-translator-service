
module.exports.onRequest = function(request, reply) {
  var payload = '';

  // Inspect the body if there is one
  request.on('peek', function(chunk) { payload += chunk; });
  request.on('finish', function() {

    // Setup payload logging tags
    var pTags = ['payload'];

    // Attempt to exclude anything named "password" from the logs
    if (payload && /password/i.test(payload)) {
      try {
        var obj = JSON.parse(payload);
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && /password/i.test(key)){
            obj[key] = '<removed from logs>';
          }
        }
        request.server.log(pTags, request.method + ' received ' + JSON.stringify(obj) + ' to ' );
      } catch(e) {
        request.server.log(pTags, request.method + ' received. Payload ommitted because it has a password in it and we werent able to JSON parse it');
      }
    } else {
      request.server.log(pTags, request.method + ' received ' + payload);
    }
  });

  return reply.continue(); // continue with the response

};

module.exports.onPreResponse = function(request, reply) {
  var msec = Date.now() - request.info.received;
  msec = '(' + msec + 'ms)';

  request.server.log('response', [request.method, request.path, request.response.statusCode, msec].join(' '));

  return reply.continue(); // continue with the response
};
