// Exist.io API Reference: attribute value type 5
const joi = require('joi')
const { toNumber, validate } = require('./toNumber')

const schema = joi.number().greater(0).less(1).required()
const sample = '15.4'

function percentNormalizer (value, schemaExtras) {
  let inputValue = toNumber(value)
  if (inputValue >= 1) {
    inputValue = inputValue / 100
  }
  return validate(inputValue, schema, schemaExtras)
}

exports.normalizer = percentNormalizer
exports.inputField = {
  key: 'value',
  type: 'number',
  label: 'Measurement value',
  helpText: 'Percentage - Decimals allowed',
  placeholder: sample,
  required: true
}
exports.sample = sample
