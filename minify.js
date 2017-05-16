var fs = require('fs');
var UglifyJS = require('uglify-js');

var FILE = 'shopify-helper.js';
var DIST = 'dist/';

var code = fs.readFileSync(FILE, 'utf-8');
var result = UglifyJS.minify(code).code;
var outfile = __dirname.replace(/\/$/g, '') + '/' + 
    DIST + FILE.replace(/\.js$/gi, '.min.js');
    
fs.writeFileSync(outfile, result);