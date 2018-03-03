const authentication = require('./authentication')
const BodyFatCreate = require('./creates/bodyFat')

const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`
  }
  return request
}

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [
    includeBearerToken
  ],

  afterResponse: [
  ],

  resources: {
  },

  triggers: {
  },

  searches: {
  },

  creates: {
    [BodyFatCreate.key]: BodyFatCreate
  }
}

module.exports = App
