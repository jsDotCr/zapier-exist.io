const { DateTime } = require('luxon')
const { describe, it, beforeEach, afterEach } = require('mocha')
const nock = require('nock')
const zapier = require('zapier-platform-core')
require('should')

const App = require('../index')
const appTester = zapier.createAppTester(App)
let http

zapier.tools.env.inject()

describe('API attribute update', function () {
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

      appTester(App.creates.body_fat.operation.perform, bundle)
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
              name: 'body_fat',
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
              name: 'body_fat',
              date: '2015-05-20',
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
        name: 'body_fat',
        date: '2015-05-20',
        value: 'Great day playing with the Exist API'
      }
      http
        .post('/1/attributes/acquire/')
        .reply(200, {
          success: [
            {
              name: 'body_fat',
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
        name: attribute,
        date: '2015-05-20',
        value: 'Great day playing with the Exist API'
      }
      http
        .post('/1/attributes/update/')
        .reply(200, {
          success: [
            returningObject
          ],
          failed: []
        })
      appTester(App.creates[attribute].operation.perform, bundle)
        .then(result => {
          result.should.eql(returningObject)
          http.done()
          done()
        })
        .catch(done)
    })
  })
})
