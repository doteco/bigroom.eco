const { readFile } = require('fs/promises')
const klaw = require('klaw')
const path = require('path')

const skipFiles = [
'public/policies/index.html'
]

const validate = function (file) {
  return readFile(file, { encoding: 'utf8' }).then(data => {
    const validateUrl = 'https://validator.w3.org/nu/?out=json'
    return fetch(validateUrl, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }).then(response => response.json())
  }).then(results => {
    console.log('Validation results:', file)
    results.messages.map(entry => {
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
