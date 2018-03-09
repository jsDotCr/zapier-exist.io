/* globals describe, it */
const should = require('should')
const { normalizer: float } = require('./float')

describe('Float normalizer', () => {
  describe('Non-numbers', () => {
    it('fails with an empty string', () => {
      should.throws(() => float(''), /ValidationError/)
    })
    it('fails with an empty input', () => {
      should.throws(() => float(), /ValidationError/)
    })
    it('fails with a null input', () => {
      should.throws(() => float(null), /ValidationError/)
    })
  })
  describe('negative numbers', () => {
    it('fails with 0', () => {
      should.throws(() => float('0'), /ValidationError/)
    })
    it('fails with a negative number', () => {
      should.throws(() => float('-1.05'), /ValidationError/)
    })
  })
  describe('positive numbers', () => {
    it('returns a Number', () => {
      float('151.5').should.equal(151.5)
    })
  })
})
