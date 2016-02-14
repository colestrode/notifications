var q = require('q');
var _ = require('lodash');
var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API_KEY, {});

module.exports.send = function(users) {
  var usersToNotify = _.filter(users, 'sendEmail');
  var recipients = _.map(usersToNotify, makeRecipient);

  send(recipients).then(function() {
    console.log('Email notification sent to ' + recipients.length + ' recipients.');
  });
};

function send(recipients) {
  var sendTransmission = q.nbind(client.transmissions.send, client.transmissions);

  if (!recipients.length) {
    return q();
  }

  return sendTransmission({
    transmissionBody: {
      campaignId: 'patient-reminder',
      content: {
        templateId: 'my-first-email'
      },
      recipients: recipients
    },
    'num_rcpt_errors': 10
  });
}

function makeRecipient(user) {
  return {
    address: { name: user.fullname, email: user.email},
    'substitution_data': _.cloneDeep(user)
  };
}
