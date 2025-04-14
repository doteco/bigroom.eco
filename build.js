const browserSync = require('browser-sync')
const Metalsmith = require('metalsmith')
const inplace = require('@metalsmith/in-place')
const fingerprint = require('metalsmith-fingerprint-ignore')
const layouts = require('@metalsmith/layouts')
const sass = require('@metalsmith/sass')
const sitemap = require('metalsmith-sitemap')
const robots = require('metalsmith-robots')
const watch = require('metalsmith-watch')
const permalinks = require('@metalsmith/permalinks')
const redirect = require('metalsmith-redirect')

const env = process.env.NODE_ENV || 'DEV'
console.log('Building for environment:', env)

const envOptions = {
  DEV: {
    site_url: 'http://localhost:8081',
    watch: true,
    trustmark: 'https://test-trust.profiles.eco',
    noindex: true
  },
  TST: {
    site_url: 'https://test.bigroom.eco',
    watch: false,
    trustmark: 'https://test-trust.profiles.eco',
    noindex: true
  },
  PRD: {
    site_url: 'https://bigroom.eco',
    watch: false,
    trustmark: 'https://trust.profiles.eco',
    noindex: false
  }
}

const options = envOptions[env]
console.log('Using options:', options)

const ms = Metalsmith(__dirname)
  .metadata({
    year: new Date().getFullYear(),
    img_root: '/img',
    site_url: options.site_url,
    twitter_id: '@doteco',
    livereload: options.watch,
    noindex: options.noindex,
    trustmark: options.trustmark
  })
  .source('./source')
  .destination('./public/')
  .clean(false)
  .use(sass({
    entries: {
      './scss/main.scss': 'css/main.css'
    },
    style: 'compressed',
    sourceMap: true,
    sourceMapContents: true
  }))
  .use(fingerprint({
    pattern: 'css/main.css'
  }))
  .use(inplace({
    transform: 'nunjucks',
    engineOptions: {
      cache: false
    },
    pattern: '**/*.njk'
  }))
  .use(layouts({
    transform: 'nunjucks',
    default: 'default.njk',
    pattern: '**/*.njk'
  }))
  .use(permalinks({
    relative: false
  }))
  .use(sitemap({
    hostname: options.site_url,
    omitIndex: true,
    privateProperty: 'exclude'
  }))
  .use(robots({
    sitemap: options.site_url + '/sitemap.xml'
  }))
  .use(redirect({
    frontmatter: true,
    noindex: false,
    redirections: {
      '/policies/': 'https://go.eco/policies/'
    }
  }))

ms.build(function (err, files) {
  if (err) { throw err }
})

if (options.watch) {
  ms.use(watch({
    paths: {
      /* eslint no-template-curly-in-string: 0 */
      '${source}/**/*': true,
      'scss/**/*': '{main.scss,**/*.njk}',
      'layouts/**/*': '**/*.njk'
    },
    livereload: 35728
  }))

  browserSync.init({
    port: 8081,
    server: 'public',
    watch: true
  })
}
