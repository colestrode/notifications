'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();
var _ = require('lodash');

chai.use(require('sinon-chai'));

describe('Wrappers: SparkPost', function() {
  var loggerMock;
  var varsMock;
  var sparkPostMock;
  var sparkpostClientMock;
  var wrapper;

  beforeEach(function() {
    loggerMock = {
      info: sinon.stub()
    };

    varsMock = {
      sparkpost: {
        apiKey: 'SPARKPOST_API_KEY'
      }
    };

    sparkpostClientMock = {
      transmissions: {
        send: sinon.stub().yields()
      }
    };

    sparkPostMock = sinon.stub().returns(sparkpostClientMock);

    wrapper = proxyquire('../../src/notifications/email', {
      sparkpost: sparkPostMock,
      '../lib/logger': loggerMock,
      '../lib/vars': varsMock
    });
  });

  it('should initialize SparkPost client correctly', function() {
    expect(sparkPostMock).to.have.been.calledWith('SPARKPOST_API_KEY');
  });

  it('should group and send to recipients', function() {
    var recipients = [{
      isNew: false,
      twoDays: true,
      fullname: 'Walter White',
      email: 'walterwhite@jpwynnehs.gov',
      secretname: 'heisenberg'
    }, {
      isNew: true,
      twoDays: false,
      fullname: 'Jesse Pinkman',
      email: 'jpinkman69@verizon.net',
      secretname: 'capncook'
    }];

    return wrapper.send(recipients)
      .then(function() {
        var firstCallArg;
        var secondCallArg;
        var recipients;

        expect(sparkpostClientMock.transmissions.send).to.have.been.calledTwice;
        expect(loggerMock.info).to.have.been.calledOnce;

        firstCallArg = sparkpostClientMock.transmissions.send.args[0][0];
        secondCallArg = sparkpostClientMock.transmissions.send.args[1][0];

        expect(_.get(firstCallArg, 'num_rcpt_errors')).to.equal(10);
        expect(_.get(firstCallArg, 'transmissionBody.campaignId')).to.equal('patient-reminder');
        expect(_.get(firstCallArg, 'transmissionBody.content.templateId')).to.equal('appointment-reminder');

        recipients = _.get(firstCallArg, 'transmissionBody.recipients');
        expect(recipients).to.have.length(1);
        expect(_.get(recipients[0], 'address.name')).to.equal('Walter White');
        expect(_.get(recipients[0], 'address.email')).to.equal('walterwhite@jpwynnehs.gov');
        expect(_.get(recipients[0], 'substitution_data')).to.have.any.keys('secretname');

        expect(_.get(secondCallArg, 'num_rcpt_errors')).to.equal(10);
        expect(_.get(secondCallArg, 'transmissionBody.campaignId')).to.equal('patient-reminder');
        expect(_.get(secondCallArg, 'transmissionBody.content.templateId')).to.equal('new-appointment');

        recipients = _.get(secondCallArg, 'transmissionBody.recipients');
        expect(recipients).to.have.length(1);
        expect(_.get(recipients[0], 'address.name')).to.equal('Jesse Pinkman');
        expect(_.get(recipients[0], 'address.email')).to.equal('jpinkman69@verizon.net');
        expect(_.get(recipients[0], 'substitution_data')).to.have.any.keys('secretname');
      });
  });

  it('should send new email over reminder email', function() {
    var firstCallArg;
    var recipients = [{
      isNew: true,
      twoDays: true,
      fullname: 'Walter White',
      email: 'walterwhite@jpwynnehs.gov',
      secretname: 'heisenberg'
    }];

    return wrapper.send(recipients)
      .then(function() {
        expect(sparkpostClientMock.transmissions.send).to.have.been.calledOnce;

        firstCallArg = sparkpostClientMock.transmissions.send.args[0][0];
        expect(_.get(firstCallArg, 'transmissionBody.content.templateId')).to.equal('new-appointment');
      });
  });

  it('should ignore recipients who do not need a new or reminder email', function() {
    var recipients = [{
      isNew: false,
      twoDays: false,
      fullname: 'Walter White',
      email: 'walterwhite@jpwynnehs.gov',
      secretname: 'heisenberg'
    }];

    return wrapper.send(recipients)
      .then(function() {
        expect(sparkpostClientMock.transmissions.send).not.to.have.been.called;
      });
  });

  it('should reject if there is an error', function() {
    var error = new Error('GUSFRING');

    sparkpostClientMock.transmissions.send.yields(error);
    return wrapper.send([{
      isNew: true,
      twoDays: false,
      fullname: 'Walter White',
      email: 'walterwhite@jpwynnehs.gov',
      secretname: 'heisenberg'
    }])
      .then(function() {
        throw new Error('DIDNOTREJECT');
      })
      .catch(function(err) {
        expect(err).to.equal(error);
      });
  });
});
