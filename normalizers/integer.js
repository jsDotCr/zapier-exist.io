// Exist.io API Reference: attribute value type 0
const joi = require('joi')
const { parse } = require('./toNumber')

let schema = joi.number().positive().integer().required()
const sample = '65'

function integerNormalizer (value, schemaExtras) {
  return parse(value, schema, schemaExtras)
}

exports.normalizer = integerNormalizer
exports.inputField = {
  key: 'value',
  type: 'number',
  label: 'Measurement value',
  helpText: 'Positive integer number',
  placeholder: sample,
  required: true
}
exports.sample = sample
