var SparkPost = require('sparkpost');
var client = new SparkPost(process.env.SPARKPOST_API_KEY, {});

module.exports.send = function(recipients) {
  client.transmissions.send({
    transmissionBody: {
      campaignId: 'patient-reminder',
      content: {
        templateId: 'my-first-email'
      },
      recipients: recipients
    },
    'num_rcpt_errors': 10
  }, function(err) {
    if (err) {
      console.log('Error emailing notifications');
      return console.log(err);
    }
    console.log('Email notification sent to ' + recipients.length + ' recipients.');
  });
};
