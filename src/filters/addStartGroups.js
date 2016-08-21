var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var now = moment().startOf('minute');

module.exports = function(users) {
  return q.all(_.map(users, function(user) {
    user.isNew = user.eventCreated.isBetween(subtractHours(now, 1), now);
    user.oneDay = user.eventCreated.isBetween(subtractHours(now, 24), subtractHours(now, 23));
    user.twoDays = user.eventCreated.isBetween(subtractHours(now, 48), subtractHours(now, 47));
    user.threeDays = user.eventCreated.isBetween(subtractHours(now, 72), subtractHours(now, 71));
    return user;
  }));
};

function subtractHours(start, hours) {
  return moment(start).subtract(hours, 'hours');
}
