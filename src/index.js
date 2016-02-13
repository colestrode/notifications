var sp = require('./wrappers/sparkpost');
var tw = require('./wrappers/twilio');
var goog = require('./wrappers/google');
var _ = require('lodash');

goog.getSheetData()
  .then(function(rows) {
    _.forEach(rows, notify);
  })
  .then(function() {
    console.log('done!');
  })
  .catch(function(err) {
    console.log('there was an error!');
    console.log(err);
  });


function notify(user) {
  if (user.phonenumber) {
    tw.send(user.phonenumber);
  }

  if (user.email) {
    sp.send([{
      address: { name: user.fullname, email: user.email}
    }]);
  }
}

