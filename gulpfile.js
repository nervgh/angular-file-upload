

var pkg = require('./package.json');
// https://github.com/gulpjs/gulp/blob/master/docs/README.md
var gulp = require('gulp');
// http://webpack.github.io/docs/
var webpack = require('webpack');
// https://github.com/shama/webpack-stream
var webpackStream = require('webpack-stream');


gulp.task(
    pkg.name + '/build',
    function() {
        return gulp
            .src('./src/index.js')
            .pipe(webpackStream({
                module: {
                    loaders: [
                        // https://github.com/babel/babel-loader
                        {test: /\.js$/, loader: 'babel'},
                        // https://github.com/webpack/json-loader
                        {test: /\.json$/, loader: 'json'},
                        // https://github.com/webpack/html-loader
                        {test: /\.html$/, loader: 'html'}
                    ]
                },
                plugins: [
                    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        }
                    }),
                    // http://webpack.github.io/docs/list-of-plugins.html#bannerplugin
                    new webpack.BannerPlugin(
                        '/*\n' +
                        ' ' + pkg.name + ' v' + pkg.version + '\n' +
                        ' ' + pkg.homepage + '\n' +
                        '*/\n'
                    , {
                        entryOnly: true,
                        raw: true
                    })
                ],
                devtool: 'source-map',
                debug: true,
                output: {
                    library: pkg.name,
                    libraryTarget: 'umd',
                    filename: pkg.name + '.min.js'
                }
            }))
            .pipe(gulp.dest('./dist'));
    }
);


gulp.task(
    pkg.name + '/watch', function() {
        return gulp
            .watch(
                [
                    './src/**/*.js',
                    './src/**/*.json',
                    './src/**/*.html'
                ],
                [
                    pkg.name + '/build'
                ]
        );
    }
);
