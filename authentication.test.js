/* globals describe it before */
const zapier = require('zapier-platform-core')
const nock = require('nock')
require('should')

const App = require('./index')
const appTester = zapier.createAppTester(App)
zapier.tools.env.inject()

describe('oauth2 app', () => {
  before(() => {
    // It's a good idea to store your Client ID and Secret in the environment rather than in code.
    // This works locally via the `export` shell command and in production by using `zapier env`
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      throw new Error('For the tests to run, you need to do `export CLIENT_ID=1234 CLIENT_SECRET=asdf`')
    }
  })

  it('generates an authorize URL', (done) => {
    const bundle = {
      inputData: {
        redirect_uri: 'http://zapier.com/'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    }

    appTester(App.authentication.oauth2Config.authorizeUrl, bundle)
      .then((authorizeUrl) => {
        authorizeUrl.should.equal(`https://exist.io/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=http%3A%2F%2Fzapier.com%2F&response_type=code&scope=read%2Bwrite%2Bappend`)
        done()
      })
      .catch(done)
  })

  it('can fetch an access token', (done) => {
    const bundle = {
      inputData: {
        code: 'one_time_code'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    }
    const accessToken = 'a_token'
    const refreshToken = 'refresh_token'
    nock('https://exist.io/oauth2')
      .post('/access_token')
      .reply(200, {
        access_token: accessToken,
        refresh_token: refreshToken
      })

    appTester(App.authentication.oauth2Config.getAccessToken, bundle)
      .then((result) => {
        result.access_token.should.eql(accessToken)
        result.refresh_token.should.eql(refreshToken)
        done()
      })
      .catch(done)
  })

  it('can refresh the access token', (done) => {
    const bundle = {
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      },
      environment: {
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET
      }
    }
    const accessToken = 'a_new_token'
    const refreshToken = 'a_new_refresh_token'
    nock('https://exist.io/oauth2')
      .post('/access_token')
      .reply(200, {
        access_token: accessToken,
        refresh_token: refreshToken
      })

    appTester(App.authentication.oauth2Config.refreshAccessToken, bundle)
      .then((result) => {
        result.access_token.should.equal(accessToken)
        result.refresh_token.should.equal(refreshToken)
        done()
      })
      .catch(done)
  })

  it('includes the access token in future requests', (done) => {
    const bundle = {
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      }
    }
    nock('https://exist.io/api')
      .get('/1/users/$self/today/')
      .reply(200, {})

    appTester(App.authentication.test, bundle)
      .then((response) => {
        response.status.should.equal(200)
        response.request.headers['Authorization'].should.equal(`Bearer ${bundle.authData.access_token}`)
        done()
      })
      .catch(done)
  })
})
