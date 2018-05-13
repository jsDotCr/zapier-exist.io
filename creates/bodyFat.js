const { outputFields, update } = require('./api')
const {
  normalizer: dateNormalizer,
  inputField: dateInputField,
  sample: dateSample
} = require('../normalizers/date')
const {
  normalizer: percentNormalizer,
  inputField: percentInputField,
  sample: percentSample
} = require('../normalizers/percent')

const name = 'body_fat'

const createBodyFat = (z, bundle) => {
  const value = percentNormalizer(bundle.inputData.value)
  const date = dateNormalizer(bundle.inputData.date)
  return update({
    name,
    date,
    value,
    z
  })
}

module.exports = {
  key: name,
  noun: 'Body Fat',

  display: {
    label: 'Add Body Fat Measurement',
    description: 'Adds a body fat attribute\'s value for a given day.'
  },

  operation: {
    inputFields: [
      dateInputField,
      Object.assign({}, percentInputField, {
        helpText: 'Body fat % - Decimals allowed'
      })
    ],
    perform: createBodyFat,
    sample: {
      name,
      date: dateSample,
      value: percentSample
    },
    outputFields
  }
}
