'use strict'

const GoogleSpreadsheet = require('google-spreadsheet')
const _ = require('lodash')
const q = require('q')
const vars = require('./../lib/vars')
const dataSheet = new GoogleSpreadsheet(vars.google.spreadsheet)
const authorize = q.nbind(dataSheet.useServiceAccountAuth, dataSheet)
const getSheetInfo = q.nbind(dataSheet.getInfo, dataSheet)

/**
 * Gets patient info from a Google Spreadsheet
 */
module.exports.getRecpientData = function () {
  return authorize({'client_email': vars.google.email, 'private_key': vars.google.privateKey})
    .then(getSheetInfo)
    .then((info) => {
      const worksheet = _.find(info.worksheets, {title: 'recipients'})
      const getRows = q.nbind(worksheet.getRows, worksheet)

      return getRows({
        offset: 0,
        limit: 1000
      })
    }).then((rows) => {
      return _.map(rows, function (row) {
        const r = _.cloneDeep(row)

        delete r._xml
        delete r._links
        delete r.save
        delete r.del

        r.fullname = makeFullname(row)
        return r
      })
    })
}

/**
 * Formats the patients first and last name into a full name
 * @param patient
 * @returns {string}
 */
function makeFullname (patient) {
  const name = []

  if (patient.firstname) {
    name.push(patient.firstname)
  }

  if (patient.lastname) {
    name.push(patient.lastname)
  }
  return name.join(' ')
}

