const pkg = require('./package.json')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? `/pixelfelt-sites@${pkg.version}/dist/` : '/',
  filenameHashing: false,

  configureWebpack: config => {
    const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')
      config.plugins.push(new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        // Include a subset of languages support
        // Some language extensions like typescript are so huge that may impact build performance
        // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
        // Languages are loaded on demand at runtime
        languages: ['javascript', 'typescript', 'css', 'html', 'json']
      }))
  }
}