var q = require('q');
var _ = require('lodash');
var filters = require('require-all')({
  dirname:  __dirname,
  recursive: true
});
delete filters.index;

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
  // processes filters in series
  return _.reduce(filters, function(promise, filter) {
    return promise.then(filter);
  }, q(users));
};
