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

const name = 'meditation_min'

const createMeditation = (z, bundle) => {
  const value = integerNormalizer(bundle.inputData.value, { max: 60 * 24 })
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
  noun: 'Meditation Period',

  display: {
    label: 'Add Meditation Period',
    description: 'Adds a value for the attribute "meditation" for a given day.'
  },

  operation: {
    inputFields: [
      dateInputField,
      Object.assign({}, integerInputField, {
        helpText: 'Meditation, in minutes (integers only)'
      })
    ],
    perform: createMeditation,
    sample: {
      name,
      date: dateSample,
      value: integerSample
    },
    outputFields
  }
}
