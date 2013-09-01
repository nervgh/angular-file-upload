path = require 'path'

# Build configurations.
module.exports = (grunt) ->
    grunt.initConfig
        # Deletes built file and temp directories.
        clean:
            working:
                src: [
                    'angular-file-upload.*'
                ]

        uglify:
            # concat js files before minification
            js:
                src: ['angular-file-upload.js']
                dest: 'angular-file-upload.min.js'
                options:
                  sourceMap: (fileName) ->
                    fileName.replace /\.js$/, '.map'
        concat:
            # concat js files before minification
            js:
                src: [
                    'src/scripts/intro.js',
                    'src/scripts/app.js',
                    'src/scripts/*/*.js',
                    'src/scripts/outro.js'
                ]
                dest: 'angular-file-upload.js'

    # Register grunt tasks supplied by grunt-contrib-*.
    # Referenced in package.json.
    # https://github.com/gruntjs/grunt-contrib
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'

    grunt.registerTask 'default', [
        'clean'
        'concat'
        'uglify'
    ]
