const { DateTime } = require('luxon')
const { describe, it, beforeEach, afterEach } = require('mocha')
const nock = require('nock')
const zapier = require('zapier-platform-core')
require('should')

const App = require('../index')
const { operations, operationToHumanReadableAction } = require('./api')
const appTester = zapier.createAppTester(App)
let http

zapier.tools.env.inject()

beforeEach('beforeEach API attribute update', function () {
  http = nock('https://exist.io/api')
    .defaultReplyHeaders({
      'Content-Type': 'application/json'
    })
    .replyContentLength()
})
afterEach('afterEach API attribute update', function () {
  nock.cleanAll()
  http = undefined
})
const bundle = {
  inputData: {
    date: DateTime.fromJSDate(new Date()).toISODate(),
    value: '1'
  }
}

describe('API attribute update', function () {
  describe('isAttributeOwned errors', function () {
    const statusCode = 504
    beforeEach('/owned errors', function () {
      http
        .get('/1/attributes/owned/')
        .once()
        .reply(statusCode, `<html>
        <head><title>${statusCode} Gateway Time-out</title></head>
        <body bgcolor="white">
        <center><h1>${statusCode} Gateway Time-out</h1></center>
        <hr><center>nginx/1.6.2</center>
        </body>
        </html>`)
    })
    it(`rejects with a ${statusCode} status code`, function (done) {
      appTester(App.creates.heartrate.operation.perform, Object.assign({}, bundle, {
        inputData: Object.assign({}, bundle.inputData, {
          value: '50'
        })
      }))
        .catch(result => {
          result.should.be.an.instanceof(Error)
            .and.have.property('status').eql(statusCode)
          http.done()
          done()
        })
    })
  })
  describe('attribute to update is not owned', function () {
    const customBundle = Object.assign({}, bundle, {
      inputData: Object.assign({}, bundle.inputData, {
        name: 'body_fat',
        date: '2015-05-20',
        value: 20
      })
    })
    beforeEach('/owned succeeds with empty response', function () {
      http
        .get('/1/attributes/owned/')
        .reply(200, [])
    })
    it('rejects if attribute ownership acquire fails', function (done) {
      const errorCode = 'error_code'
      http
        .post('/1/attributes/acquire/')
        .reply(202, {
          failed: [
            {
              error: 'could not do this',
              error_code: errorCode
            }
          ]
        })

      appTester(App.creates.body_fat.operation.perform, customBundle)
        .catch(result => {
          result.should.be.an.instanceof(Error)
            .and.have.property('errorCode').eql(errorCode)
          http.done()
          done()
        })
    })
    it('rejects if attribute update fails', function (done) {
      const error = 'Object at index 0 missing field(s) \'value\''
      const errorCode = 'missing_field'
      http
        .post('/1/attributes/acquire/')
        .reply(200, {
          success: [
            {
              name: customBundle.inputData.name,
              active: true
            }
          ],
          failed: []
        })
        .post('/1/attributes/update/')
        .reply(202, {
          success: [],
          failed: [
            {
              name: customBundle.inputData.name,
              date: customBundle.inputData.date,
              error_code: errorCode,
              error
            }
          ]
        })
      appTester(App.creates.body_fat.operation.perform, bundle)
        .catch(result => {
          result.should.be.an.instanceof(Error)
            .and.have.property('status').eql(202)
          result.should.have.property('errorCode').eql(errorCode)
          http.done()
          done()
        })
    })
    it('succeeds if attribute update succeeds', function (done) {
      const returningObject = {
        name: customBundle.inputData.name,
        date: customBundle.inputData.date,
        value: customBundle.inputData.value
      }
      http
        .post('/1/attributes/acquire/')
        .reply(200, {
          success: [
            {
              name: customBundle.inputData.name,
              active: true
            }
          ],
          failed: []
        })
        .post('/1/attributes/update/')
        .reply(200, {
          success: [
            returningObject
          ],
          failed: []
        })
      appTester(App.creates.body_fat.operation.perform, bundle)
        .then(result => {
          result.should.eql(returningObject)
          http.done()
          done()
        })
        .catch(done)
    })
  })
  describe('attribute to update is already owned', function () {
    const attribute = 'meditation_min'
    const customBundle = Object.assign({}, bundle, {
      inputData: Object.assign({}, bundle.inputData, {
        name: attribute
      })
    })
    beforeEach('/owned succeeds with owned attribute', function () {
      http
        .get('/1/attributes/owned/')
        .reply(200, [
          {
            attribute,
            label: attribute,
            value: null,
            service: 'fitbit',
            priority: 1,
            private: false,
            value_type: 0,
            value_type_description: 'Integer'
          }
        ])
    })
    it('does not call the /acquire endpoint, just the /update one', function (done) {
      const returningObject = {
        name: customBundle.inputData.name,
        date: customBundle.inputData.date,
        value: customBundle.inputData.value
      }
      http
        .post('/1/attributes/update/')
        .reply(200, {
          success: [
            returningObject
          ],
          failed: []
        })
      appTester(App.creates[attribute].operation.perform, customBundle)
        .then(result => {
          result.should.eql(returningObject)
          http.done()
          done()
        })
        .catch(done)
    })
  })
})
describe('append tag', function () {
  const attribute = 'custom_tag'
  const customBundle = Object.assign({}, bundle, {
    inputData: Object.assign({}, bundle.inputData, {
      value: 'new_custom_tag'
    })
  })
  it('does not call the update endpoint', function (done) {
    http
      .post('/1/attributes/update/')
      .reply(200, {
        success: [
          customBundle.inputData
        ],
        failed: []
      })
    appTester(App.creates[attribute].operation.perform, customBundle)
      .then(result => {
        done(new Error('should have NOT called "/attributes/update/" endpoint!'))
      })
      .catch(e => done())
  })
  it('calls the custom/append endpoint', function (done) {
    http
      .post('/1/attributes/custom/append/')
      .reply(200, {
        success: [
          customBundle.inputData
        ],
        failed: []
      })
    appTester(App.creates[attribute].operation.perform, customBundle)
      .then(result => {
        http.done()
        done()
      })
      .catch(done)
  })
  it('returns the validated input values back', function (done) {
    const customBundle = Object.assign({}, bundle, {
      inputData: Object.assign({}, bundle.inputData, {
        value: 'New custom tag!'
      })
    })
    const validatedCustomBundle = Object.assign({}, bundle, {
      inputData: Object.assign({}, bundle.inputData, {
        value: 'new_custom_tag'
      })
    })
    http
      .post('/1/attributes/custom/append/', ([ { value } ]) => value === validatedCustomBundle.inputData.value)
      .reply(200, {
        success: [
          validatedCustomBundle.inputData
        ],
        failed: []
      })
    appTester(App.creates[attribute].operation.perform, customBundle)
      .then(result => {
        result.should.eql(validatedCustomBundle.inputData)
        done()
      })
      .catch(done)
  })
  it('handles update failure', function (done) {
    const customBundle = Object.assign({}, bundle, {
      inputData: Object.assign({}, bundle.inputData, {
        value: 'new_custom_tag'
      })
    })
    http
      .post('/1/attributes/custom/append/')
      .reply(202, {
        success: [],
        failed: [
          Object.assign({}, customBundle.inputData, {
            error: 'something',
            error_code: 42
          })
        ]
      })
    appTester(App.creates[attribute].operation.perform, customBundle)
      .then(result => {
        done(new Error('Should not be here!'))
      })
      .catch(e => {
        const errorMessage = operationToHumanReadableAction(operations.ATTRIBUTE_APPEND)
        e.message.should.match(new RegExp(errorMessage))
        done()
      })
  })
})
