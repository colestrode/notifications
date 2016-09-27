var google = require('googleapis');
var gCalendar = google.calendar('v3');
var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var vars = require('./../lib/vars');


/**
 * Gets all upcoming events for a set of Google calendars
 */
module.exports.getEvents = function() {
  var jwtClient = new google.auth.JWT(vars.google.email, null, vars.google.privateKey, ['https://www.googleapis.com/auth/calendar.readonly'], null);

  return q.all(_.map(vars.google.calendarIds, _.partial(getEvents, jwtClient)))
    .then(function(eventsByCalendar) {
      var allEvents = [];

      _.forEach(eventsByCalendar, function(events) {
        allEvents = allEvents.concat(events);
      });

      return allEvents;
    });
};

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
      // pull events for the creator if creator is defined, else pull all events
      return vars.google.calendarCreator ? event.creator.email === vars.google.calendarCreator : true;
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
