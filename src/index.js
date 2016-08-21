var sp = require('./wrappers/sparkpost');
// var tw = require('./wrappers/twilio');
var goog = require('./wrappers/google');
var logger = require('./lib/logger');
var q = require('q');
var filters = require('./filters');

return goog.getData()
  .then(filters)
  .then(function(users) {
    return q.all([
      // tw.send(users),
      sp.send(users)
    ]);
  })
  .then(function() {
    logger.warn('done sending notifications!');
    process.exit(0);
  })
  .catch(function(err) {
    logger.error(err);
    process.exit(1);
  });





