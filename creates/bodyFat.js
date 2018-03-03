const { update } = require('./api')

const createBodyFat = (z, bundle) => {
  return update({
    name: 'body_fat',
    date: bundle.inputData.date,
    value: bundle.inputData.value,
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
        helpText: 'Measurement date using the format "YYYY-MM-DD"',
        placeholder: '2018-02-17',
        type: 'string',
        required: true
      },
      {
        key: 'value',
        type: 'number',
        label: 'Measurement',
        helpText: 'Body fat % - Decimals allowed, using dot notation',
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
