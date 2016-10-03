'use strict'

const _ = require('lodash')
const q = require('q')
const events = require('./events')
const recipientData = require('./recipient-data')

/**
 * Gets all upcoming appointments with recipient info
 *
 * @returns {Function|*}
 */
module.exports.getData = function () {
  return q.all([events.getEvents(), recipientData.getRecpientData()]).spread(mergeSheetData)
}

/**
 * Merges appointment with recipient info
 * @param events
 * @param recipientData
 * @returns {Array}
 */
function mergeSheetData (events, recipientData) {
  const mergedData = []

  _.forEach(events, function (appointment) {
    const recipient = _.find(recipientData, (row) => {
      return new RegExp('^' + row.id + '$|\\s' + row.id + '$', 'i').test(appointment.eventSummary)
    })

    if (recipient) {
      mergedData.push(_.merge(appointment, recipient))
    }
  })

  return mergedData
}

