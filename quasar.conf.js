module.exports = function(/* ctx */) {
  return {
    boot: ['notify-defaults'],
    css: ['app.scss'],
    extras: ['mdi-v5', 'roboto-font'],
    framework: {
      iconSet: 'mdi-v5',
      lang: 'zh-hans',
      all: 'auto',
      components: [],
      directives: [],
      plugins: ['Notify', 'AppFullscreen', 'Dialog']
    },

    supportIE: false,
    supportTS: false,

    build: {
      vueRouterMode: 'history',
      extendWebpack(cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            formatter: require('eslint').CLIEngine.getFormatter('stylish')
          }
        })
      }
    },

    devServer: {
      https: false,
      port: 80,
      open: true
    }
  }
}
