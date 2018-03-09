const { outputFields, update } = require('./api')
const {
  normalizer: dateNormalizer,
  inputField: dateInputField,
  sample: dateSample
} = require('../normalizers/date')
const {
  normalizer: integerNormalizer,
  inputField: integerInputField,
  sample: integerSample
} = require('../normalizers/integer')

const name = 'heartrate'

const createHeartRate = (z, bundle) => {
  const value = integerNormalizer(bundle.inputData.value, { min: 25, max: 220 })
  const date = dateNormalizer(bundle.inputData.date)
  return update({
    name,
    date,
    value,
    z,
    bundle
  })
}

module.exports = {
  key: name,
  noun: 'Heart Rate',

  display: {
    label: 'Add Heart Rate Measurement',
    description: 'Adds a value for the attribute "heartrate" for a given day.'
  },

  operation: {
    inputFields: [
      dateInputField,
      Object.assign({}, integerInputField, {
        helpText: 'Heartrate (positive integer, up to 220)'
      })
    ],
    perform: createHeartRate,
    sample: {
      name,
      date: dateSample,
      value: integerSample
    },
    outputFields
  }
}
