const { readFile } = require('fs')
const { exec } = require('child_process')
const { version } = require('./package.json')

readFile('./.environment', 'utf-8', (err, content) => {
  if (err) {
    throw new Error(err)
  }
  content.split('\n')
    .forEach(line => {
      const [ key, value ] = line.split('=')
      console.log(`key ${key} found`)
      exec(`zapier env ${version} ${key} "${value}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('##########')
          console.error('exec error: ' + error)
          console.error('##########')
        }
        console.log('stdout: ' + stdout)
        console.log('stderr: ' + stderr)
      })
    })
})
