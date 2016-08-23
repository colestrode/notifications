'use strict';

var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

describe('filter: add-pretty-dates', function() {
  var users;
  var filter;

  beforeEach(function() {
    users = [{
      eventStart: moment('2016-08-22T09:30z')
    }, {
      eventStart: moment('2016-08-21T14:45z')
    }];

    filter = require('../../src/filters/add-pretty-dates');
  });

  it('should add prettyEventStartTime', function() {
    return filter(users)
      .then(function(modifiedUsers) {
        expect(modifiedUsers[0].prettyEventStartTime).to.equal('9:30 AM');
        expect(modifiedUsers[1].prettyEventStartTime).to.equal('2:45 PM');
      });
  });

  it('should add prettyEventStartDate', function() {
    return filter(users)
      .then(function(modifiedUsers) {
        expect(modifiedUsers[0].prettyEventStartDate).to.equal('Monday, August 22nd');
        expect(modifiedUsers[1].prettyEventStartDate).to.equal('Sunday, August 21st');
      });
  });
});
