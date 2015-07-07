module.exports = function(grunt) {
    grunt.initConfig({
    	jshint: {
    		src: 'src/fDatepicker.js'
    	},

    	copy: {
    		main: {
    			src: 'src/fDatepicker.js',
    			dest: 'dist/fDatepicker.js'
    		}
    	},

    	uglify: {
    		file: {
    			src: 'src/fDatepicker.js',
    			dest: 'dist/fDatepicker.min.js'
    		}
    	}
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('js', ['copy', 'uglify']);
    grunt.registerTask('default', ['js']);
}
