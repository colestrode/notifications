//require the Twilio module and create a REST client
var q = require('q');
var _ = require('lodash');
var logger = require('../lib/logger');
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var sendMessage = q.nbind(client.sendMessage, client);
var compiledTemplate = _.template(require('../templates/text-reminder.json').template);

/**
 * Sends text messages to an array of recipients
 *
 * @param recipients
 * @returns {*}
 */
module.exports.send = function(recipients) {
  return q.all(_.map(recipients, sendOne))
    .then(function(counts) {
      logger.info('text message sent to ' + _.sum(counts) + ' recipients.');
    });
};

/**
 * Sends a text message to a single recipient
 *
 * @param recipient
 */
function sendOne(recipient) {
  if (!recipient.sendText) {
    return q(0);
  }

  return sendMessage({
    to: '+1' + sanitizeNumber(recipient.phonenumber),
    from: process.env.TWILIO_NUMBER,
    body: compiledTemplate(recipient)
  }).then(function() {
    return 1;
  })
  .catch(function(err) {
    logger.error('error sending text to recipient ' + recipient.id);
    logger.error(err);
    return 0;
  });
}

function sanitizeNumber(phonenumber) {
  return phonenumber.replace(/(-)*(\.)*(\s)*/g, '');
}
