var _ = require('lodash');
var q = require('q');

module.exports = function(users) {
  return q.all(_.map(users, function(user) {
    user.prettyEventStartTime = user.eventStart.format('h:mm A');
    user.prettyEventStartDate = user.eventStart.format('dddd[,] MMMM Do');
    return user;
  }));
};
