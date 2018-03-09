// Exist.io API Reference: attribute value type 1
const joi = require('joi')
const { parse } = require('./toNumber')

const schema = joi.number().positive().required()
const sample = '65.3'

function floatNormalizer (value, schemaExtras) {
  return parse(value, schema, schemaExtras)
}

exports.normalizer = floatNormalizer
exports.inputField = {
  key: 'value',
  type: 'number',
  label: 'Measurement value',
  helpText: 'Positive number, decimals are allowed',
  placeholder: sample,
  required: true
}
exports.sample = sample
