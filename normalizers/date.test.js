/* globals describe, it */
const should = require('should')
const { DateTime } = require('luxon')
const { normalizer: date } = require('./date')

describe('Date normalizer', () => {
  it('accepts a full ISO string', () => {
    date('2018-03-03T17:56:23Z').should.equal('2018-03-03')
  })
  it('accepts a date-only string', () => {
    date('2018-03-03').should.equal('2018-03-03')
  })
  it('accepts a full RFC2822 string', () => {
    date('Thu, 25 Jan 2018 13:23:12 +0100').should.equal('2018-01-25')
  })
  it('accepts a timestamp', () => {
    date(+new Date()).should.equal(DateTime.fromJSDate(new Date()).toISODate())
  })
  it('fails with a null input', () => {
    should.throws(() => date(null), /ValidationError/)
  })
  it('fails with an empty input', () => {
    should.throws(() => date(), /ValidationError/)
  })
  it('fails with an invalid date-like input', () => {
    should.throws(() => date('15/3/2019'), /ValidationError/)
  })
})
