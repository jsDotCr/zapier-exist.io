const joi = require('joi')
const { DateTime } = require('luxon')

const schema = joi.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'iso date').required()
const sample = '2018-02-17'

function dateNormalizer (value, { name = 'unknown', key = 'date' } = {}) {
  let isoDate = DateTime.fromISO(value, { setZone: true })
  if (Number.isInteger(value) && !isoDate.isValid) {
    isoDate = DateTime.fromMillis(value, { setZone: true })
  }
  if (!isoDate.isValid) {
    isoDate = DateTime.fromRFC2822(String(value), { setZone: true })
  }
  return joi.attempt(isoDate.toISODate(), schema)
}

exports.normalizer = dateNormalizer
exports.inputField = {
  key: 'date',
  label: 'Date',
  helpText: 'Measurement date (can also be a full ISO date(time), an RFC2822-compliant string, or a Unix timestamp: it will be converted in exist.io\'s format "YYYY-MM-DD" for you)',
  placeholder: sample,
  type: 'string',
  required: true
}
exports.sample = sample
