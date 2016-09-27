var _ = require('lodash');
var q = require('q');
var events = require('./events');
var recipientData = require('./recipient-data');

/**
 * Gets all upcoming appointments with recipient info
 *
 * @returns {Function|*}
 */
module.exports.getData = function() {
  return q.all([events.getEvents(), recipientData.getRecpientData()]).spread(mergeSheetData);
};

/**
 * Merges appointment with patient info
 * @param events
 * @param recipientData
 * @returns {Array}
 */
function mergeSheetData(events, recipientData) {
  var mergedData = [];

  _.forEach(events, function(appointment) {
    var patient = _.find(recipientData, function(recipient) {
      return new RegExp('^' + recipient.id + '$|\\s' + recipient.id + '$', 'i').test(appointment.eventSummary);
    });

    if (patient) {
      _.merge(appointment, patient);
      mergedData.push(appointment);
    }
  });

  return mergedData;
}

