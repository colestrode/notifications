//require the Twilio module and create a REST client
var client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


module.exports.send = function(phoneNumber) {
  //Send an SMS text message
  client.sendMessage({
    to: '+1' + phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: 'word to your mother.'

  }, function(err, responseData) { //this function is executed when a response is received from Twilio
    if (err) {
      console.log('Error sending text notification');
      return console.log(err);
    }

    // "responseData" is a JavaScript object containing data received from Twilio.
    // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
    // http://www.twilio.com/docs/api/rest/sending-sms#example-1

    console.log(responseData);
  });
};
