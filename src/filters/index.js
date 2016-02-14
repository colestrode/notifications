var q = require('q');
var _ = require('lodash');

module.exports = function(users) {
  _.each(users, function(user) {
    user.sendEmail = false;
    user.sentText = false;
  });

  return q(users);
};
