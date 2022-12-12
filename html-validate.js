const { readFile } = require('fs/promises')
const klaw = require('klaw')
const path = require('path')
const validator = require('html-validator')

const skipFiles = [
'public/policies/index.html'
]

const skip = [
  'Attribute “color” not allowed on element “link” at this point.',
  'Illegal character in query: “|” is not allowed.'
]

const validate = function (file) {
  return readFile(file, { encoding: 'utf8' }).then((data) => {
    const options = {
      data,
      format: 'json'
    }

    return validator(options)
  }).then((results) => {
    console.log('Validation results:', file)
    results.messages.filter((entry) => {
      return !skip.some(s => entry.message.includes(s))
    }).map((entry) => {
      return console.log(`${entry.type.toUpperCase()}: ${entry.message} (line: ${entry.lastLine})`)
    })
    console.log()
  }).catch((err) => {
    console.log('Failed to validate', file, err)
  })
}

new Promise((resolve, reject) => {
  const files = []
  klaw('./public').on('data', (file) => {
    const skipFile = skipFiles.some(s => s === path.relative(process.cwd(), file.path))
    return file.path.endsWith('.html') && !skipFile ? files.push(file.path) : null
  }).on('end', () => resolve(files))
}).then((files) => {
  Promise.all(files.map(validate))
})
