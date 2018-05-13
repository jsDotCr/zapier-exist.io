const NO_ATTRIBUTE_OWNERSHIP = 'NO_ATTRIBUTE_OWNERSHIP'
const ATTRIBUTE_CREATE = 'ATTRIBUTE_CREATE'
const ATTRIBUTE_APPEND = 'ATTRIBUTE_APPEND'
const ATTRIBUTE_OWNERSHIP_CHECK = 'ATTRIBUTE_OWNERSHIP_CHECK'
const ATTRIBUTE_OWNERSHIP_ACQUIRE = 'ATTRIBUTE_OWNERSHIP_ACQUIRE'
const apiRoot = 'https://exist.io/api/1/attributes'

const operations = {
  ATTRIBUTE_APPEND,
  ATTRIBUTE_CREATE,
  ATTRIBUTE_OWNERSHIP_CHECK,
  ATTRIBUTE_OWNERSHIP_ACQUIRE
}

function getApiUrl (operation) {
  const operationToUrl = {
    ATTRIBUTE_OWNERSHIP_CHECK: 'owned',
    ATTRIBUTE_OWNERSHIP_ACQUIRE: 'acquire',
    ATTRIBUTE_CREATE: 'update',
    ATTRIBUTE_APPEND: 'custom/append'
  }
  return `${apiRoot}/${operationToUrl[operation]}/`
}

function postRequestObject (operation, body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    url: getApiUrl(operation),
    body: JSON.stringify([body])
  }
}

function throwError ({ message, status, errorCode }) {
  const e = new Error(message)
  e.errorCode = errorCode
  e.status = status
  throw e
}

function operationToHumanReadableAction (operation, name) {
  const ops = {
    ATTRIBUTE_OWNERSHIP_ACQUIRE: `acquire ownership for attribute ${name}`,
    ATTRIBUTE_OWNERSHIP_CHECK: `check for ownership for attribute ${name}`,
    ATTRIBUTE_APPEND: `append custom tag`,
    ATTRIBUTE_CREATE: `create new value for attribute ${name}`
  }
  return ops[operation] || `do "${operation}"`
}

function handleAttributeResponse (response, { operation, name, z }) {
  const action = operationToHumanReadableAction(operation, name)
  let content
  if (response.status >= 400) {
    return throwError({
      message: `Could not ${action} because ${response.content}`,
      status: response.status
    })
  }
  content = z.JSON.parse(response.content)
  if (content.failed && content.failed.length > 0) {
    return throwError({
      message: `Could not ${action} because ${content.failed[0].error}`,
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
    url: getApiUrl(ATTRIBUTE_OWNERSHIP_CHECK)
  })
    .then(response => {
      const content = handleAttributeResponse(response, {
        operation: ATTRIBUTE_OWNERSHIP_CHECK,
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
    postRequestObject(ATTRIBUTE_OWNERSHIP_ACQUIRE, {
      name,
      active: true
    })
  )
    .then(response =>
      handleAttributeResponse(response, {
        operation: ATTRIBUTE_OWNERSHIP_ACQUIRE,
        name,
        z
      }).success[0]
    )
}

function updateAttribute ({
  payload,
  z,
  operation
}) {
  return z.request(
    postRequestObject(operation, payload)
  )
    .then(response =>
      handleAttributeResponse(response, {
        operation,
        name: payload.name || '',
        z
      }).success[0]
    )
}

exports.update = function updateAttributeChain ({
  name,
  date,
  value,
  z
}) {
  return isAttributeOwned(name, { z })
    .catch((e) => {
      if (e.status === 202 || e.status === NO_ATTRIBUTE_OWNERSHIP) {
        return acquireAttribute(name, { z })
      }
      throw e
    })
    .then(() => updateAttribute({
      payload: {
        name,
        date,
        value
      },
      operation: ATTRIBUTE_CREATE,
      z
    }))
}

exports.append = function appendAttributeChain ({
  date,
  value,
  z
}) {
  return updateAttribute({
    payload: {
      date,
      value
    },
    operation: ATTRIBUTE_APPEND,
    z
  })
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
exports.tagOutputFields = [
  {
    key: 'date',
    label: 'Date'
  },
  {
    key: 'value',
    label: 'Name of the tag'
  }
]
exports.operationToHumanReadableAction = operationToHumanReadableAction
exports.operations = operations
