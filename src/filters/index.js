var q = require('q');
var _ = require('lodash');

/**
 * Filters can modify or remove any user in the array. They should handle empty arrays.
 * Each filter should be exported as a function that accepts an array of users and returns a promise that resolves
 * with the new modified array of users. This could be the array that was passed in or a new array.
 * Most filters will be synchronous, but they should return a promise to support possible asychronous handling in the future.
 *
 * @param users
 * @returns {*}
 */
module.exports = function(users) {
  _.each(users, function(user) {
    user.sendEmail = false;
    user.sendText = false;
  });

  return q(users);
};
