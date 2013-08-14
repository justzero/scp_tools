// @fileOverview: tasks/scp.js
// Date: 2013- 8-14
// Time: 16:56
// @description: uploader for huihui project
// @author: gongbing

/*jshint unused: false, eqnull: false, browser: true, nomen: true, indent: 4, maxlen: 80, strict: true, curly: true */
/*global define: true, $: true, _: true, youdao: true */


var path = require('path');
var async = require('async');
var Client = require('scp2').Client;

module.exports = function(grunt) {
    "use strict";

    grunt.registerMultiTask('scp', 'copy files to remote server.',
                            function(src) {
        var options = this.options({
            host: 'localhost',
            username: 'admin'
        });

        var self = this.data;

        // @method: filter
        // @description: 获取remote_dest的路径
        // @param: filepath
        // @return: remote-destpath
        var filter = function (filepath) {
            return self.filter(filepath.replace(options.src, options.dest));
        };
        var dest = filter(src);

        var done = this.async();
        var filename, destfile;
        var client = new Client(options);

        client.upload(src, dest, function (err) {
            client.close();
        });

        client.on('connect', function() {
            grunt.log.writeln('ssh connect ' + options.host);
        });
        client.on('close', function() {
            grunt.log.writeln('ssh close ' + options.host);
            done();
        });
        client.on('mkdir', function(dir) {
            grunt.log.writeln('mkdir ' + dir);
        });
        client.on('write', function(o) {
            grunt.log.writeln('write ' + o.destination);
            if (options.log) {
                options.log(o);
            }
        });
        client.on('transfer', function(buf, up, total) {
            up = up + 1;
            if (up < total) {
                grunt.log.write('transfer ' + up + '/' + total + ' data\r');
            } else {
                grunt.log.writeln('transfer ' + up + '/' + total + ' data');
            }
        });
        client.on('error', function(err) {
            if (err.message) {
                grunt.log.error('error ' + err.message);
            } else {
                grunt.log.error('error ' + err);
            }
            done(false);
            return false;
        });

    });
};
