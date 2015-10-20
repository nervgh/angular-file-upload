var pkg = require('./package.json');
// https://github.com/gulpjs/gulp/blob/master/docs/README.md
var gulp = require('gulp');
// http://webpack.github.io/docs/
var webpack = require('webpack');
// https://github.com/shama/webpack-stream
var webpackStream = require('webpack-stream');
// https://github.com/dominictarr/event-stream
var es = require('event-stream');
// https://github.com/justmoon/node-extend
var extend = require('extend');

gulp.task(
    pkg.name + '/build',
    function() {
        var normalWebpackStream = {
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
                    filename: pkg.name + '.js'
                }
            },
            normalStream =
                gulp
                    .src('./src/index.js')
                    .pipe(webpackStream(normalWebpackStream))
                    .pipe(gulp.dest('./dist'));

        /**
         * Deep copy the normalWebpackStream to customize it for the uglify stream
         */
        var ulgifyWebpackStream = extend(true, {}, normalWebpackStream);

        ulgifyWebpackStream.plugins.unshift(
            // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
        }));

        ulgifyWebpackStream.output.filename = pkg.name + '.min.js';

        var uglifyStream =
            gulp
                .src('./src/index.js')
                .pipe(webpackStream(ulgifyWebpackStream))
                .pipe(gulp.dest('./dist'));

        return es.concat(normalStream, uglifyStream);
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
