const pkg = require('../package.json')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? `/pixelfelt-sites@${pkg.version}/dashboard/dist/` : '/',
  filenameHashing: false
}