const authentication = require('./authentication')
const BodyFatCreate = require('./creates/bodyFat')
const CustomTagCreate = require('./creates/customTag')
const HeartRateCreate = require('./creates/heartRate')
const MeditationCreate = require('./creates/meditation')
const WeightCreate = require('./creates/weight')

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
  afterResponse: [],
  resources: {},
  triggers: {},
  searches: {},
  creates: {
    [BodyFatCreate.key]: BodyFatCreate,
    [HeartRateCreate.key]: HeartRateCreate,
    [MeditationCreate.key]: MeditationCreate,
    [WeightCreate.key]: WeightCreate,
    [CustomTagCreate.key]: CustomTagCreate
  }
}

module.exports = App
