const { update } = require('./api')
const dateNormalizer = require('../normalizers/date')
const percentNormalizer = require('../normalizers/percent')

const createBodyFat = (z, bundle) => {
  const name = 'body_fat'
  const value = percentNormalizer(bundle.inputData.value, {
    name,
    key: 'value'
  })
  const date = dateNormalizer(bundle.inputData.date, {
    name,
    key: 'date'
  })
  return update({
    name,
    date,
    value,
    z,
    bundle
  })
}

module.exports = {
  key: 'body_fat',
  noun: 'Body Fat',

  display: {
    label: 'Add Body Fat Measurement',
    description: 'Adds a body fat attribute\'s value for a given day.'
  },

  operation: {
    inputFields: [
      {
        key: 'date',
        label: 'Date',
        helpText: 'Measurement date (can also be a full ISO date(time), an RFC2822-compliant string, or a Unix timestamp: it will be converted in exist.io\'s format "YYYY-MM-DD" for you)',
        placeholder: '2018-02-17',
        type: 'string',
        required: true
      },
      {
        key: 'value',
        type: 'number',
        label: 'Measurement value',
        helpText: 'Body fat % - Decimals allowed',
        placeholder: '15.4',
        required: true
      }
    ],
    perform: createBodyFat,
    sample: {
      name: 'body_fat',
      date: '2018-02-17',
      value: '15.4'
    },
    outputFields: [
      {
        key: 'name',
        label: 'Attribute name'
      },
      {
        key: 'date',
        label: 'Measurement date'
      },
      {
        key: 'value',
        label: 'Attribute value'
      }
    ]
  }
}
