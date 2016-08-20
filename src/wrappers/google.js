var google = require('googleapis');
var gCalendar = google.calendar('v3');
var GoogleSpreadsheet = require('google-spreadsheet');
var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var privateKey = process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n');

/**
 * Gets all upcoming appointments with patient info
 *
 * @returns {Function|*}
 */
module.exports.getData = function() {
  return q.all([getCalendarEvents(), getSheetData()]).spread(mergeSheetData);
};

/**
 * Merges appointment with patient info
 * @param appointments
 * @param patients
 * @returns {Array}
 */
function mergeSheetData(appointments, patients) {
  var mergedData = [];

  _.forEach(appointments, function(appointment) {
    var patient = _.find(patients, function(patient) {
      return new RegExp('^' + patient.id + '$|\\s' + patient.id + '$', 'i').test(appointment.eventSummary);
    });

    if (patient) {
      _.merge(appointment, patient);
      mergedData.push(appointment);
    }
  });

  return mergedData;
}

/**
 * Gets patient info from a Google Spreadsheet
 */
function getSheetData() {
  var mySheet = new GoogleSpreadsheet(process.env.G_SPREADSHEET);
  var auth = q.nbind(mySheet.useServiceAccountAuth, mySheet);

  return auth({'client_email': process.env.G_EMAIL, 'private_key': privateKey})
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

/**
 * Formats the patients first and last name into a full name
 * @param patient
 * @returns {string}
 */
function makeFullname(patient) {
  var name = [];

  if (patient.firstname) {
    name.push(patient.firstname);
  }

  if (patient.lastname) {
    name.push(patient.lastname);
  }
  return name.join(' ');
}

/**
 * Gets all upcoming events for a set of Google calendars
 */
function getCalendarEvents() {
  var ids = process.env.G_CALENDAR_IDS.split(',');
  var jwtClient = new google.auth.JWT(process.env.G_EMAIL, null, privateKey, ['https://www.googleapis.com/auth/calendar.readonly'], null);

  return q.all(_.map(ids, _.partial(getEvents, jwtClient)))
    .then(function(eventsByCalendar) {
      var allEvents = [];

      _.forEach(eventsByCalendar, function(events) {
        allEvents = allEvents.concat(events);
      });

      return allEvents;
    });
}

/**
 * Gets all upcoming events for a single Google calendar
 * @param jwtClient The auth client
 * @param calendarId
 */
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
      var startDate = moment(event.start.dateTime);

      return {
        eventStart: startDate,
        eventEnd: moment(event.end.dateTime),
        eventCreated: moment(event.created),
        eventUpdated: moment(event.updated),
        eventSummary: event.summary
      };
    });
  });
}
