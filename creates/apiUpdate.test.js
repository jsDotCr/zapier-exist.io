/* globals describe it */
const nock = require('nock')
const zapier = require('zapier-platform-core')
require('should')

const App = require('../index')

const nockApi = nock('https://exist.io/api')
  .defaultReplyHeaders({
    'Content-Type': 'application/json'
  })
  .replyContentLength()
const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('API attribute update', () => {
  const bundle = {
    inputData: {
      date: '2018-02-18',
      value: '1'
    }
  }
  describe('isAttributeOwned fails', () => {
    nockApi
      .get('/1/attributes/owned/')
      .reply(200, [])
    it('rejects if attribute ownership acquire fails', done => {
      const errorCode = 'error_code'
      nockApi
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
            .and.have.property('message').match(new RegExp(`Error code: ${errorCode}`))
          done()
        })
    })
    it('rejects if attribute update fails', done => {
      const error = 'Object at index 0 missing field(s) \'value\''
      const errorCode = 'missing_field'
      nockApi
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
      nockApi
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
            .and.have.property('message').match(new RegExp(`Error code: ${errorCode}`))
          done()
        })
    })
    it('succeeds if attribute update returns a 200 OK', done => {
      const returningObject = {
        name: 'body_fat',
        date: '2015-05-20',
        value: 'Great day playing with the Exist API'
      }
      nockApi
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
      nockApi
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
          done()
        })
        .catch(done)
    })
  })
})
