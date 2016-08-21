var _ = require('lodash');
var q = require('q');

module.exports = function(users) {
  return q.all(_.map(users, function(user) {
    user.prettyEventStartTime = user.eventStart.format('hA');
    user.prettyEventStartDate = user.eventStart.format('dddd[,] MMMM Mo');
    return user;
  }));
};
