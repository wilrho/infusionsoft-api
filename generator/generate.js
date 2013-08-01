var scraper = require('./scraper');
var util    = require('util');
var typedef = require('typedef');
var _       = require('underscore');
var fs      = require('fs');
var wordwrap = require('wordwrap');

module.exports = scraper.scrapeDocs().then(function(apiDocs) {
    var files = {};

    apiDocs.forEach(function(info) {

        var interfaceName = 'I' + info.serviceName.charAt(0).toUpperCase() +
            info.serviceName.substring(1);

        var code = '';

        code += 'var IService = require(\'../IService\');\n\n';
        code += 'module.exports = ' + interfaceName + ' = require(\'typedef\')\n\n';

        wordwrap(76)(info.description).split('\n').forEach(function(line) {
            code += '// ' + line + '\n';
        });

        code += '\n// THIS CODE WAS GENERATED BY A TOOL. Editing it is not recommended.\n';
        code += '// For more information, see http://github.com/bvalosek/infusionsoft-api\n';
        code += '\n.interface(\'' + interfaceName + '\') .implements(IService) .define({\n';

        info.methods.forEach(function(method, index) {
            if (index)
                code += ',\n';

            code += '\n';
            wordwrap(72)(method.description).split('\n').forEach(function(line) {
                code += '    // ' + line + '\n';
            });

            var meth = '__xmlrpc__' + method.name + ': function(';

            method.params.forEach(function(p, n) {
                if (n)
                    meth += ', ';
                meth += normalizeParam(p);
            });

            meth += ')';

            wordwrap(72)(meth).split('\n').forEach(function(line, index) {
                if (index) code += '\n    ';
                code += '    ' + line;
            });

            code += ' {}';
        });

        code += '\n\n});';

        files[interfaceName + '.js'] = code;
    });

    _(files).each(function(code, filename) {
        fs.writeFile(__dirname + '/../infusionsoft/services/' + filename, code, function(err) {
            if (err)
                console.log(err);
            else
                console.log(filename + ' updated');
        });
    });

});

function normalizeParam(s)
{
    var m = s.match(/(.*)\s+\(optional\)$/);

    if (m)
        s = '_' + m[1];

    return s.replace(' ', '');
}
