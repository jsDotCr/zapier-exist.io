const NO_ATTRIBUTE_OWNERSHIP = 'NO_ATTRIBUTE_OWNERSHIP'
const apiRoot = 'https://exist.io/api/1/attributes'

function getApiUrl (method) {
  return `${apiRoot}/${method}/`
}

function postRequestObject (url, body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    url: getApiUrl(url),
    body: JSON.stringify([body])
  }
}

function throwError ({ message, status, errorCode }) {
  const e = new Error(message)
  e.errorCode = errorCode
  e.status = status
  throw e
}

function handleAttributeResponse (response, { action, name, z }) {
  let content
  if (response.status >= 400) {
    return throwError({
      message: `Could not ${action} of attribute ${name} because ${response.content}`,
      status: response.status
    })
  }
  content = z.JSON.parse(response.content)
  if (response.status === 202 || (content.failed && content.failed.length > 0)) {
    return throwError({
      message: `Could not ${action} of attribute ${name} because ${content.failed[0].error}`,
      status: response.status,
      errorCode: content.failed[0].error_code
    })
  }
  return content
}

function isAttributeOwned (name, {
  z
}) {
  return z.request({
    method: 'GET',
    url: getApiUrl('owned')
  })
    .then(response => {
      const content = handleAttributeResponse(response, {
        action: 'check ownership',
        name,
        z
      })
      const attribute = content
        .find(({ attribute }) => attribute === name)
      if (attribute) {
        return attribute
      }
      return throwError({
        message: `We don't have ownership of ${name}`,
        status: NO_ATTRIBUTE_OWNERSHIP
      })
    })
}

function acquireAttribute (name, {
  z
}) {
  return z.request(
    postRequestObject('acquire', {
      name,
      active: true
    })
  )
    .then(response =>
      handleAttributeResponse(response, {
        action: 'acquire ownership',
        name,
        z
      }).success[0]
    )
}

function updateAttribute (name, date, value, {
  z
}) {
  return z.request(
    postRequestObject('update', {
      name,
      date,
      value
    })
  )
    .then(response =>
      handleAttributeResponse(response, {
        action: 'update',
        name,
        z
      }).success[0]
    )
}

exports.update = function updateAttributeChain ({
  name,
  date,
  value,
  z,
  bundle
}) {
  return isAttributeOwned(name, { z })
    .catch((e) => {
      if (e.status === 202 || e.status === NO_ATTRIBUTE_OWNERSHIP) {
        return acquireAttribute(name, { z })
      }
      throw e
    })
    .then(() => updateAttribute(name, date, value, { z }))
}

exports.outputFields = [
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
