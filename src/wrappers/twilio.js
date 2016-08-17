//require the Twilio module and create a REST client
var q = require('q');
var _ = require('lodash');
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var sendMessage = q.nbind(client.sendMessage, client);
var compiledTemplate = _.template(require('../templates/text-reminder.json').template);

/**
 * Sends text messages to an array of users
 *
 * @param users
 * @returns {*}
 */
module.exports.send = function(recipients) {
  return q.all(_.map(recipients, sendOne))
    .then(function(counts) {
      console.log('text message sent to ' + _.sum(counts) + ' recipients.');
    });
};

/**
 * Sends a text message to a single user
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
    console.log('error sending text to user ' + recipient.id);
    console.log(err);
    return 0;
  });
}

function sanitizeNumber(phonenumber) {
  return phonenumber.replace(/(-)*(\.)*(\s)*/g, '');
}
