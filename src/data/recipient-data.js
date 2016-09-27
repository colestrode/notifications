var GoogleSpreadsheet = require('google-spreadsheet');
var _ = require('lodash');
var q = require('q');
var vars = require('./../lib/vars');


/**
 * Gets patient info from a Google Spreadsheet
 */
module.exports.getRecpientData = function() {
  var mySheet = new GoogleSpreadsheet(vars.google.spreadsheet);
  var auth = q.nbind(mySheet.useServiceAccountAuth, mySheet);

  return auth({'client_email': vars.google.email, 'private_key': vars.google.privateKey})
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

