'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();
var q = require('q');

describe('filter: index', function() {
  var filter;
  var filter1;
  var filter2;
  var allFilters;
  var requireAllMock;

  beforeEach(function() {
    filter1 = sinon.spy(function(u) {
      return q(u.concat(['filter1']));
    });
    filter2 = sinon.spy(function(u) {
      return q(u.concat(['filter2']));
    });

    allFilters = {
      'filter1': filter1,
      'filter2': filter2,
      'index': sinon.stub().rejects(new Error('index not removed'))
    };

    requireAllMock = sinon.stub().returns(allFilters);

    filter = proxyquire('../../src/transforms/index', {
      'require-all': requireAllMock
    });
  });

  it('should remove index', function() {
    return filter([])
      .then(function() {
        expect(allFilters.index).not.to.exist;
      });
  });

  it('should pass recipients through all filters in sequence', function() {
    return filter([])
      .then(function(recipients) {
        expect(recipients).to.have.length(2);
        expect(recipients).to.contain('filter1');
        expect(recipients).to.contain('filter2');
      });
  });

  it('should reject if a filter fails', function() {
    var error = new Error('GUSFRING');

    allFilters.filter1 = sinon.stub().rejects(error);

    return filter([])
      .then(function() {
        throw new Error('should have failed!');
      })
      .catch(function(err) {
        expect(err).to.equal(error);
      });
  });
});
