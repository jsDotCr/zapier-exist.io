function percent (value, { name = 'unknown', key = 'unknown' } = {}) {
  if (typeof (value) === 'string' && value.includes(',')) {
    value = value.replace(',', '.')
  }
  const inputValue = Number(value)
  if (inputValue > 0 && inputValue < 1) {
    return inputValue
  }
  if (inputValue >= 1 && inputValue < 100) {
    return inputValue / 100
  }
  if (inputValue === 0 || inputValue >= 100) {
    throw new Error(`${name}: invalid value (${value}) for ${key}. It is supposed to be a percent-like value. A valid value is a number between 1 (included) and 100 (excluded), or 0.01 (included) and 1 (excluded); decimals are allowed (no matter which separator you use)`)
  }

  return inputValue
}

module.exports = percent
