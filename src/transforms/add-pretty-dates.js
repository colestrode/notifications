'use strict';

const _ = require('lodash');
const q = require('q');

module.exports = function(recipients) {
  return q.all(_.map(recipients, (recipient) => {
    recipient.prettyEventStartTime = recipient.eventStart.format('h:mm A');
    recipient.prettyEventStartDate = recipient.eventStart.format('dddd[,] MMMM Do');
    return recipient;
  }));
};
