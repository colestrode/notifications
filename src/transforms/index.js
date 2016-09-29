'use strict'

const q = require('q')
const _ = require('lodash')
const transforms = require('require-all')({
  dirname: __dirname,
  recursive: true
})

delete transforms.index

/**
 * Transforms can modify or remove any recipient in the array. They should handle empty arrays.
 * Each filter should be exported as a function that accepts an array of recipients and returns a promise that resolves
 * with the new modified array of recipients. This could be the array that was passed in or a new array.
 * Most transforms will be synchronous, but they should return a promise to support possible asychronous handling in the future.
 *
 * @param recipients
 * @returns {*}
 */
module.exports = function (recipients) {
  // processes transforms in series
  return _.reduce(transforms, (promise, filter) => {
    return promise.then(filter)
  }, q(recipients))
}
