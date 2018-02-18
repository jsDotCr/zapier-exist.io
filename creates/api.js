function isAttributeOwned(name, {
  z,
}) {
  return z.request({
    method: 'GET',
    url: 'https://exist.io/api/1/attributes/owned/',
  })
    .then(response => z.JSON.parse(response.content))
    .then(attributesOwned => {
      const attribute = attributesOwned.filter(({ attribute }) =>
        attribute === name)
      if (attribute.length === 1) {
        return attribute
      }
      throw new Error(`We don\'t have ownership of ${name}`)
    })
}

function acquireAttribute(name, {
  z,
}) {
  return z.request({
    method: 'POST',
    url: 'https://exist.io/api/1/attributes/acquire/',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      name,
      active: true
    }]),
  })
    .then(response => {
      if (response.status >= 400) {
        throw new Error(`Could not acquire ownership of attribute ${name} because ${response.content}`)
      }
      const content = z.JSON.parse(response.content)
      if (response.status === 202) {
        throw new Error(`Could not acquire ownership of attribute ${name} because ${content.failed[0].error}. Error code: ${content.failed[0].error_code}`)
      }
      return content.success[0]
    })
}

function updateAttribute(name, date, value, {
  z,
}) {
  return z.request({
    method: 'POST',
    url: 'https://exist.io/api/1/attributes/update/',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      name,
      date,
      value,
    }]),
  })
    .then(response => {
      const { success, failed } = z.JSON.parse(response.content)
      if (failed) {
        throw new Error(`Could not update ${name} because ${failed[0].error}, error code ${failed[0].error_code}`)
      }
      return success[0]
    })
}

exports.update = function updateAttributeChain({
  name,
  date,
  value,
  z,
  bundle
}) {
  return isAttributeOwned(name, { z })
    .catch(() => acquireAttribute(name, { z }))
    .then((o) => {
      console.log(15, o)
      updateAttribute(name, date, value, { z })
    })
}
