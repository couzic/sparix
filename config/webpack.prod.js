/**
 * @author: @AngularClass
 */

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

/**
 * Webpack Plugins
 */
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = webpackMerge(commonConfig, {

  entry: {
    vendor: ["rxjs", "lodash.isequal", "immupdate"],
    main: "index.ts"
  },

  /**
   * Switch loaders to debug mode.
   *
   * See: http://webpack.github.io/docs/configuration.html#debug
   */
  debug: false,

  /**
   * Developer tool to enhance debugging
   *
   * See: http://webpack.github.io/docs/configuration.html#devtool
   * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
   */
  devtool: 'source-map',

  /**
   * Options affecting the output of the compilation.
   *
   * See: http://webpack.github.io/docs/configuration.html#output
   */
  output: {
    libraryTarget: 'umd',
    library: 'sparix',
    filename: 'dist/sparix.min.js',
    umdNamedDefine: true
  },

  /**
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    new CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    }),

    /**
     * Plugin: DedupePlugin
     * Description: Prevents the inclusion of duplicate code into your bundle
     * and instead applies a copy of the function at runtime.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
     * See: https://github.com/webpack/docs/wiki/optimization#deduplication
     */
    new DedupePlugin(),

    /**
     * Plugin: UglifyJsPlugin
     * Description: Minimize all JavaScript output of chunks.
     * Loaders are switched into minimizing mode.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
     */
    // NOTE: To debug prod builds uncomment //debug lines and comment //prod lines
    new UglifyJsPlugin({
      // beautify: true, //debug
      // mangle: false, //debug
      // dead_code: false, //debug
      // unused: false, //debug
      // deadCode: false, //debug
      // compress: {
      //   screw_ie8: true,
      //   keep_fnames: true,
      //   drop_debugger: false,
      //   dead_code: false,
      //   unused: false
      // }, // debug
      // comments: true, //debug
      exclude: /node_modules/,

      beautify: false, //prod

      mangle: {
        screw_ie8: true,
        keep_fnames: true
      }, //prod

      compress: {
        screw_ie8: true
      }, //prod

      comments: false //prod
    })

  ],

  /**
   * Static analysis linter for TypeScript advanced options configuration
   * Description: An extensible linter for the TypeScript language.
   *
   * See: https://github.com/wbuchwalter/tslint-loader
   */
  tslint: {
    emitErrors: true,
    failOnHint: true,
    resourcePath: 'src'
  },

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: 'window',
    crypto: 'empty',
    process: false,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

});
