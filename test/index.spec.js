'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

describe('Notifications', function() {
  let exitOrig;
  let recipients;
  let transformsMock;
  let dataMock;
  let emailMock;
  let loggerMock;
  let notifier;
  let error;

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
      .then(() => {
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
      .then(() => {
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
      .then(() => {
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
      .then(() => {
        expect(dataMock.getData).to.have.been.called;
        expect(transformsMock).to.have.been.called;
        expect(emailMock.send).to.have.been.called;
        expect(loggerMock.error).to.have.been.calledWith(error);
        expect(process.exit).to.have.been.calledWith(1);
      });
  });
});
