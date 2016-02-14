var q = require('q');
var _ = require('lodash');
var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API_KEY, {});

module.exports.send = function(users) {
  var send = q.nbind(client.transmissions.send, client.transmissions);
  var recipients = _.map(users, makeRecipient);

  return send({
    transmissionBody: {
      campaignId: 'patient-reminder',
      content: {
        templateId: 'my-first-email'
      },
      recipients: recipients
    },
    'num_rcpt_errors': 10
  }).then(function() {
    console.log('Email notification sent to ' + recipients.length + ' recipients.');
  });
};

function makeRecipient(user) {
  return {
    address: { name: user.fullname, email: user.email},
    'substitution_data': _.cloneDeep(user)
  };
}
