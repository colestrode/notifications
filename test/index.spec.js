'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

describe('Notifications', function() {
  var exitOrig;
  var users;
  var filtersMock;
  var googleMock;
  var sparkPostMock;
  var loggerMock;
  var notifier;
  var error;

  beforeEach(function() {
    exitOrig = process.exit;
    process.exit = sinon.stub();

    users = [];

    filtersMock = sinon.stub().returnsArg(0);

    googleMock = {
      getData: sinon.stub().resolves(users)
    };

    sparkPostMock = {
      send: sinon.stub().resolves()
    };

    loggerMock = {
      warn: sinon.stub(),
      error: sinon.stub()
    };

    error = new Error('OHBOYMORTY');

    notifier = proxyquire('../src', {
      './wrappers/sparkpost': sparkPostMock,
      './wrappers/google': googleMock,
      './lib/logger': loggerMock,
      './filters': filtersMock
    });
  });

  afterEach(function() {
    process.exit = exitOrig;
  });

  it('should send notifications', function() {
    return notifier()
      .then(function() {
        expect(googleMock.getData).to.have.been.called;
        expect(filtersMock).to.have.been.calledWith(users);
        expect(sparkPostMock.send).to.have.been.calledWith(users);
        expect(loggerMock.warn).to.have.been.called;
        expect(process.exit).to.have.been.calledWith(0);
      });
  });

  it('should log error if getting Google data fails', function() {
    googleMock.getData.rejects(error);
    return notifier()
      .then(function() {
        expect(googleMock.getData).to.have.been.called;
        expect(filtersMock).not.to.have.been.called;
        expect(sparkPostMock.send).not.to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });

  it('should log error if filter fails', function() {
    filtersMock.throws(error);
    return notifier()
      .then(function() {
        expect(googleMock.getData).to.have.been.called;
        expect(filtersMock).to.have.been.called;
        expect(sparkPostMock.send).not.to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });

  it('should log error if sending with SparkPost fails', function() {
    sparkPostMock.send.rejects(error);
    return notifier()
      .then(function() {
        expect(googleMock.getData).to.have.been.called;
        expect(filtersMock).to.have.been.called;
        expect(sparkPostMock.send).to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });
});
