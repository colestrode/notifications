var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var now = moment().startOf('minute');

module.exports = function(recipients) {
  return q.all(_.map(recipients, function(recipient) {
    recipient.isNew = recipient.eventCreated.isBetween(subtractHours(now, 1), now);
    recipient.oneDay = recipient.eventStart.isBetween(addHours(now, 23), addHours(now, 24));
    recipient.twoDays = recipient.eventStart.isBetween(addHours(now, 47), addHours(now, 48));
    recipient.threeDays = recipient.eventStart.isBetween(addHours(now, 71), addHours(now, 72));
    return recipient;
  }));
};

function subtractHours(start, hours) {
  return moment(start).subtract(hours, 'hours');
}

function addHours(start, hours) {
  return moment(start).add(hours, 'hours');
}
