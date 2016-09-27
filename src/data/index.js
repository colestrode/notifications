'use strict';

const _ = require('lodash');
const q = require('q');
const events = require('./events');
const recipientData = require('./recipient-data');

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
  const mergedData = [];

  _.forEach(events, function(appointment) {
    const patient = _.find(recipientData, function(recipient) {
      return new RegExp('^' + recipient.id + '$|\\s' + recipient.id + '$', 'i').test(appointment.eventSummary);
    });

    if (patient) {
      _.merge(appointment, patient);
      mergedData.push(appointment);
    }
  });

  return mergedData;
}

