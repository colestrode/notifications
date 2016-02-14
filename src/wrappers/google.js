var google = require('googleapis');
var gCalendar = google.calendar('v3');
var GoogleSpreadsheet = require('google-spreadsheet');
var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var mySheet = new GoogleSpreadsheet(process.env.GA_SPREADSHEET);


// TODO narrow Drive scope
var scopes = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/drive'];
var privateKey = process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n');
var jwtClient = new google.auth.JWT(process.env.GA_EMAIL, null, privateKey, scopes, null);


module.exports.getSheetData = function() {
  var auth = q.nbind(mySheet.useServiceAccountAuth, mySheet);

  return auth({client_email: process.env.GA_EMAIL, private_key: privateKey})
    .then(function() {
      var sheetInfo = q.nbind(mySheet.getInfo, mySheet);
      return sheetInfo();
    })
    .then(function(info) {
      var worksheet = _.find(info.worksheets, {title: 'patients'});
      var getRows = q.nbind(worksheet.getRows, worksheet);

      return getRows({
        offset: 0,
        limit: 1000
      });
    }).then(function(rows) {
      return _.map(rows, function(row) {
        var r = _.cloneDeep(row);
        delete r._xml;
        delete r._links;
        delete r.save;
        delete r.del;

        r.fullname = makeFullname(row);
        return r;
      });
    });
};

function makeFullname(user) {
  var name = [];
  if (user.firstname) {
    name.push(user.firstname);
  }

  if (user.lastname) {
    name.push(user.lastname);
  }
  return name.join(' ');
}


module.exports.getCalendarEvents = function() {
  gCalendar.events.list({
    auth: jwtClient,
    calendarId: 'primary', // TODO get real calendar
    timeMin: moment.utc().toISOString(),
    maxResults: 150,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
      }
    }
  });
}
