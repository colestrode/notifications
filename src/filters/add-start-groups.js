var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var now = moment().startOf('minute');

module.exports = function(users) {
  return q.all(_.map(users, function(user) {
    user.isNew = user.eventCreated.isBetween(subtractHours(now, 1), now);
    user.oneDay = user.eventStart.isBetween(addHours(now, 23), addHours(now, 24));
    user.twoDays = user.eventStart.isBetween(addHours(now, 47), addHours(now, 48));
    user.threeDays = user.eventStart.isBetween(addHours(now, 71), addHours(now, 72));
    return user;
  }));
};

function subtractHours(start, hours) {
  return moment(start).subtract(hours, 'hours');
}

function addHours(start, hours) {
  return moment(start).add(hours, 'hours');
}
