import {globby} from 'globby'
import sharp from 'sharp'

const paths = await globby('source/img/', {
  expandDirectories: {
    extensions: ['png', 'jpg']
  }
});

paths.map(async inputFile => {
  let outputFile = inputFile.replace(/^source/, 'public')
  outputFile = outputFile.replace(/\.[^.]+$/, '.webp')
  console.log(`Converting ${inputFile} to ${outputFile}`)
  await sharp(inputFile).webp({
    quality: 30
  }).toFile(outputFile)
})
