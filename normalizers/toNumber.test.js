/* globals describe, it */
const joi = require('joi')
const should = require('should')
const { parse, validate } = require('./toNumber')

describe('Number normalizer', () => {
  describe('parse', () => {
    describe('string values', () => {
      describe('spaces', () => {
        it('removes spaces used as thousand-separator', () => {
          parse('2 120,2').should.equal(2120.2)
        })
      })
      describe('decimal separators', () => {
        it('understands comma as decimal separator', () => {
          parse('20,2').should.equal(20.2)
        })
        it('understands dot as decimal separator', () => {
          parse('31.4').should.equal(31.4)
        })
      })
      it('uses the given schema if defined', () => {
        should.throws(
          () => parse('15.51468', joi.number().multiple(17).required()),
          /ValidationError/
        )
      })
    })

    describe('non-string values', () => {
      it('returns NaN if input is an empty array', () => {
        should.throws(() => parse([]), /ValidationError/)
      })
      it('returns NaN if input is null', () => {
        should.throws(() => parse(null), /ValidationError/)
      })
      it('returns NaN if input is undefined', () => {
        should.throws(() => parse(), /ValidationError/)
      })
    })

    describe('numbers', () => {
      it('leaves a number intact', () => {
        parse(30.5).should.equal(30.5)
      })
      it('leaves an integer intact', () => {
        parse(30).should.equal(30)
      })
    })
  })
  describe('validate', () => {
    it('respects an extra "min" requirement', () => {
      should.throws(() => validate('10', undefined, { min: 15 }), /ValidationError/)
      validate('30', undefined, { min: 15 }).should.equal(30)
    })
    it('respects an extra "max" requirement', () => {
      validate('2', undefined, { max: 15 }).should.equal(2)
      should.throws(() => validate('210', undefined, { max: 15 }), /ValidationError/)
    })
    it('ignores unmapped extra schema options', () => {
      validate('15.51468', undefined, { min: 15, precision: 1 }).should.equal(15.51468)
    })
    it('uses the given schema if defined', () => {
      should.throws(
        () => validate(15.51468, joi.number().multiple(17).required()),
        /ValidationError/
      )
    })
  })
})
