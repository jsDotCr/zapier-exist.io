/* globals describe it */
const nock = require('nock')
const should = require('should')
const zapier = require('zapier-platform-core')

const App = require('../../index')

const nockApi = nock('https://exist.io/api')
  .defaultReplyHeaders({
    'Content-Type': 'application/json'
  })
  .replyContentLength()
const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('Creates - Body fat', () => {
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
    it('rejects if attribute ownership request fails', done => {
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
  })
})
