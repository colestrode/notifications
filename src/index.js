var sp = require('./wrappers/sparkpost');
var tw = require('./wrappers/twilio');
var goog = require('./wrappers/google');
var q = require('q');

goog.getCalendarEvents();


/*
return goog.getSheetData()
  .then(function (users) {
    return q.all([tw.send(users), sp.send(users)]);
  })
  .then(function() {
    console.log('done!');
    process.exit(0);
  })
  .catch(function(err) {
    console.log('there was an error!');
    console.log(err);
    process.exit(1);
  });
*/




