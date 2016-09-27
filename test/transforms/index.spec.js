'use strict'

const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()
const q = require('q')

describe('filter: index', function () {
  let filter
  let filter1
  let filter2
  let allFilters
  let requireAllMock

  beforeEach(function () {
    filter1 = sinon.spy(function (u) {
      return q(u.concat(['filter1']))
    })
    filter2 = sinon.spy(function (u) {
      return q(u.concat(['filter2']))
    })

    allFilters = {
      'filter1': filter1,
      'filter2': filter2,
      'index': sinon.stub().rejects(new Error('index not removed'))
    }

    requireAllMock = sinon.stub().returns(allFilters)

    filter = proxyquire('../../src/transforms/index', {
      'require-all': requireAllMock
    })
  })

  it('should remove index', function () {
    return filter([])
      .then(() => {
        expect(allFilters.index).not.to.exist
      })
  })

  it('should pass recipients through all filters in sequence', function () {
    return filter([])
      .then((recipients) => {
        expect(recipients).to.have.length(2)
        expect(recipients).to.contain('filter1')
        expect(recipients).to.contain('filter2')
      })
  })

  it('should reject if a filter fails', function () {
    const error = new Error('GUSFRING')

    allFilters.filter1 = sinon.stub().rejects(error)

    return filter([])
      .then(() => {
        throw new Error('should have failed!')
      })
      .catch((err) => {
        expect(err).to.equal(error)
      })
  })
})
