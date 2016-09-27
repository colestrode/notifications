var email = require('./notifications/email');
// var text = require('./notifications/text');
var data = require('./data');
var logger = require('./lib/logger');
var q = require('q');
var transforms = require('./transforms');

module.exports = function() {
  return data.getData()
    .then(transforms)
    .then(function(recipients) {
      return q.all([
        // text.send(recipients),
        email.send(recipients)
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
};




