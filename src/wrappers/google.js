var google = require('googleapis');
var gCalendar = google.calendar('v3');
var GoogleSpreadsheet = require('google-spreadsheet');
var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var privateKey = process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n');

module.exports.getData = function() {
  return q.all([getSheetData(), getCalendarEvents()])
    .spread(function(patients, appointments) {
      // loop through events, if matches a patient, clone patient data and merge with event data
      //
      return patients;
    });
};

function getSheetData() {
  var mySheet = new GoogleSpreadsheet(process.env.G_SPREADSHEET);
  var auth = q.nbind(mySheet.useServiceAccountAuth, mySheet);

  return auth({client_email: process.env.G_EMAIL, private_key: privateKey})
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
}

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


function getCalendarEvents() {
  var ids = process.env.G_CALENDAR_IDS.split(',');
  var jwtClient = new google.auth.JWT(process.env.G_EMAIL, null, privateKey, ['https://www.googleapis.com/auth/calendar.readonly'], null);

  return q.all(_.map(ids, _.partial(getEvents, jwtClient)))
    .then(function(eventsByCalendar) {
      var allEvents = [];
      _.forEach(eventsByCalendar, function(events) {
        allEvents = allEvents.concat(events);
      });

      return allEvents
    });
}

function getEvents(jwtClient, calendarId) {
  var listEvents = q.nbind(gCalendar.events.list, gCalendar.events);

  // will return up to 250 events, this should be plenty :D
  return listEvents({
    auth: jwtClient,
    calendarId: calendarId,
    timeMin: moment.utc().startOf('hour').toISOString(),
    timeMax: moment.utc().add(1, 'weeks').endOf('day').toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  }).then(function(response) {
    var events = response[0].items;
    var creatorEvents = _.filter(events, function(event) {
      return event.creator.email === process.env.G_CALENDAR_CREATOR;
    });

    return _.map(creatorEvents, function(event) {
      return {
        eventStart: moment(event.start.dateTime),
        eventEnd: moment(event.end.dateTime),
        eventCreated: moment(event.created),
        eventUpdated: moment(event.updated),
        eventSummary: event.summary
      }
    });
  });
}
