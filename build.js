const Metalsmith = require('metalsmith')
const imagemin = require('metalsmith-imagemin')
const inplace = require('metalsmith-in-place')
const fingerprint = require('metalsmith-fingerprint-ignore')
const layouts = require('metalsmith-layouts')
const markdown = require('metalsmith-markdownit')
const sass = require('metalsmith-sass')
const serve = require('metalsmith-serve')
const sitemap = require('metalsmith-sitemap')
const robots = require('metalsmith-robots')
const watch = require('metalsmith-watch')
const permalinks = require('metalsmith-permalinks')

let env = process.env.NODE_ENV || 'DEV'
console.log('Building for environment:', env)

const envOptions = {
  DEV: {
    'site_url': 'http://localhost:8081',
    'watch': true,
    'disallow': '/',
    'trustmark': 'https://test-trust.profiles.eco'
  },
  TST: {
    'ga_tracking_id': 'UA-2825422-18',
    'site_url': 'https://test.bigroom.eco',
    'watch': false,
    'disallow': '/',
    'trustmark': 'https://test-trust.profiles.eco'
  },
  PRD: {
    'ga_tracking_id': 'UA-2825422-17',
    'site_url': 'https://bigroom.eco',
    'watch': false,
    'disallow': ['mobile/*', 'm/*'],
    'trustmark': 'https://trust.profiles.eco'
  }
}

let options = envOptions[env]
console.log('Using options:', options)

let ms = Metalsmith(__dirname)
  .metadata({
    'year': new Date().getFullYear(),
    'img_root': '/img',
    'site_url': options['site_url'],
    'twitter_id': '@doteco',
    'ga_tracking_id': options['ga_tracking_id'],
    'livereload': options.watch,
    'trustmark': options.trustmark
  })
  .source('./source')
  .destination('./public/')
  .clean(false)
  .use(sass({
    includePaths: ['./scss'],
    outputDir: 'css'
  }))
  .use(fingerprint({
    pattern: 'css/main.css'
  }))
  .use(markdown({
    html: true
  }))
  .use(layouts({
    engine: 'nunjucks',
    default: 'default.html',
    partials: 'layouts/partials',
    pattern: '**/*.html'
  }))
  .use(inplace({
    engine: 'nunjucks',
    engineOptions: {
      'cache': false
    },
    pattern: '**/*.html'
  }))
  .use(imagemin({
    mozjpeg: {
      quality: 40
    },
    pngquant: { },
    svgo: { }
  }))
  .use(permalinks({
    relative: false
  }))
  .use(sitemap({
    hostname: options['site_url'],
    omitIndex: true
  }))
  .use(robots({
    disallow: options['disallow'],
    sitemap: options['site_url'] + '/sitemap.xml'
  }))

if (options.watch) {
  ms.use(serve({
    port: 8081,
    'document_root': 'public',
    verbose: true,
    http_error_files: {
      404: '/404.html'
    }
  }))
  .use(watch({
    paths: {
      '${source}/**/*': true,
      'scss/**/*': '**/*.+(html|scss)',
      '${source}/main.scss': '**/*.+(html|scss)',
      'layouts/**/*': '**/*.html'
    },
    livereload: 35728
  }))
}

ms.build(function (err, files) {
  if (err) { throw err }
})
