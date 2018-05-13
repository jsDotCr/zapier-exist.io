const { tagOutputFields: outputFields, append } = require('./api')
const {
  normalizer: dateNormalizer,
  inputField: dateInputField,
  sample: dateSample
} = require('../normalizers/date')
const {
  normalizer: slugNormalizer,
  inputField: slugInputField,
  sample: slugSample
} = require('../normalizers/slug')

const appendCustomTag = (z, bundle) => {
  const value = slugNormalizer(bundle.inputData.value)
  const date = dateNormalizer(bundle.inputData.date)
  return append({
    date,
    value,
    z
  })
}

module.exports = {
  key: 'custom_tag',
  noun: 'Custom tag',

  display: {
    label: 'Add Custom Tag',
    description: 'Adds a custom tag for a given day.'
  },

  operation: {
    inputFields: [
      dateInputField,
      Object.assign({}, slugInputField, {
        label: 'Tag to append'
      })
    ],
    perform: appendCustomTag,
    sample: {
      date: dateSample,
      value: slugSample
    },
    outputFields
  }
}
