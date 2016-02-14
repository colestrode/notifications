//require the Twilio module and create a REST client
var q = require('q');
var _ = require('lodash');
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var sendMessage = q.nbind(client.sendMessage, client);

/**
 * Sends text messages to an array of users
 *
 * @param users
 * @returns {*}
 */
module.exports.send = function(users) {
  return q.all(_.map(users, sendOne))
    .then(function(counts) {
      console.log('text message sent to ' + _.sum(counts) + ' recipients.');
    });
};

/**
 * Sends a text message to a single user
 *
 * @param user
 */
function sendOne(user) {
  if (!user.sendText) {
    return q(0);
  }

  // TODO real message
  return sendMessage({
    to: '+1' + sanitizeNumber(user.phonenumber),
    from: process.env.TWILIO_NUMBER,
    body: 'word to your mother.'
  }).then(function() {
    console.log('text notification sent');
    return 1;
  })
  .catch(function(err) {
    console.log('error sending text to user ' + user.id);
    console.log(err);
  });
}

function sanitizeNumber(phonenumber) {
  return phonenumber.replace(/(-)*(\.)*(\s)*/g, '');
}
