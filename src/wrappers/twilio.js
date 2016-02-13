//require the Twilio module and create a REST client
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports.send = function(phoneNumber) {
  //Send an SMS text message
  client.sendMessage({
    to: '+1' + phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: 'word to your mother.'

  }, function(err) {
    if (err) {
      console.log('Error sending text notification');
      return console.log(err);
    }

    console.log('text notification sent');
  });
};
