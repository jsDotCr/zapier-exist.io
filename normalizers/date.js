const { DateTime } = require('luxon')

function date (value, { name = 'unknown', key = 'unknown' } = {}) {
  let isoDate = DateTime.fromISO(value, { setZone: true })
  if (Number.isInteger(value) && !isoDate.isValid) {
    isoDate = DateTime.fromMillis(value, { setZone: true })
  }
  if (!isoDate.isValid) {
    isoDate = DateTime.fromRFC2822(String(value), { setZone: true })
  }
  if (!isoDate.isValid) {
    throw new Error(`${name}: could not recognize the date ${value} for ${key}. Please use an ISO string or an RFC2822-compliant string`)
  }
  return isoDate.toISODate()
}

module.exports = date
