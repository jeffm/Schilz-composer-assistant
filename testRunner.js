var fs = require('fs');
var yargs = require('yargs');
var globalArguments = parseArguments(process.argv.slice(2));
function parseArguments(args) {
	var argStructure = {};
	var argv = yargs(args)
		.usage('Usage: $0 <command> [options]')
		.command('test', 'Test Schilz')
		.example('$0 test -i "input file.js"  -c "compare input file.js"-o "output file.js", 'generate a score')
		.alias('t', 'test')
		.demandOption(['i','o'])
		.describe('c', 'Compare input file name.')
		.alias('c', 'comparefile')
		.describe('i', 'Input file name.')
		.alias('i', 'infile')
		.describe('o', 'Test output file name.')
		.alias('o', 'outfile')
		.help('h')
		.alias('h', 'help')
		.epilog('copyright 2022, Jeffrey D. Mershon')
		.argv;
	argStructure.logLevel = 0;
	argStructure.testOutpath = '';

	if (typeof argv.outfile != 'undefined') {
		argStructure.testOutpath = argv.outfile.replace(/'/g,'');
	}
	if (typeof argv.verbose != 'undefined') {
		var level = argv.verbose.toLowerCase().substring(0,1);
		//None n, Info i, Warn w, Debug d
		if (level == 'n') {
			argStructure.logLevel = 0;
		} else if (level == 'w') {
			argStructure.logLevel = 1;
		} else if (level == 'i') {
			argStructure.logLevel = 2;
		} else if (level == 'd') {
			argStructure.logLevel = 3;
		}
	} else {
		argStructure.logLevel = 0;
	}
	console.log('argStructure.logLevel:' + argStructure.logLevel + ' level:' + level + ' argv.verbose:' + argv.verbose);
	return argStructure;
}

function openInputFile (inpath) {
	if (inpath != '') {
		log('openInputFile:' + inpath, 'info');
		try {
			return fs.readFileSync(inpath, 'utf8');
		} catch (err) {
		   log(err,'error');
		   return null;
		}
	}
}

var inputFile = openInputFile(globalArguments.infile);
var compareFile = openInputFile(globalArguments.comparefile);

inLines = inputFile.split('\n');
compLines = compareFile.split('\n');

if (