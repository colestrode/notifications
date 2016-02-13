var sp = require('./wrappers/sparkpost');
var tw = require('./wrappers/twilio');

function notify(user) {
  tw.send(user.phone);
  sp.send([{
    address: { name: user.name, email: user.email}
  }]);
}
