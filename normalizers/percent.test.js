/* globals describe, it */
const should = require('should')
const { normalizer: percent } = require('./percent')

describe('Percent normalizer', () => {
  describe('numbers between 0 and 1', () => {
    it('fails with 0', () => {
      should.throws(() => percent('0'), /ValidationError/)
    })
    it('leaves 0 < n < 1 unchanged', () => {
      percent('0.5').should.equal(0.5)
    })
  })

  describe('numbers between 1 and 100', () => {
    it('divides 1 by 100', () => {
      percent('1').should.equal(0.01)
    })
    it('accepts a string with the percent sign', () => {
      percent('18.5%').should.equal(0.185)
    })
    it('divides 99 by 100', () => {
      percent('99').should.equal(0.99)
    })
    it('fails with 100', () => {
      should.throws(() => percent('100'), /ValidationError/)
    })
    it('fails with a number > 100', () => {
      should.throws(() => percent('875'), /ValidationError/)
    })
  })
  describe('decimal separator', () => {
    it('works with the dot', () => {
      percent('30.5').should.equal(0.305)
    })
    it('works with the comma', () => {
      percent('30,5').should.equal(0.305)
    })
  })
})
