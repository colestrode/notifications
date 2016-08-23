'use strict';

var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');

describe('filter: add-start-groups', function() {
  var users;
  var filter;

  function daysAhead(days) {
    return moment().add(days, 'days').subtract(15, 'minutes');
  }

  beforeEach(function() {
    users = [{
      eventCreated: moment().subtract(10, 'minutes'),
      eventStart: daysAhead(1)
    }, {
      eventCreated: moment().subtract(2, 'days'),
      eventStart: daysAhead(2)
    }, {
      eventCreated: moment().subtract(2, 'days'),
      eventStart: daysAhead(3)
    }, {
      eventCreated: moment().subtract(2, 'days'),
      eventStart: daysAhead(5)
    }];

    filter = require('../../src/filters/add-start-groups');
  });

  it('should set isNew for new appointments', function() {
    return filter(users)
      .then(function(modifiedUsers) {
        expect(modifiedUsers[0].isNew, 'firstUser').to.be.true;
        expect(modifiedUsers[1].isNew, 'secondUser').to.be.false;
        expect(modifiedUsers[2].isNew, 'thirdUser').to.be.false;
        expect(modifiedUsers[3].isNew, 'fourthUser').to.be.false;
      });
  });

  it('should set days ahead properties correctly', function() {
    return filter(users)
      .then(function(modifiedUsers) {
        expect(modifiedUsers[0].oneDay, 'first oneDay').to.be.true;
        expect(modifiedUsers[0].twoDays, 'first twoDays').to.be.false;
        expect(modifiedUsers[0].threeDays, 'first threeDays').to.be.false;

        expect(modifiedUsers[1].oneDay, 'second oneDay').to.be.false;
        expect(modifiedUsers[1].twoDays, 'second twoDays').to.be.true;
        expect(modifiedUsers[1].threeDays, 'second threeDays').to.be.false;

        expect(modifiedUsers[2].oneDay, 'third oneDay').to.be.false;
        expect(modifiedUsers[2].twoDays, 'third twoDays').to.be.false;
        expect(modifiedUsers[2].threeDays, 'third threeDays').to.be.true;

        expect(modifiedUsers[3].oneDay, 'fourth oneDay').to.be.false;
        expect(modifiedUsers[3].twoDays, 'fourth twoDays').to.be.false;
        expect(modifiedUsers[3].threeDays, 'fouth threeDays').to.be.false;
      });
  });
});
