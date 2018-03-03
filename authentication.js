const getAccessToken = (z, bundle) => {
  const promise = z.request(`https://exist.io/oauth2/access_token`, {
    method: 'POST',
    body: {
      code: bundle.inputData.code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: bundle.inputData.redirect_uri
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content)
    }
    return JSON.parse(response.content)
  })
}

const refreshAccessToken = (z, bundle) => {
  const promise = z.request(`https://exist.io/oauth2/access_token`, {
    method: 'POST',
    body: {
      refresh_token: bundle.authData.refresh_token,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })

  return promise.then((response) => {
    if (response.status !== 200) {
      throw new Error('Unable to fetch access token: ' + response.content)
    }

    return JSON.parse(response.content)
  })
}

const testAuth = (z) => {
  const promise = z.request({
    method: 'GET',
    url: 'https://exist.io/api/1/users/$self/today/'
  })

  return promise.then((response) => {
    if (response.status === 401) {
      throw new Error('The access token you supplied is not valid')
    }
    return response
  })
}

module.exports = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: `https://exist.io/oauth2/authorize`,
      params: {
        client_id: '{{process.env.CLIENT_ID}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
        scope: 'read+write'
      }
    },
    getAccessToken: getAccessToken,
    refreshAccessToken: refreshAccessToken,
    autoRefresh: true
  },
  test: testAuth
}
