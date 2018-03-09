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

function isAttributeOwned (name, {
  z
}) {
  return z.request({
    method: 'GET',
    url: getApiUrl('owned')
  })
    .then(response => z.JSON.parse(response.content))
    .then(attributesOwned => {
      const attribute = attributesOwned.filter(({ attribute }) =>
        attribute === name)
      if (attribute.length === 1) {
        return attribute
      }
      throw new Error(`We don't have ownership of ${name}`)
    })
}

function handleAttributeResponse (response, { action, name, z }) {
  if (response.status >= 400) {
    throw new Error(`Could not ${action} of attribute ${name} because ${response.content}`)
  }
  const content = z.JSON.parse(response.content)
  if (response.status === 202) {
    throw new Error(`Could not ${action} of attribute ${name} because ${content.failed[0].error}. Error code: ${content.failed[0].error_code}`)
  }
  return content.success[0]
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
      })
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
      })
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
    .catch(() => acquireAttribute(name, { z }))
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
