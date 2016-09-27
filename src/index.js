'use strict';

const email = require('./notifications/email');
// const text = require('./notifications/text');
const data = require('./data');
const logger = require('./lib/logger');
const q = require('q');
const transforms = require('./transforms');

module.exports = function() {
  return data.getData()
    .then(transforms)
    .then((recipients) => {
      return q.all([
        // text.send(recipients),
        email.send(recipients)
      ]);
    })
    .then(() => {
      logger.warn('done sending notifications!');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
};




