var q = require('q');
var _ = require('lodash');
var logger = require('../lib/logger');
var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API_KEY, {});
var sendTransmission = q.nbind(client.transmissions.send, client.transmissions);

module.exports.send = function(users) {
  var usersToNotify = getUsersToNotify(users);
  var groupedUsers = groupUsers(usersToNotify);
  var templates = _.keys(groupedUsers);

  return q.all(_.map(templates, function(template) {
    return send(template, groupedUsers[template]);
  })).then(function() {
    logger.info('Email notification sent to ' + usersToNotify.length + ' recipients.');
  });
};

/**
 * Given a list of users, returns a new array of users that should be notified.
 *
 * Users that should be notified are either new users or who have an appointment two days from now
 */
function getUsersToNotify(users) {
  return _.filter(users, function(user) {
    return user.isNew || user.twoDays;
  });
}

/**
 * Groups users by template
 */
function groupUsers(users) {
  return _.groupBy(users, function(user) {
    return user.isNew ? 'new-appointment' : 'appointment-reminder';
  });
}

/**
 * Sends an email to a set of users using the given template ID
 */
function send(templateId, users) {
  if (!users.length) {
    return q();
  }

  return sendTransmission({
    transmissionBody: {
      campaignId: 'patient-reminder',
      content: {
        templateId: templateId
      },
      recipients: _.map(users, makeRecipient)
    },
    'num_rcpt_errors': 10
  });
}

/**
 * Formats a user into a SparkPost recipient
 */
function makeRecipient(user) {
  return {
    address: { name: user.fullname, email: user.email},
    'substitution_data': _.cloneDeep(user)
  };
}
