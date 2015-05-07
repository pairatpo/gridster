module.exports = function (grunt) {
    // Do grunt-related things in here

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        appConfig: {
            dir: {
                libs: 'assets/libs',
                dist: 'dist'
            }
        },

        bower: {
            install: {
                options: {
                    targetDir: '<%= appConfig.dir.libs %>',
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanTargetDir: true,
                    cleanBowerDir: false
                }
            }
        },
        clean: {
            dist: {
                options: { force: true },
                files: [
                    { src: ['dist/**'] }
                ]
            }
        },
        copy: {
            dist: {
                files: [
                    { expand: true, src: ['app/**'], dest: 'dist/' },
                    { expand: true, src: ['assets/**'], dest: 'dist/' },
                    { expand: true, src: ['index.html'], dest: 'dist/' },
                ]
            }
        },
        uglify: {
            options: {
                mangle: true,
                //beautify: true,
                preserveComments: false
            },
            files: {
                src: 'dist/**/*.js',  // source files mask
                expand: true,    // allow dynamic building
                flatten: false,   // remove all unnecessary nesting
            }
        },
        ngAnnotate: {
            options: {
                // Task-specific options go here. 
            },
            files: {
                src: 'dist/**/*.js',  // source files mask
                expand: true,    // allow dynamic building
                flatten: false,   // remove all unnecessary nesting
            },
        },
        useminPrepare: {
            html: 'dist/index.html',
            options: {
                dest: 'dist'
            }
        }

    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-usemin');

    // Default task(s).
    grunt.registerTask('prepare', ['bower:install']);
    grunt.registerTask('dist', [
        'clean:dist',
        'copy:dist',
        'ngAnnotate',
        'uglify'
    ]);

    // test
    grunt.registerTask('test', [
        'clean:dist',
        'useminPrepare'
    ]);
};