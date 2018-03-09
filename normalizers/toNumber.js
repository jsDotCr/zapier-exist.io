// Exist.io API Reference: attribute value type 0, 1, or 5
const joi = require('joi')

const defaultSchema = joi.number().positive().required()

function toNumber (value) {
  if (typeof (value) === 'string') {
    return value.replace(/[\s%]/g, '').replace(',', '.')
  }
  return Number(value)
}

function validate (value, basicSchema = defaultSchema, schemaExtras = {}) {
  const validationSchema = Object.keys(schemaExtras)
    .reduce((schema, type) => {
      switch (type) {
        case 'min':
          return schema.min(schemaExtras[type])
        case 'max':
          return schema.max(schemaExtras[type])
        default:
          return schema
      }
    }, basicSchema)

  return joi.attempt(value, validationSchema)
}

function parse (value, basicSchema, schemaExtras) {
  return validate(toNumber(value), basicSchema, schemaExtras)
}

exports.toNumber = toNumber
exports.validate = validate
exports.parse = parse
