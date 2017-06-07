const imagemin = require('imagemin')
const imageminJpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

imagemin(['source/img/*.*'], 'public/img', {
  use: [
    imageminJpeg(),
    imageminPngquant()
  ]
}).then(() => {
  console.log('Images optimized')
})
