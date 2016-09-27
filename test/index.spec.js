'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

describe('Notifications', function() {
  var exitOrig;
  var recipients;
  var transformsMock;
  var dataMock;
  var emailMock;
  var loggerMock;
  var notifier;
  var error;

  beforeEach(function() {
    exitOrig = process.exit;
    process.exit = sinon.stub();

    recipients = [];

    transformsMock = sinon.stub().returnsArg(0);

    dataMock = {
      getData: sinon.stub().resolves(recipients)
    };

    emailMock = {
      send: sinon.stub().resolves()
    };

    loggerMock = {
      warn: sinon.stub(),
      error: sinon.stub()
    };

    error = new Error('OHBOYMORTY');

    notifier = proxyquire('../src', {
      './notifications/email': emailMock,
      './data': dataMock,
      './lib/logger': loggerMock,
      './transforms': transformsMock
    });
  });

  afterEach(function() {
    process.exit = exitOrig;
  });

  it('should send notifications', function() {
    return notifier()
      .then(function() {
        expect(dataMock.getData).to.have.been.called;
        expect(transformsMock).to.have.been.calledWith(recipients);
        expect(emailMock.send).to.have.been.calledWith(recipients);
        expect(loggerMock.warn).to.have.been.called;
        expect(process.exit).to.have.been.calledWith(0);
      });
  });

  it('should log error if getting Google data fails', function() {
    dataMock.getData.rejects(error);
    return notifier()
      .then(function() {
        expect(dataMock.getData).to.have.been.called;
        expect(transformsMock).not.to.have.been.called;
        expect(emailMock.send).not.to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });

  it('should log error if filter fails', function() {
    transformsMock.throws(error);
    return notifier()
      .then(function() {
        expect(dataMock.getData).to.have.been.called;
        expect(transformsMock).to.have.been.called;
        expect(emailMock.send).not.to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });

  it('should log error if sending with SparkPost fails', function() {
    emailMock.send.rejects(error);
    return notifier()
      .then(function() {
        expect(dataMock.getData).to.have.been.called;
        expect(transformsMock).to.have.been.called;
        expect(emailMock.send).to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });
});
