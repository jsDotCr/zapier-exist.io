const { outputFields, update } = require('./api')
const {
  normalizer: dateNormalizer,
  inputField: dateInputField,
  sample: dateSample
} = require('../normalizers/date')
const {
  normalizer: floatNormalizer,
  inputField: floatInputField,
  sample: floatSample
} = require('../normalizers/float')

const name = 'weight'

const createWeight = (z, bundle) => {
  const value = floatNormalizer(bundle.inputData.value, { min: 1 })
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
  noun: 'Weight',

  display: {
    label: 'Add Weight Measurement',
    description: 'Adds a value for the attribute "weight" for a given day.'
  },

  operation: {
    inputFields: [
      dateInputField,
      Object.assign({}, floatInputField, {
        helpText: 'Weight (expressed in kg, decimals allowed)'
      })
    ],
    perform: createWeight,
    sample: {
      name,
      date: dateSample,
      value: floatSample
    },
    outputFields
  }
}
