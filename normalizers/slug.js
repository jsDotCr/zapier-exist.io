// Exist.io API Reference: attribute value type 5
const joi = require('joi')
const snakeCase = require('lodash.snakecase')

const schema = joi.string().token().required()
const sample = 'tag_name'

function slugNormalizer (value) {
  let inputValue = snakeCase(value)
  return joi.attempt(inputValue, schema, `Invalid value "${value}" passed as slug!`)
}

exports.normalizer = slugNormalizer
exports.inputField = {
  key: 'value',
  type: 'string',
  label: 'Slug',
  placeholder: sample,
  required: true
}
exports.sample = sample
