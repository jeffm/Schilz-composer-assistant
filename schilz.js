//Copyright Jeffrey D. Mershon 2022

var fs = require('fs');
//var path = require(path);
var yargs = require('yargs');
//var log = require('npmlog');
var JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

var globalArguments = parseArguments(process.argv.slice(2))
log('Parsed globalArguments:' + JSON.stringify(globalArguments), 'debug');
globalArguments.pitchChordFilePath = (__dirname + '\\pitchChords.json');
var rhythms = openInputFile(globalArguments.ControlFilePath);
var pitchChords = openInputFile(globalArguments.pitchChordFilePath);
if (rhythms != null) {
	populateGlobalDefaults(globalArguments);
	generateTracks(globalArguments);
	writeJSON(globalArguments.JSONoutpath);
	writeRhythmChart(globalArguments.Chartoutpath);
	writeMIDI(globalArguments.MIDIoutpath);
}

function parseArguments(args) {
	var argStructure = {};
	var argv = yargs(args)
		.usage('Usage: $0 <command> [options]')
		.command('generate', 'Generate a score')
		.example('$0 generate -p "c:\projectFolder" -i "input file.js" -o "output file.js" -m "midi file.mid" -c " chart file.html" -v n', 'generate a score')
		.alias('g', 'generate')
		//.describe('g', 'Generate a score')
		.demandOption(['p','i'])
		.describe('p', 'Path to the project folder.')
		.alias('p', 'project')
		.describe('i', 'Input file name. Must be in the project folder.')
		.alias('i', 'infile')
		.describe('j', 'JSON output file name. Will be placed in the project folder. Can be same as input file.')
		.alias('j', 'outfile')
		.describe('m', 'Midi file name. Will be placed in the project folder.')
		.alias('m', 'midi')
		.describe('c', 'Chart file name. Will be placed in the project folder.')
		.alias('c', 'chart')
		.describe('d', 'Default pitch. C4 used if not specified.')
		.alias('d', 'pitch')
		.describe('v', 'Level of detail in console output. None n, Info i, Warn w, Debug d')
		.alias('v', 'verbose')
		.default('v', 'n')
		.help('h')
		.alias('h', 'help')
		.epilog('copyright 2022, Jeffrey D. Mershon')
		.argv;
	//console.log('Your arguments are:' + JSON.stringify(argv));
	argStructure.projectPath = argv.project.replace(/'/g,'');
	var dir = ensureExists(argStructure.projectPath, 0o744);
	if (dir == false) {
		console.log('\n\n\n\nFAILED TO FIND PROJECT DIRECTORY!\n\n\n\n');
	}
	argStructure.ControlFilePath = argStructure.projectPath + argv.infile.replace(/'/g,'');
	//console.log(argStructure.projectPath + '       ' + argStructure.ControlFilePath)
	argStructure.logLevel = 0;
	argStructure.JSONoutpath = '';
	argStructure.MIDIoutpath = '';
	argStructure.Chartoutpath = '';
	//argStructure.globalDefaultPitch = ["C4"];
	if (typeof argv.midi != 'undefined') {
		argStructure.MIDIoutpath = argStructure.projectPath + argv.midi.replace(/'/g,'');
	}
	if (typeof argv.outfile != 'undefined') {
		argStructure.JSONoutpath = argStructure.projectPath + argv.outfile.replace(/'/g,'');
	}
	if (typeof argv.chart != 'undefined') {
		argStructure.Chartoutpath = argStructure.projectPath + argv.chart.replace(/'/g,'');
	}
	//if (typeof argv.pitch != 'undefined') {
	//	argStructure.globalDefaultPitch = [ argv.pitch.replace(/'/g,'') ];
	//} else {
	//	argStructure.globalDefaultPitch = ["C4"];
	//}
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

function log(message,warnLevel) {
	//yes, there are logger packages, but this is a placeholder because my favorite--npmlog--wouldn't load for some reason, and I didn't want to waste time learning a new logger when my needs are simple.
	var level = warnLevel.toLowerCase().substring(0,1);
	var logLevel = 0;
	//None n, Info i, Warn w, Debug d
	if (level == 'e') {
		logLevel = 0;
	} else if (level == 'w') {
		logLevel = 1;
	} else if (level == 'i') {
		logLevel = 2;
	} else if (level == 'd') {
		logLevel = 3;
	}
	//console.log("arguments.logLevel:" + globalArguments.logLevel + " logLevel " + logLevel + ' level:' + level);
	if (logLevel <= globalArguments.logLevel) {
		if (logLevel == 0) {
			console.error(message);
		} else if (logLevel == 1) {
			console.warn(message);
		} else if (logLevel == 2) {
			console.info(message);
		} else if (logLevel == 3) {
			console.log(message);
		}
	}
}

//Input - Output
function ensureExists(path, mask) {
    return fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') return true; // Ignore the error if the folder already exists
            else return false; // Something else went wrong
        } else return true
    });
}

function openInputFile (inpath) {
	if (inpath != '') {
		log('openInputFile:' + inpath, 'info');
		try {
			return JSON.parse(fs.readFileSync(inpath, 'utf8'));
		} catch (err) {
		   log(err,'error');
		   return null;
		}
	}
}

function writeJSON(JSONoutpath) {
	log('writeJSON() ' + JSONoutpath, 'info');
	if (typeof JSONoutpath != 'undefined' && JSONoutpath != '') {
		try {
			var outFile = fs.openSync(JSONoutpath,'w');
			fs.writeSync(outFile,JSON.stringify(rhythms,null,4));
		} catch (err) {
		   log(err,'error');
		}
	}
}

function writeMIDI(MIDIoutpath) {
	log('writeMIDI ' + MIDIoutpath, 'debug');
	if (MIDIoutpath != '') {
		var midiFile = genMidiFileJZZ();
		if (midiFile != null) {
			try {
				var outFile = fs.openSync(MIDIoutpath,'w');
				//console.log(midiFile.toString());
				fs.writeFileSync(outFile,midiFile.dump(),'binary');
				fs.closeSync(outFile);
				
				//console.log('reading midi file:' + MIDIoutpath);
				//var data = fs.readFileSync(MIDIoutpath, 'binary');
				//var smf = new JZZ.MIDI.SMF(data);
				//console.log(smf.toString());
			} catch (err) {
			   log(err,'error');
			}
		}
	}
}

function writeRhythmChart(Chartoutpath) {
	log('writeChart() ' + Chartoutpath, 'info');
	if (Chartoutpath != '') {
		try {
			var outFile = fs.openSync(Chartoutpath,'w');
			fs.writeSync(outFile,buildRhythmChartHTML());
		} catch (err) {
		   log(err,'error');
		}
	}
}

function shouldRun(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.run != 'undefined' && rhythms.tracks[TrackToBuild].run.run == false) {
		return false;
	} else {
		rhythms.tracks[TrackToBuild].run.run = true;
	}
	return true;	
}

function generateTracks(arguments) {
	log('generateTracks()','info');
	for (var j=0;j<rhythms.tracks.length;j++) {
		createEmptyTrackEventArrays(j)
		if (!shouldRun(j)) break;
		if (rhythms.tracks[j].type == 'beat') {
			generateBeat(j);
			addPitches(j);
			geometricTrackChromatic(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'rhythm') {
			generateRhythm(j);
			setDuration(j);
			setCounts(j);
			computePolyLCM(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'concatenate') {
			concatenateTracks(j);
			setDuration(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'clone') {
			cloneTrack(j);
			setDuration(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'merge') {
			mergeTracks(j);
			geometricTrackChromatic(j);
		} else if (rhythms.tracks[j].type == 'split') {
			splitSetUp(j);
			splitTrack(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'progression') {
			generateProgression(j);
			setDuration(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else if (rhythms.tracks[j].type == 'none') {
			generateProgression(j);
			addPitches(j);
			addChordSymbols(j);
			convertChordsToPitches(j);
			geometricTrackChromatic(j);
			addControlEvents(j);
		} else {
			log('ERROR! Unknown track type:' + rhythms.tracks[j].type, 'error');
		}
	}
}

function populateGlobalDefaults(arguments) {
	log('Set Default Pitch:' + arguments.globalDefaultPitch + ' rhythms.defaultPitch:' + rhythms.defaultPitch, 'debug');
	//if (typeof rhythms.defaultPitch == 'undefined') {
	//	rhythms.defaultPitch = arguments.globalDefaultPitch;
	//	log('Set Default Pitch:' + arguments.globalDefaultPitch + ' rhythms.defaultPitch:' + rhythms.defaultPitch, 'debug');
	//}
	if (typeof rhythms.averageVelocity == 'undefined') {
		rhythms.averageVelocity = 50;
	}
	if (typeof rhythms.tempo == 'undefined') {
		rhythms.tempo = 90;
	}
	if (typeof rhythms.copyright == 'undefined') {
		rhythms.copyright = 'Copyright YYYY [Replace with Copyright Owner]';
	}
}

//Track Housekeeping
function createEmptyTrackEventArrays(TrackToBuild) {
	log('createEmptyTrackEventArrays(' + TrackToBuild + ')','info');
	if (typeof rhythms.tracks[TrackToBuild].events == 'undefined') {
		rhythms.tracks[TrackToBuild].events = [];
	}
	if (typeof rhythms.tracks[TrackToBuild].run == 'undefined') {
		rhythms.tracks[TrackToBuild].run = {};
	}
	if (typeof rhythms.tracks[TrackToBuild].run.run == 'undefined') {
		rhythms.tracks[TrackToBuild].run.run = true
	}
}

function populateName(TrackToBuild, name) {
	//Autopopulate name
	if (typeof rhythms.tracks[TrackToBuild].name == 'undefined' || rhythms.tracks[TrackToBuild].name.length == 0) {
		rhythms.tracks[TrackToBuild].name = name;
	}
}

function populateID(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].id == 'undefined' || rhythms.tracks[TrackToBuild].id.length == 0) {
		rhythms.tracks[TrackToBuild].id = TrackToBuild;
	}
}

//Beats & Rhythms
function generateBeat(TrackToBuild) {
	log('generateBeat(' + TrackToBuild + ')', 'info');
	populateName(TrackToBuild, "Beat of " + rhythms.tracks[TrackToBuild].period);
	populateID(TrackToBuild);
	
	var offset = 1;
	var period;
	var periodIndex = 0;
	var limit;
	if (typeof rhythms.tracks[TrackToBuild].offsetFrom == 'undefined' && typeof rhythms.tracks[TrackToBuild].offsetAmount == 'undefined') {
		//console.log('no offsets');
		if (rhythms.tracks[TrackToBuild].period instanceof Array) {
			//console.log('---array:' + rhythms.tracks[TrackToBuild].period[periodIndex]);
			period = rhythms.tracks[TrackToBuild].period[periodIndex];
			periodIndex++;
			if (periodIndex > rhythms.tracks[TrackToBuild].period.length-1) {
				periodIndex = 0;
			}
		} else {
			period = rhythms.tracks[TrackToBuild].period;
		}
		
		log('offsetAmount:' + rhythms.tracks[TrackToBuild].offsetAmount, 'debug');
		offset = 0;
		var entry = {
			index: offset,
			duration: period,
			count: 1
		};
		limit = rhythms.tracks[TrackToBuild].endAt
		offset = period;
		//console.log('ENTRY:' + JSON.stringify(entry));
		rhythms.tracks[TrackToBuild].events.push(entry);
		log('local offset:' + offset, 'debug');
	} else if (typeof rhythms.tracks[TrackToBuild].offsetFrom != 'undefined' && typeof rhythms.tracks[TrackToBuild].offsetAmount != 'undefined') {
		//console.log('with offsets');
		if (rhythms.tracks[rhythms.tracks[TrackToBuild].offsetFrom].period instanceof Array) {
			period = rhythms.tracks[rhythms.tracks[TrackToBuild].offsetFrom].period[0];
		} else {
			period = rhythms.tracks[rhythms.tracks[TrackToBuild].offsetFrom].period;
		}
		log('offsetFrom:' + rhythms.tracks[TrackToBuild].offsetAmount + '=' + period + ' offset:' + rhythms.tracks[TrackToBuild].offsetAmount, 'debug');
		
		offset = ((rhythms.tracks[TrackToBuild].offsetAmount * period));
		log('Offset is From Another:' + offset, 'debug');
		limit = rhythms.tracks[TrackToBuild].endAt + offset;
	} else {
		//console.log('neither offsets or no offsets???');
		offset = 0;
		log('defaultOffset:' + offset, 'debug');
		if (rhythms.tracks[TrackToBuild].period instanceof Array) {
			period = rhythms.tracks[TrackToBuild].period[periodIndex];
			periodIndex++;
			if (periodIndex > rhythms.tracks[TrackToBuild].period.length-1) {
				periodIndex = 0;
			}
		} else {
			period = rhythms.tracks[TrackToBuild].period;
		}
		limit = rhythms.tracks[TrackToBuild].endAt
	}
	//console.log(' offset:' + offset + ' limit:' + limit, 'debug');
	if (rhythms.tracks[TrackToBuild].period instanceof Array) {
		k=offset;
		while (k<limit) {
			period = rhythms.tracks[TrackToBuild].period[periodIndex];
			periodIndex++;
			if (periodIndex > rhythms.tracks[TrackToBuild].period.length-1) {
				periodIndex = 0;
			}
			var entry = {
				index: k,
				duration: period,
				count: 1
			};
			//console.log('ENTRY:' + JSON.stringify(entry));
			rhythms.tracks[TrackToBuild].events.push(entry);
			k += period;
		}
	} else {
		for (var k=offset;k<=limit;k++) {
			period = rhythms.tracks[TrackToBuild].period;
			//console.log('k:' + (k + offset) + ' period:' + period + ' limit:' + limit, 'debug');
			if ((k - offset) % period == 0) {
				if (k < limit) {
					var entry = {
						index: k,
						duration: period,
						count: 1
					};
					//console.log('ENTRY:' + JSON.stringify(entry));
					rhythms.tracks[TrackToBuild].events.push(entry);
				}
			}
		}
	}
	fixIndexValues(TrackToBuild);
	rhythms.tracks[TrackToBuild].run.run = false;
}

function generateRhythm(TrackToBuild) {
	log('generateRhythm(' + TrackToBuild + ')', 'info');
	populateName(TrackToBuild, "Rhythm combining " + stringifySourceArray(rhythms.tracks[TrackToBuild].sources));
	populateID(TrackToBuild);
	var HighIndex = 0;
	var sourceTrack;
	for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) {
		var sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source;
		if (rhythms.tracks[sourceTrack].events[rhythms.tracks[sourceTrack].events.length-1].index > HighIndex) {
			HighIndex = rhythms.tracks[sourceTrack].events[rhythms.tracks[sourceTrack].events.length-1].index;
		}
	}
	rhythms.tracks[TrackToBuild].endAt = HighIndex;
	var lastIndex = -1;
	log('sources:' + JSON.stringify(rhythms.tracks[TrackToBuild].sources), 'debug');
	//console.log('sources:' + JSON.stringify(rhythms.tracks[TrackToBuild].sources));
	for (var k=0;k<=rhythms.tracks[TrackToBuild].endAt;k++) {
		for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) {
				sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source
				sourceLoop:
				for (var m=0;m<rhythms.tracks[sourceTrack].events.length;m++) {
					log(rhythms.tracks[sourceTrack].events[m].index + ' ' + k + ' li:' + lastIndex, 'debug');
					if (typeof rhythms.tracks[sourceTrack].events[m].index != 'undefined' && rhythms.tracks[sourceTrack].events[m].index == k && rhythms.tracks[sourceTrack].events[m].index > lastIndex) {
						var entry = {...rhythms.tracks[sourceTrack].events[m]}; ///this is the preferred way to copy a JSON object;
						entry.index = k;
						entry.count = 0
						lastIndex = k;
						rhythms.tracks[TrackToBuild].events.push(entry);
						log(JSON.stringify(rhythms.tracks[TrackToBuild].events), 'debug');
						break sourceLoop;
					}	
				}
		}	
	}
	
	for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) {
		if (typeof rhythms.tracks[TrackToBuild].sources[source].invert != 'undefined' && rhythms.tracks[TrackToBuild].sources[source].invert == true) {
			sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source
			//console.log(' 2:' + rhythms.tracks[TrackToBuild].events.length + '  ' + rhythms.tracks[sourceTrack].events.length)
			for (var k=0;k<rhythms.tracks[TrackToBuild].events.length;k++) {
				for (var l=0;l<rhythms.tracks[sourceTrack].events.length;l++) {
					//console.log(' 3:' + k + '   ' + rhythms.tracks[TrackToBuild].events[k].index + '   ' + l + '   ' + rhythms.tracks[sourceTrack].events[l].index)
					if (rhythms.tracks[sourceTrack].events[l].index == rhythms.tracks[TrackToBuild].events[k].index) {
						//console.log(' 4: Before:' + rhythms.tracks[TrackToBuild].events.length + ' ' + rhythms.tracks[TrackToBuild].events[k].index);
						rhythms.tracks[TrackToBuild].events.splice(k,1)
						k=k-1
						//console.log(' 5: After:' + rhythms.tracks[TrackToBuild].events.length +  '   ' + rhythms.tracks[TrackToBuild].events.length + '  ' + rhythms.tracks[sourceTrack].events.length);
						break
					}
				}
			}
		}
	}
					
	rhythms.tracks[TrackToBuild].run.run = false;
}

function concatenateTracks(TrackToBuild) {
	log('concatenateTracks(' + TrackToBuild + ')','info');
	var lastIndex = 0;
	var lastDuration = 0;
	var lastCount = 0;
	var newIndex = 0;
	populateName(TrackToBuild, "Rhythm combining " + stringifySourceArray(rhythms.tracks[TrackToBuild].sources));
	populateID(TrackToBuild);
	for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) { //for each already created source periodicity
		var reIndexTo = null;
		if (typeof rhythms.tracks[TrackToBuild].reIndexTo != 'undefined') {
			reIndexTo = rhythms.tracks[TrackToBuild].reIndexTo;
		}
		var offset = 1;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].offsetFrom == 'undefined' && typeof rhythms.tracks[TrackToBuild].sources[source].offsetAmount !== 'undefined') {
			log('source:' + source, 'debug');
			log('source duration:' + rhythms.tracks[source].events[0].duration, 'debug');
			var sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source;
			offset = (rhythms.tracks[TrackToBuild].sources[source].offsetAmount * (rhythms.tracks[sourceTrack].events[0].duration + rhythms.tracks[sourceTrack].events[0].index));
			log('   source:' + source + ' offsetAmount:' + rhythms.tracks[TrackToBuild].sources[source].offsetAmount + ' source index:' + rhythms.tracks[sourceTrack].events[0].index + ' source duration:' + rhythms.tracks[sourceTrack].events[0].duration + ' offset:' + offset, 'debug');
		} else if (typeof rhythms.tracks[TrackToBuild].sources[source].offsetFrom !== 'undefined' && typeof rhythms.tracks[TrackToBuild].sources[source].offsetAmount !== 'undefined') {
			offset = ((rhythms.tracks[TrackToBuild].sources[source].offsetAmount * rhythms.tracks[rhythms.tracks[TrackToBuild].sources[source].offsetFrom].events[0].duration));
			log('   source:' + rhythms.tracks[TrackToBuild].sources[source].offsetFrom + ' offsetAmount:' + rhythms.tracks[TrackToBuild].sources[source].offsetAmount + ' source index:' + rhythms.tracks[sourceTrack].events[0].index + ' source duration:' + rhythms.tracks[sourceTrack].events[0].duration + ' offset:' + offset, 'debug');
			log('Offset is From Another:' + offset, 'debug');
		} else {
			offset = 0;
			log('   source:' + source + '   local offset:' + offset, 'debug');
			log('defaultOffset:' + offset, 'debug');
		}
		log('offset:' + offset, 'debug');
		var sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source;
		var muteInitial;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].muteInitial == 'undefined' || rhythms.tracks[TrackToBuild].sources[source].muteInitial == false) {
			muteInitial = false;
		} else if (rhythms.tracks[TrackToBuild].sources[source].muteInitial == true) {
			muteInitial = true;
		}
		log('   muteInitial: ' + muteInitial, 'debug');
		var concatenateType;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].permutation == 'undefined' || rhythms.tracks[TrackToBuild].sources[source].permutation == 'none') {
			concatenateType = 'none';
		} else if (rhythms.tracks[TrackToBuild].sources[source].permutation == 'left') {
			concatenateType = 'left';
		} else if (rhythms.tracks[TrackToBuild].sources[source].permutation == 'right') {
			concatenateType = 'right';
		} else if (rhythms.tracks[TrackToBuild].sources[source].permutation == 'retrograde') {
			concatenateType = 'retrograde';
		} else if (rhythms.tracks[TrackToBuild].sources[source].permutation == 'custom') {
			concatenateType = 'custom';
		}
		log('   concatenate type:' + concatenateType, 'debug');
		var increment;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].increment != 'undefined') {
			
			if (typeof rhythms.tracks[TrackToBuild].sources[source].increment == 'string' && rhythms.tracks[TrackToBuild].sources[source].increment.indexOf('%') == rhythms.tracks[TrackToBuild].sources[source].increment.length-1) {
				//increment is a percentage
				increment = Math.round(rhythms.tracks[sourceTrack].events.length-1 / parseInt(substring(rhythms.tracks[TrackToBuild].sources[source].increment,0,rhythms.tracks[TrackToBuild].sources[source].increment.length-2)));
			} else {
				//increment is an integer
				increment = rhythms.tracks[TrackToBuild].sources[source].increment;
			}
		} else {
			increment = 1;
		}
		
		log('   increment:' + increment, 'debug');
		var startAt = rhythms.tracks[TrackToBuild].sources[source].startAt;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].startAt != 'undefined') {
			if (typeof rhythms.tracks[TrackToBuild].sources[source].startAt == 'string'  && rhythms.tracks[TrackToBuild].sources[source].startAt.indexOf('%') > -1) {
				//startAt is a percentage
				startAt = Math.round(rhythms.tracks[sourceTrack].events.length-1 / parseInt(substring(rhythms.tracks[TrackToBuild].sources[source].startAt,0,rhythms.tracks[TrackToBuild].sources[source].startAt.length-2)));
			} else {
				//startAt is an integer
				startAt = rhythms.tracks[TrackToBuild].sources[source].startAt;
			}
		} else {
			if (concatenateType == 'none' || concatenateType == 'custom') {
				startAt = 0;
			} else if (concatenateType == 'left') {
				startAt = 1;
			} else if (concatenateType == 'right' || concatenateType == 'retrograde') {
				startAt = rhythms.tracks[sourceTrack].events.length-1;
			}
		}
		var endAt;
		if (typeof rhythms.tracks[TrackToBuild].sources[source].endAt != 'undefined') {
			endAt = rhythms.tracks[TrackToBuild].sources[source].endAt
		} else if (concatenateType == 'retrograde') {
			endAt = 0;
		} else {
			endAt = rhythms.tracks[sourceTrack].events.length;
		}
		log('concatenate type:' + concatenateType + ' startAt:' + startAt + ' endAt:' + endAt + ' increment:' + increment, 'debug');
		
		if (concatenateType == 'none' || concatenateType == 'left' || concatenateType == 'right' || concatenateType == 'retrograde' || concatenateType == 'custom') {
			var loopCount = 0;
			for (loopCount=startAt;loopCount<endAt;loopCount+=increment) {
				var entry = {...rhythms.tracks[sourceTrack].events[loopCount]};
				if (loopCount == startAt && offset > 0 && muteInitial) {
					entry.isRest = "rest";
				}
				lastIndex = rhythms.tracks[sourceTrack].events[loopCount].index;
				lastDuration = rhythms.tracks[sourceTrack].events[loopCount].duration;
				lastCount = rhythms.tracks[sourceTrack].events[loopCount].count;
				entry.index = lastIndex + newIndex + offset;
				entry.duration = lastDuration;
				entry.count = lastCount;
				rhythms.tracks[TrackToBuild].events.push(entry);
				log('loopCount:' + loopCount + ' ' + JSON.stringify(entry), 'debug');
			}
			if (concatenateType == 'left' || concatenateType == 'right') {
				if (loopCount >= endAt) {
					loopCount = loopCount - endAt;
				}
				var loopCount2;
				log('left--2nd loop. ' + 'loopCount:' + loopCount + ' startAt:' + startAt + ' increment:' + increment, 'debug');
				for (loopCount2=loopCount;loopCount2<startAt;loopCount2+=increment) {
					var entry = {...rhythms.tracks[sourceTrack].events[loopCount2]};
					entry.index = lastIndex + newIndex + lastDuration;
					entry.duration = rhythms.tracks[sourceTrack].events[loopCount2].duration;
					entry.count = rhythms.tracks[sourceTrack].events[loopCount2].count;
					rhythms.tracks[TrackToBuild].events.push(entry);
					log(JSON.stringify(entry), 'debug');
				}
			}
			if (concatenateType == 'retrograde') {
				var swapStart = 0;
				var swapEnd = 0;
				if (startAt < endAt) {
					swapStart = startAt;
					swapEnd = endAt;
				} else if (startAt > endAt) {
					swapStart = endAt;
					swapEnd = startAt;
				} else {
					//start and end are equal so there is nothing to do.
				}
				while (swapStart < swapEnd) {
					var swapTemp = {};
					swapTemp = rhythms.tracks[TrackToBuild].events[swapStart];
					rhythms.tracks[TrackToBuild].events[swapStart] = rhythms.tracks[TrackToBuild].events[swapEnd];
					rhythms.tracks[TrackToBuild].events[swapEnd] = swapTemp;
					swapStart += 1;
					swapEnd -= 1;
				}
			}
			if (concatenateType == 'custom') {
				tempArray = [];
				var loopCount = 0;
				for (loopCount=startAt;loopCount<endAt;loopCount++) {
					tempArray.push(rhythms.tracks[TrackToBuild].events[loopCount]);
				}
				log('customconcatenate:' + JSON.stringify(tempArray), 'debug');
				rhythmCount = startAt;
				var currentIndex = 0
				for (loopCount=0;loopCount<rhythms.tracks[TrackToBuild].sources[source].permOrder.length;loopCount++) {
					currentIndex = rhythms.tracks[TrackToBuild].sources[source].permOrder[loopCount] - 1;
					rhythms.tracks[TrackToBuild].events[rhythmCount] = tempArray[currentIndex];
					log('loopCount:' + loopCount + ' currentIndex:' + currentIndex + ' entry:' + JSON.stringify(tempArray[currentIndex]), 'debug');
					rhythmCount++
				}
			}
		}
		if (reIndexTo != null && source == 0) {
			fixIndexValues(TrackToBuild, reIndexTo);
		}
		newIndex = lastIndex;
	}
	fixIndexValues(TrackToBuild);
	rhythms.tracks[TrackToBuild].run.run = false;
}

function computePolyLCM(TrackToBuild) {
	log('computePolyLCM(' + TrackToBuild + ')','info');
	if (typeof rhythms.tracks[TrackToBuild].sources == 'undefined') return;
	var pairs = [];
	var pairLCM = [];
	var LCMs = [];
	//console.log('sources length:' + rhythms.tracks[TrackToBuild].sources.length,'debug');
	//we need to compute the LCM of each pair within a list of sources.
	//first--figure out the pairs.
	for (var increment=1;increment<rhythms.tracks[TrackToBuild].sources.length;increment++) {
		for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) {
			if ((source + increment) < rhythms.tracks[TrackToBuild].sources.length) {
				var temp = [];
				if (rhythms.tracks[source].type == 'beat') {
					//console.log('period:' + rhythms.tracks[source].period);
					temp.push(rhythms.tracks[source].period);
				} else {
					//get the index of the last event and add its duration
					//console.log('rhythm length:' + rhythms.tracks[source].events[rhythms.tracks[source].events.length].index + rhythms.tracks[source].events[rhythms.tracks[source].events.length].duration);
					
					temp.push(rhythms.tracks[source].events[rhythms.tracks[source].events.length].index + rhythms.tracks[source].events[rhythms.tracks[source].events.length].duration);
				}
				if (rhythms.tracks[source+increment].type == 'beat') {
					//console.log('period:' + rhythms.tracks[source+increment].period);
					temp.push(rhythms.tracks[source+increment].period);
				} else {
					//get the index of the last event and add its duration
					//console.log('rhythm length:' + rhythms.tracks[source+increment].events[rhythms.tracks[source+increment].events.length].index + rhythms.tracks[source+increment].events[rhythms.tracks[source+increment].events.length].duration);
					
					temp.push(rhythms.tracks[source+increment].events[rhythms.tracks[source+increment].events.length].index + rhythms.tracks[source+increment].events[rhythms.tracks[source+increment].events.length].duration);
				}
				//console.log('pairs push:' + JSON .stringify(temp));
				pairs.push(temp);
			}
		}
	}
	var resolveFlag = false;
	//console.log('pairs start:' + JSON .stringify(pairs) + pairs[0][0] + ' ' + pairs[0][1]);
	
	while (!resolveFlag) {
		pairLCM = [];
		//now compute the LCM for each pair, and keep doing it until you get a single number
		for (var pairCount=0;pairCount < pairs.length;pairCount++) {
			//console.log('pairLCM push:' + 'pairCount:' + pairCount + ' ' + pairs[pairCount][0] + ' ' + pairs[pairCount][1]);
			pairLCM.push(computeLCM(pairs[pairCount][0],pairs[pairCount][1]));
		}
		//console.log('pairLCM:' + JSON.stringify(pairLCM));
		pairs = [];
		pairLCM = removeDupeArrayElements(pairLCM);
	
		//console.log('pared pairs:' + JSON.stringify(pairLCM));
		if (pairLCM.length == 1) {
			resolveFlag = true;
		}
		//resolveFlag = true;
		if (!resolveFlag) {
			for (var increment=1;increment<pairLCM.length;increment++) {
				for (var source=0;source<pairLCM.length;source++) {
					if ((source + increment) < pairLCM.length) {
						temp = [];
						//console.log('source:' + source + ' increment:' + increment);
						
						temp.push(pairLCM[source]);
						temp.push(pairLCM[source + increment]);
						pairs.push(temp);
					}
				}
			}
			//console.log('pairs:' + JSON.stringify(pairs));
			
			if (pairs.length == 0) {
				resolveFlag = true;
			}
		}
		//resolveFlag = true;
	}
	//console.log('final LCM:' + pairLCM[0]);
	rhythms.tracks[TrackToBuild].LCM = pairLCM[0];
}

function computeLCM(n1, n2) {
	var hcf = 1;
	for (var i = 1; i <= n1 && i <= n2; i++) {
			if( n1 % i == 0 && n2 % i == 0) {
			hcf = i;
			}
		}
		return (n1 * n2) / hcf
}

//Split & Merge
function mergeTracks(TrackToBuild) {
	log('mergeTracks(' + TrackToBuild + ') rhythmSource:' + rhythms.tracks[TrackToBuild].rhythmSource + ' pitchSource:' + rhythms.tracks[TrackToBuild].pitchSource,'info');
	populateName(TrackToBuild, "Track combining rhythm track: " + rhythms.tracks[TrackToBuild].rhythmSource + ' and ' + rhythms.tracks[TrackToBuild].pitchSource);
	populateID(TrackToBuild);
	var rhythmSourceTrack = rhythms.tracks[TrackToBuild].rhythmSource;
	var pitchSourceTrack = rhythms.tracks[TrackToBuild].pitchSource;
	var currentRhythmNote = 0;
	var currentPitchNote = 0;
	if (typeof rhythms.tracks[pitchSourceTrack].events == 'undefined') {
		rhythms.tracks[pitchSourceTrack].events = [];
	}
	for (currentRhythmNote=0;currentRhythmNote<rhythms.tracks[rhythmSourceTrack].events.length;currentRhythmNote++) {
		var mergedNote = [];
		mergedNote = rhythms.tracks[pitchSourceTrack].events[currentPitchNote];
		mergedNote.index = rhythms.tracks[rhythmSourceTrack].events[currentRhythmNote].index;
		mergedNote.duration = rhythms.tracks[rhythmSourceTrack].events[currentRhythmNote].duration;
		//if (typeof rhythms.tracks[pitchSourceTrack].events[currentPitchNote].pitch != 'undefined') {
		//	mergedNote.pitch = rhythms.tracks[pitchSourceTrack].events[currentPitchNote].pitch;
		//}
		//if (typeof rhythms.tracks[pitchSourceTrack].events[currentPitchNote].chord != 'undefined') {
		//	mergedNote.chord = rhythms.tracks[pitchSourceTrack].events[currentPitchNote].chord;
		//}
		rhythms.tracks[TrackToBuild].events.push(mergedNote);
		currentPitchNote++;
		if (currentPitchNote >= rhythms.tracks[pitchSourceTrack].events.length) {
			currentPitchNote = 0;
		}
	}
}

function splitSetUp(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].targets == 'undefined' && typeof rhythms.tracks[TrackToBuild].createTargets != 'undefined') {
		var targets = [];
		for (var i=0;i<rhythms.tracks[TrackToBuild].createTargets;i++) {
			targets.push(rhythms.tracks.length);
			var newTrack = {
				"id":rhythms.tracks.length,
				"type":"none",
				"events": []
			};
			//console.log('creating new track for split:' + rhythms.tracks.length);
			rhythms.tracks.push(newTrack);
		}
		rhythms.tracks[TrackToBuild].targets = targets;
	} else {
		for (var i=0;i<rhythms.tracks[TrackToBuild].targets.length;i++) {
			createEmptyTrackEventArrays(rhythms.tracks[TrackToBuild].targets[i]);
		}
	}
}

function splitTrack(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].targetCounts != 'undefined') {
		splitTrackByList(TrackToBuild, rhythms.tracks[TrackToBuild].targetCounts);
	} else if (typeof rhythms.tracks[TrackToBuild].useNoteCount != 'undefined' && rhythms.tracks[TrackToBuild].useNoteCount == true) {
		splitTrackByNoteCount(TrackToBuild);
	} else if (typeof rhythms.tracks[TrackToBuild].useNoteDurationFrom != 'undefined') {
		var countArray = buildArrayOfDurations(rhythms.tracks[TrackToBuild].useNoteDurationFrom);
		rhythms.tracks[TrackToBuild].targetCounts = countArray;
		splitTrackByList(TrackToBuild, countArray);
	}
	rhythms.tracks[TrackToBuild].run.run = false;
}

function buildArrayOfDurations(TrackToBuild) {
	var result = [];
	for (var eventIndex=0;eventIndex<rhythms.tracks[TrackToBuild].events.length;eventIndex++) {
		//console.log('eventIndex:' + eventIndex + ' duration:' + rhythms.tracks[TrackToBuild].events[eventIndex].duration);
		result.push(rhythms.tracks[TrackToBuild].events[eventIndex].duration);
	}
	//console.log('durations:' + JSON.stringify(result));
	return result;
}

function splitTrackByNoteCount(TrackToBuild) {
	for (var i=0;i<rhythms.tracks[TrackToBuild].targets.length;i++) {
		populateName(rhythms.tracks[TrackToBuild].targets[i], 'Split of track ' + TrackToBuild);
		populateID(rhythms.tracks[TrackToBuild].targets[i]);
	}
	var source = rhythms.tracks[TrackToBuild].source;
	log('splitTrackByNoteCount(' + TrackToBuild + ')', 'info');
	for (var eventIndex=0;eventIndex<rhythms.tracks[source].events.length;eventIndex++) {
		var currentTargetIndex = rhythms.tracks[TrackToBuild].targets[rhythms.tracks[source].events[eventIndex].count-1];
		var currentEvent = {...rhythms.tracks[source].events[eventIndex]};
		log('   split event:' + eventIndex + 'target:' + currentTargetIndex + ' events:' + JSON.stringify(rhythms.tracks[currentTargetIndex]),'debug');
		rhythms.tracks[currentTargetIndex].events.push(currentEvent);
	}
}

function splitTrackByList(TrackToBuild, countArray) {
	for (var i=0;i<rhythms.tracks[TrackToBuild].targets.length;i++) {
		populateName(rhythms.tracks[TrackToBuild].targets[i], 'Track:' + rhythms.tracks[TrackToBuild].targets[i] + ' Split of track ' + rhythms.tracks[TrackToBuild].source);
		populateID(rhythms.tracks[TrackToBuild].targets[i]);
	}
	log('splitTrackByList(' + TrackToBuild + ')', 'info');
	var lastIndex = 0;
	var source = rhythms.tracks[TrackToBuild].source;
	var currentTargetIndex = 0; // index to the current target
	var currentCountIndex = 0; // index to the current count
	var currentTargetCount = 1; //count counter
	var targetLength = rhythms.tracks[TrackToBuild].targets.length - 1;
	var countLength = countArray.length;
	log('source:' + source + ' currentTarget:' + currentTarget, 'debug');
	for (var sourceIndex=0;sourceIndex<rhythms.tracks[source].events.length;sourceIndex++) {
		var currentTarget = rhythms.tracks[TrackToBuild].targets[currentTargetIndex];
		
		log('   source:' + source + '  sourceIndex:' + sourceIndex + '  currentTargetIndex:' + currentTargetIndex + '  currentCountIndex:' +  currentCountIndex + '  currentTarget:' + currentTarget + '  currentTargetCount:' + currentTargetCount + '  countArray[currentCountIndex]:' + countArray[currentCountIndex] + '  events:' + JSON.stringify(rhythms.tracks[source].events[sourceIndex]), 'debug');
		if (typeof rhythms.tracks[source].events[sourceIndex] != 'undefined') {
			if (typeof rhythms.tracks[currentTarget] == 'undefined') {
				rhythms.tracks[currentTarget] = [];
			}
			if (typeof rhythms.tracks[currentTarget].events == 'undefined') {
				rhythms.tracks[currentTarget].events = [];
			}
			rhythms.tracks[currentTarget].events.push({...rhythms.tracks[source].events[sourceIndex]});
		}
		currentTargetCount++;
		if (currentTargetCount > countArray[currentCountIndex]) {
			currentTargetCount = 1;
			currentCountIndex++;
			currentTargetIndex++;
			if (currentCountIndex >= countLength) {
				currentCountIndex = 0;
				currentTargetIndex++;
			}
			if (currentTargetIndex > targetLength) {
				currentTargetIndex = 0;
			}
		}
	}
}

//Track Cleanup
function fixIndexValues(TrackToBuild, reIndexTo) {
	log('fixIndexValues(' + TrackToBuild + ',' + reIndexTo + ')' + ' length:' + rhythms.tracks[TrackToBuild].events.length, 'debug');
	if (typeof reIndexTo != 'undefined') {
		var duration = rhythms.tracks[TrackToBuild].events[0].duration;
		rhythms.tracks[TrackToBuild].events[0].index = reIndexTo;
	}
	log('     index:' + rhythms.tracks[TrackToBuild].events[0].index + ' duration:' + rhythms.tracks[TrackToBuild].events[0].duration  + ' count:' + rhythms.tracks[TrackToBuild].events[0].count + ' events:' + 0, 'debug');
	for (var result=1;result<rhythms.tracks[TrackToBuild].events.length;result++) {
		log('events:' + JSON.stringify(rhythms.tracks[TrackToBuild].events), 'debug');
		var durationOffset = rhythms.tracks[TrackToBuild].events[result-1].duration;
		var index = rhythms.tracks[TrackToBuild].events[result-1].index + durationOffset;
		rhythms.tracks[TrackToBuild].events[result].index = index;
		log('     index:' + index + ' duration:' + durationOffset  + ' count:' + rhythms.tracks[TrackToBuild].events[result].count + ' result:' + result, 'debug');
	}
}

function setDuration(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.setDuration != 'undefined' && rhythms.tracks[TrackToBuild].run.setDuration == false) return;
	log('setDuration(' + TrackToBuild + ')', 'info');
	for (var result=1;result<rhythms.tracks[TrackToBuild].events.length;result++) {
		var duration = rhythms.tracks[TrackToBuild].events[result].index - rhythms.tracks[TrackToBuild].events[result-1].index
		if (duration != 0) {
			rhythms.tracks[TrackToBuild].events[result-1].duration = Math.abs(duration);
		}
	}
}

function setCounts(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.setCounts != 'undefined' && rhythms.tracks[TrackToBuild].run.setCounts == false) return;
	log('setCounts(' + TrackToBuild + ')', 'info');
	for (var source=0;source<rhythms.tracks[TrackToBuild].sources.length;source++) { //for each already created source periodicity
		var sourceTrack = rhythms.tracks[TrackToBuild].sources[source].source
		for (var m=0;m<rhythms.tracks[sourceTrack].events.length;m++) {
			for (var n=0;n<rhythms.tracks[TrackToBuild].events.length;n++) {
				if (rhythms.tracks[TrackToBuild].events[n].index == rhythms.tracks[sourceTrack].events[m].index) {
					rhythms.tracks[TrackToBuild].events[n].count = rhythms.tracks[TrackToBuild].events[n].count + 1;
				}
			}
		}
	}
}

//Pitches 
function addPitches(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.addPitches != 'undefined' && rhythms.tracks[TrackToBuild].run.addPitches == false) return;
	if (typeof rhythms.tracks[TrackToBuild].pitches == 'undefined') return;
	
	log('addPitches(' + TrackToBuild + ')' + ' events:' + rhythms.tracks[TrackToBuild].events.length, 'info');
	//console.log('   start:\n' + JSON.stringify(rhythms) + '\n\n');
	var symbolIndex = 0;
	
	for (var result=1;result<=rhythms.tracks[TrackToBuild].events.length;result++) {
		rhythms.tracks[TrackToBuild].events[result-1].pitch = [];
		for (var i=0;i<rhythms.tracks[TrackToBuild].pitches[symbolIndex].length;i++) {
			//console.log('   TrackToBuild:' + TrackToBuild + '\tresult:' + result);
			//console.log('   interim:\n' + JSON.stringify(rhythms) + '\n\n');
			rhythms.tracks[TrackToBuild].events[result-1].pitch.push(rhythms.tracks[TrackToBuild].pitches[symbolIndex][i]);
		}
		symbolIndex += 1;
		if (symbolIndex >= rhythms.tracks[TrackToBuild].pitches.length) {
			symbolIndex = 0;
		}
	}
}

function getSubstitutePitch(interval, key, multiplier, intervalDirection, rootCode, invertPitchCode, bias) {
	var curPitchCode;
	if (intervalDirection < 0) {
		if (multiplier != 1) {
			curPitchCode = rootCode - (interval*Math.abs(multiplier));
		} else {
			curPitchCode = invertPitchCode;
		}
	} else {
		if (multiplier != 1) {
			curPitchCode = rootCode + (interval*Math.abs(multiplier));
		} else {
			curPitchCode = invertPitchCode;
		}
	}
	if (typeof key.scale == 'undefined' || key.scale == "Chromatic") {
		return curPitchCode;		
	}
	
	var curPitchName = getPitchCode(curPitchCode,"pitch");
	//console.log('curPitchCode:' + curPitchCode + ' curPitchName:' + JSON.stringify(curPitchName));
	var intCurPitchCode = Math.round(curPitchCode);
	var tempPitch = curPitchName.match(/([A|B|C|D|E|F|G][#|b]?)(-?\d\d?)/);
	//console.log('tempPitch:' + tempPitch);
	var octave = tempPitch[2];
	var scale = {};
	scale = getExplicitScale(key, scale);
	var scalePitches = flattenArray(scale.scale.pitches);
	//console.log(JSON.stringify(scalePitches));
	var closestPitchCode;
	var closestDistance = 999;
	//var closestScalePitch;
	if (bias == '+') {
		for (var i=0;i<scalePitches.length;i++) {
			var compPitchName = scalePitches[i] + octave.toString()
			var compPitchCode = getPitchCode(compPitchName,"code");

			if (Math.abs((intCurPitchCode - compPitchCode)) <= closestDistance) {
				closestPitchCode = compPitchCode;
				closestDistance = Math.abs(intCurPitchCode - compPitchCode)
			}
			//console.log('curPitchName:' + curPitchName + '   curPitchCode:' + intCurPitchCode + '   compPitchName:' + compPitchName + '   compPitchCode:' + compPitchCode + '   closestPitchCode:' + closestPitchCode + ' closestDistance:' + closestDistance + '   currentDistance:' + Math.abs(intCurPitchCode - compPitchCode));
		}
	} else {
		for (var i=scalePitches.length-1;i>0;i--) {
			var compPitchName = scalePitches[i] + octave.toString()
			var compPitchCode = getPitchCode(compPitchName,"code");

			if (Math.abs((intCurPitchCode - compPitchCode)) <= closestDistance) {
				closestPitchCode = compPitchCode;
				closestDistance = Math.abs(intCurPitchCode - compPitchCode)
			}
			//console.log('curPitchName:' + curPitchName + '   curPitchCode:' + intCurPitchCode + '   compPitchName:' + compPitchName + '   compPitchCode:' + compPitchCode + '   closestPitchCode:' + closestPitchCode + ' closestDistance:' + closestDistance + '   currentDistance:' + Math.abs(intCurPitchCode - compPitchCode));
		}
	}
	//console.log('closestPitchCode:' + closestPitchCode);
	return closestPitchCode;
}

function geometricTrackChromatic(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.expandInvert != 'undefined' && rhythms.tracks[TrackToBuild].run.expandInvert == false) return;
	var rootPitch
	if (typeof rhythms.tracks[TrackToBuild].pitchRoot != 'undefined') {
		rootPitch = rhythms.tracks[TrackToBuild].pitchRoot;
	} else {
		return;
	}
	log('geometricTrackChromatic(' + TrackToBuild + ')','info');
	var multiplier = 1;
	if (typeof rhythms.tracks[TrackToBuild].pitchMultiplier != 'undefined') {
		multiplier = rhythms.tracks[TrackToBuild].pitchMultiplier;
	}
	if (multiplier==0) multiplier=1;
	
	var sharpFlatFlag;
	if (typeof rhythms.tracks[TrackToBuild].sharpFlatFlag != 'undefined') {
		sharpFlatFlag = rhythms.tracks[TrackToBuild].sharpFlatFlag;
	} else {
		sharpFlatFlag = '#';
	}
	var minPitch;
	if (typeof rhythms.tracks[TrackToBuild].refitToMinPitch != 'undefined') {
		minPitch = rhythms.tracks[TrackToBuild].refitToMinPitch;
	} else {
		minPitch = "A0";
	}
	var minPitchCode = getPitchCode(minPitch,"code");
	var maxPitch;
	if (typeof rhythms.tracks[TrackToBuild].refitToMaxPitch != 'undefined') {
		maxPitch = rhythms.tracks[TrackToBuild].refitToMaxPitch;
	} else {
		maxPitch = "Ab9";
	}
	var maxPitchCode = getPitchCode(maxPitch,"code");
	
	var invertPitchCode = 0;
	var rootCode = getPitchCode(rootPitch,"code");
	
	//console.log('   rootPitch:' + rootPitch + ' rootCode:' + rootCode + ' multiplier:' + multiplier + ' sharpFlatFlag:' + sharpFlatFlag + ' minPitch:' + minPitch + ' minPitchCode:' + minPitchCode + ' maxPitch:' + maxPitch + ' maxPitchCode:' + maxPitchCode + ' length:' + rhythms.tracks[TrackToBuild].events.length,'info');
	
	for (noteIndex=0;noteIndex<rhythms.tracks[TrackToBuild].events.length;noteIndex++) {
		var newPitches = [];
		//console.log('    --pitch count:' + rhythms.tracks[TrackToBuild].events[noteIndex].pitch.length);
		for (var i=0;i<rhythms.tracks[TrackToBuild].events[noteIndex].pitch.length;i++) {
			var tempPitch = rhythms.tracks[TrackToBuild].events[noteIndex].pitch[i];
			var curPitch;
			if(tempPitch instanceof Array) {
				curPitch = tempPitch;
			} else {
				curPitch = [];
				curPitch.push(tempPitch);
			}
			//console.log('    --voice count:' + curPitch.length);
			for (var pitchCodeIndex=0;pitchCodeIndex<curPitch.length;pitchCodeIndex++) {
				invertPitchCode = getPitchCode(curPitch[pitchCodeIndex],"code");
				var interval = (invertPitchCode - rootCode);
				var intervalDirection = interval * multiplier;
				var key = {};
				if (typeof rhythms.tracks[TrackToBuild].events[noteIndex].keyOf != 'undefined') {
					key = parsekeyOf(rhythms.tracks[TrackToBuild].events[noteIndex].keyOf);
				} else if (typeof rhythms.tracks[TrackToBuild].keyOf != 'undefined') {
					key = parsekeyOf(rhythms.tracks[TrackToBuild].keyOf);
				} else {
					key.scale = "Chromatic";
				}
				curPitchCode = getSubstitutePitch(interval, key, multiplier, intervalDirection, rootCode, invertPitchCode, '+');
				var newPitchCode = getPitchInRange(minPitchCode,maxPitchCode,curPitchCode);
				newPitches.push(setSharpFlat(getPitchCode(newPitchCode,"pitch"),sharpFlatFlag));
			}
		}
		rhythms.tracks[TrackToBuild].events[noteIndex].pitch = newPitches;
	}
}

function setSharpFlat(pitchCode, sharpOrFlat) {
	if (typeof pitchCode == 'undefined') return;
	var tempPitch;
	var returnPitch = [];
	for (var i=0;i<pitchCode.length;i++) {
		if (sharpOrFlat == '#') {
			tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]#\d/);
			if (tempPitch != null) {
				returnPitch.push(tempPitch);
			} else {
				tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]\d/);
				if (tempPitch != null) {
					returnPitch.push(tempPitch);
				}
			}
		} else {
			tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]b\d/);
			if (tempPitch != null) {
				returnPitch.push(tempPitch);
			} else {
				tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]\d/);
				if (tempPitch != null) {
					returnPitch.push(tempPitch);
				}
			}
		}
	}
	if (returnPitch.length == 0) {
		returnPitch.push(flattenArray(pitchCode));
	}
	//console.log('pitchCode:' + pitchCode + ' sharpOrFlat:' + sharpOrFlat + ' tempPitch:' + tempPitch + ' returnPitch:' + returnPitch + ' returnPitchLength:' + returnPitch.length);
	return flattenArray(returnPitch);
}

function getPitchCode(pitch, getCodeOrPitch) {
	var pitches = pitchChords.pitches
	if (typeof pitch == 'undefined' || pitch.length < 2) return;
	if (typeof getCodeOrPitch == 'undefined' || getCodeOrPitch == "code") {
		//console.log('getPitchCode(pitch:' + pitch + ', getCodeOrPitch:' + getCodeOrPitch + ' pitches.length:' + pitches.length);
		for (var pitchFinderCount=0;pitchFinderCount<pitches.length;pitchFinderCount++) {
			for (i=0;i<pitches[pitchFinderCount].length;i++) {
				if (pitch == pitches[pitchFinderCount][i]) {
					//console.log('   found Pitch Code:' + pitchFinderCount + ' for pitch:' + pitch,'debug');
					return pitchFinderCount;
				}
				for (j=0;j<pitch.length;j++) {
					if (pitch[j] == pitches[pitchFinderCount][i]) {
						//console.log('  found Pitch Code:' + pitchFinderCount + ' for pitch:' + pitch);
						return pitchFinderCount;
					}
				}
			}
		}
		log('***ERROR Pitch Code NOT FOUND:' + pitch,'error');
		return 0;
	} else {
		pitch = Math.round(pitch);
		if (pitch < pitches.length) {
			//console.log('   found Pitch:' + JSON.stringify(pitches[pitch]) + ' for Code:' + pitch,'debug');
			return pitches[pitch];
		} else {
			log('***ERROR Pitch NOT FOUND for Code:' + pitch,'error');
			return 0;
		}
	}
}

function getPitchInRange(minPitch,maxPitch,currentPitch) {
	var curPitch = Math.round(currentPitch);
	var range = 12;
	if ((maxPitch - minPitch + 1) < 12) {
		range = (maxPitch - minPitch + 1);
	}
	var index = pitchChords.pitches.length / range;
	//TODO if diff between min & max is < 12, use it
	//console.log('getPitchInRange(minPitch:' + minPitch + ' maxPitch:' + maxPitch + ' curPitch:' + curPitch + ')','error');
	if (curPitch < minPitch) {
		//console.log('curPitch < minPitch');
		for (var i=1;i<=index;i++) {
			var tempcurrentPitch = curPitch + (range*i);
			//console.log('TEST < curPitch:' + curPitch + ' new:' + tempcurrentPitch + ' min:' + minPitch + ' max:' + maxPitch + ' i:' + i);
			if (tempcurrentPitch >= minPitch && tempcurrentPitch <= maxPitch) {
				//console.log('FOUND curPitch < minPitch - curPitch:' + currentPitch + ' new:' + tempcurrentPitch);
				return tempcurrentPitch;
			}
		}
	} else if (curPitch > maxPitch) {
		for (var i=-1;i>=-index;i--) {
			var tempcurrentPitch = curPitch + (range*i);
			//console.log('TEST > curPitch:' + curPitch + ' new:' + tempcurrentPitch + ' min:' + minPitch + ' max:' + maxPitch + ' i:' + i);
			if (tempcurrentPitch >= minPitch && tempcurrentPitch <= maxPitch) {
				//console.log('FOUND curPitch > maxPitch - curPitch:' + curPitch + ' new:' + tempcurrentPitch);
				return tempcurrentPitch;
			}
		}
	} else {
		return curPitch;
	}
	log('*****ERROR - Cannot get pitch in range' + ' curPitch:' + curPitch + ' maxPitch:' + maxPitch + ' minPitch:' + minPitch + ' range:' + range, 'error');
	return 0;
}

//Timbre - MidiControlEvents
function addControlEvents(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.addControlEvents != 'undefined' && rhythms.tracks[TrackToBuild].run.addControlEvents == false) return;
	if (typeof rhythms.tracks[TrackToBuild].controlEvents == 'undefined') return;
	log('addControlEvents(' + TrackToBuild + ')', 'info');

	eventIndex = 0;
	//get next controlEvent
	//log('controlEventsCount:' + rhythms.tracks[TrackToBuild].controlEvents.length, 'info');
	for (controllerIndex=0;controllerIndex<rhythms.tracks[TrackToBuild].controlEvents.length;controllerIndex++) {
	//get next 
		controlValueIndex = 0;
		//log('controllerIndex:' + controllerIndex + 'sourceEventsLength:' + rhythms.tracks[rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].controlSource].events.length, 'info');
		endInversion:
		for (durationIndex=0;durationIndex<rhythms.tracks[rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].controlSource].events.length;durationIndex++) {
			//log('   controllerIndex:' + controllerIndex + '   durationIndex:' + durationIndex, 'info');
			for (cycleIndex=0;cycleIndex<rhythms.tracks[rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].controlSource].events[durationIndex].duration;cycleIndex++) {
				//log('      durationIndex:' + durationIndex + '   cycleIndex:' + cycleIndex,'info');
				control = {};
				//control.channel = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].channel;
				control.controller = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].controller;
				if (rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].direction == "count") {
					if (rhythms.tracks[TrackToBuild].events[eventIndex].count > 0) {
						control.startValue = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[rhythms.tracks[TrackToBuild].events[eventIndex].count-1];
					} else {
						control.startValue = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[rhythms.tracks[TrackToBuild].events[eventIndex].count];
					}
				} else {
					control.startValue = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].startValue;
				}
				control.interpolationType = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].interpolationType
				if (typeof rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].stepSize != 'undefined') {
				control.stepSize = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].stepSize;
				}
				if (typeof rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].endValue != 'undefined') {
					control.endValue = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].endValue;
				}
				if (typeof rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].bend != 'undefined') {
				control.bend = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values[controlValueIndex].bend;
				}
				//console.log('       eventIndex:' + eventIndex + '   ' + JSON.stringify(control));
				if (typeof rhythms.tracks[TrackToBuild].events[eventIndex].control == 'undefined') {
					rhythms.tracks[TrackToBuild].events[eventIndex].control = [];
				}
				rhythms.tracks[TrackToBuild].events[eventIndex].control.push(control);
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) {
					eventIndex = 0;
					break endInversion;
				}
			}
			
			if (rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].direction == "+") {
				controlValueIndex++;
				if (controlValueIndex > rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values.length-1) {
					controlValueIndex = 0;
				}
			} else if (rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].direction == "-") {
				controlValueIndex--;
				if (controlValueIndex < 0) {
					controlValueIndex = rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values.length-1;
				}
			} else if (rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].direction == "random") {
				controlValueIndex = Math.floor(Math.random() * rhythms.tracks[TrackToBuild].controlEvents[controllerIndex].values.length);

			}
		}
	}
}

//Chords
function addChordSymbols(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.addChordSymbols != 'undefined' && rhythms.tracks[TrackToBuild].run.addChordSymbols == false) return;
	if (typeof rhythms.tracks[TrackToBuild].chords == 'undefined') return;
	log('addChordSymbols(' + TrackToBuild + ')', 'info');
	
	var symbolIndex = 0;
	
	for (var result=1;result<=rhythms.tracks[TrackToBuild].events.length;result++) {
		for (var i=0;i<rhythms.tracks[TrackToBuild].chords[symbolIndex].length;i++) {
			if (typeof rhythms.tracks[TrackToBuild].events[result-1].chord == 'undefined') {
				rhythms.tracks[TrackToBuild].events[result-1].chord = [];
			}
			rhythms.tracks[TrackToBuild].events[result-1].chord.push(rhythms.tracks[TrackToBuild].chords[symbolIndex][i]);
		}
		symbolIndex += 1;
		if (symbolIndex >= rhythms.tracks[TrackToBuild].chords.length) {
			symbolIndex = 0;
		}
	}
}

function generateProgression(TrackToBuild) {
	log('generateProgression(' + TrackToBuild + ')','info');
	var key;
	if (typeof rhythms.tracks[TrackToBuild].keyOf != 'undefined') {
		key = parsekeyOf(rhythms.tracks[TrackToBuild].keyOf);
	} else {
		return;
	}
	var motion = {};
	motion.progressionCycles = rhythms.tracks[TrackToBuild].progressionCycles;
	motion.currentProgressionCycle = 0;
	motion.progressionSource = rhythms.tracks[TrackToBuild].progressionSource;
	motion.progressionDirection = rhythms.tracks[TrackToBuild].progressionDirection;
	motion.currentInversionCycle = 0;
	motion.inversionCycles = rhythms.tracks[TrackToBuild].inversionCycles;
	motion.inversionSource = rhythms.tracks[TrackToBuild].inversionSource;
	motion.inversionDirection = rhythms.tracks[TrackToBuild].inversionDirection;
	motion.currentVoicingCycle = 0;
	motion.voicingCycles = rhythms.tracks[TrackToBuild].voicingCycles;
	motion.voicingSource = rhythms.tracks[TrackToBuild].voicingSource;
	motion.voicingDirection = rhythms.tracks[TrackToBuild].voicingDirection;
	motion.currentOctaveCycle = 0;
	motion.octaveCycles = rhythms.tracks[TrackToBuild].octaveCycles;
	motion.octaveSource = rhythms.tracks[TrackToBuild].octaveSource;
	motion.octaveDirection = rhythms.tracks[TrackToBuild].octaveDirection;

	motion.voicingOctaveCycles = rhythms.tracks[TrackToBuild].voicingOctaveCycles;
	motion.voicingOctaveSource = rhythms.tracks[TrackToBuild].voicingOctaveSource;
	motion.voicingOctaveDirection = rhythms.tracks[TrackToBuild].voicingOctaveDirection;
	motion.currentVoicingOctaveCycle = 0;
	if (typeof rhythms.tracks[TrackToBuild].chordTypeCycles != 'undefined') {
		motion.currentChordTypeCycle = 0;
		motion.chordTypeCycles = rhythms.tracks[TrackToBuild].chordTypeCycles;
		motion.chordTypeSource = rhythms.tracks[TrackToBuild].chordTypeSource;
		motion.chordTypeDirection = rhythms.tracks[TrackToBuild].chordTypeDirection;
	}
	motion.progressionCycleDirection = rhythms.tracks[TrackToBuild].progressionCycleDirection;
	motion.progressionCycleMovement = rhythms.tracks[TrackToBuild].progressionCycleMovement;
	motion.currentProgressionCycleMovement = 0;
	var chord = {};
	for (progressionIndex=0;progressionIndex<rhythms.tracks[motion.progressionSource].events.length;progressionIndex++) {
		//cycleIndex = how many times we use a specific cycle.
		
		for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.progressionSource].events[progressionIndex].duration;cycleIndex++) {
			var newEvent = {};
			newEvent.index = progressionIndex;
			newEvent.duration = 1;
			newEvent.count = rhythms.tracks[motion.progressionSource].events[progressionIndex].count;
			newEvent.keyOf = rhythms.tracks[TrackToBuild].keyOf;
			newEvent.shortKey = rhythms.tracks[TrackToBuild].shortKeySignature;
			newEvent.instrumentName = rhythms.tracks[TrackToBuild].instrumentName;
			newEvent.instrumentCode = rhythms.tracks[TrackToBuild].instrumentCode;
			if (typeof rhythms.tracks[TrackToBuild].timeSignature != 'undefined') {
				newEvent.timeSignature = rhythms.tracks[TrackToBuild].timeSignature;
			} else {
				newEvent.timeSignature = rhythms.timeSignature;
			}
			newEvent.chord = [];
			newEvent.chord.push(getNextScaleChord(key,chord,motion));
			//console.log('!!!' + JSON.stringify(newEvent));
			//console.log('CycleIndex:' + cycleIndex + '   Chord:' + JSON.stringify(chord) + '    motion:' + JSON.stringify(motion) + '    newEvent:' + JSON.stringify(newEvent));
			rhythms.tracks[TrackToBuild].events.push(newEvent);
			//console.log('pushed:' + JSON.stringify(rhythms.tracks[TrackToBuild].events[rhythms.tracks[TrackToBuild].events.length-1]));
		}
		if (motion.progressionCycleDirection == "+") {
			motion.currentProgressionCycleMovement++;
			if (motion.currentProgressionCycleMovement > motion.progressionCycleMovement.length-1) motion.currentProgressionCycleMovement = 0;
		} else {
			motion.currentProgressionCycleMovement--
			if (motion.currentProgressionCycleMovement < 0) motion.currentProgressionCycleMovement = motion.progressionCycleMovement.length-1;
		}
		if (motion.progressionDirection == "+") {
			motion.currentProgressionCycle++;
			if (motion.currentProgressionCycle > motion.progressionCycles.length-1) motion.currentProgressionCycle = 0;
		} else {
			motion.currentProgressionCycle--;
			if (motion.currentProgressionCycle < 0) motion.currentProgressionCycle = motion.progressionCycles.length-1;
		}
	}
	if (typeof rhythms.tracks[TrackToBuild].chordTypeCycles != 'undefined' && typeof rhythms.tracks[TrackToBuild].chordTypeSource != 'undefined' && typeof rhythms.tracks[TrackToBuild].chordTypeDirection != 'undefined') {
		//cycle Type
		eventIndex = 0;
		chord.cycleType = 0;
		endCycleType:
		for (cycleTypeIndex=0;cycleTypeIndex<rhythms.tracks[motion.chordTypeSource].events.length;cycleTypeIndex++) {
			for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.chordTypeSource].events[cycleTypeIndex].duration;cycleIndex++) {
				var name;
				//get the chord name for the current event, augment it with the inversion, and then replace it.
				name = rhythms.tracks[TrackToBuild].events[eventIndex].chord[0];
				name = forceChordType(name,motion);
				rhythms.tracks[TrackToBuild].events[eventIndex].chord[0] = name;
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) break endCycleType;
			}
			if (typeof motion.chordTypeDirection != 'undefined') {
				if (motion.chordTypeDirection == "+") {
					motion.currentChordTypeCycle++;
					if (motion.currentChordTypeCycle > motion.chordTypeCycles.length-1) motion.currentChordTypeCycle = 0;
				} else {
					motion.currentChordTypeCycle--;
					if (motion.currentChordTypeCycle < 0) motion.currentChordTypeCycle = motion.chordTypeCycles.length-1;
				}
			}
		}
	}
	if (typeof rhythms.tracks[TrackToBuild].inversionCycles != 'undefined' && typeof rhythms.tracks[TrackToBuild].inversionSource != 'undefined' && typeof rhythms.tracks[TrackToBuild].inversionDirection != 'undefined') {
		//inversion
		eventIndex = 0;
		chord.inversion = 0;
		endInversion:
		for (inversionIndex=0;inversionIndex<rhythms.tracks[motion.inversionSource].events.length;inversionIndex++) {
			for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.inversionSource].events[inversionIndex].duration;cycleIndex++) {
				chord = {};
				//get the chord name for the current event, augment it with the inversion, and then replace it.
				chord.name = rhythms.tracks[TrackToBuild].events[eventIndex].chord;
				chord = getChordInversion(motion,chord);
				rhythms.tracks[TrackToBuild].events[eventIndex].chord[0] = chord.name;
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) break endInversion;
			}
			if (motion.inversionDirection = "+") {
				motion.currentInversionCycle++;
				if (motion.currentInversionCycle > motion.inversionCycles.length-1) motion.currentInversionCycle = 0;
			} else {
				motion.currentInversionCycle--;
				if (motion.currentInversionCycle < 0) motion.currentInversionCycle = motion.inversionCycles.length-1;
			}
		}
	}
	if (typeof rhythms.tracks[TrackToBuild].voicingCycles != 'undefined' && typeof rhythms.tracks[TrackToBuild].voicingSource != 'undefined' && typeof rhythms.tracks[TrackToBuild].voicingDirection != 'undefined') {
		//voicing
		eventIndex = 0;
		chord.voicing = 0;
		endVoicing:
		for (voicingIndex=0;voicingIndex<rhythms.tracks[motion.voicingSource].events.length;voicingIndex++) {
			for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.voicingSource].events[voicingIndex].duration;cycleIndex++) {
				chord = {};
				chord.name = rhythms.tracks[TrackToBuild].events[eventIndex].chord;
				chord = getChordVoicing(motion,chord);
				rhythms.tracks[TrackToBuild].events[eventIndex].chord[0] = chord.name;
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) break endVoicing;
			}
			if (motion.voicingDirection = "+") {
				motion.currentVoicingCycle++;
				if (motion.currentVoicingCycle > motion.voicingCycles.length-1) motion.currentVoicingCycle = 0;
			} else {
				motion.currentVoicingCycle--;
				if (motion.currentVoicingCycle < 0) motion.currentVoicingCycle = motion.voicingCycles.length-1;
			}
		}
	}

	if (typeof rhythms.tracks[TrackToBuild].octaveCycles != 'undefined' && typeof rhythms.tracks[TrackToBuild].octaveSource != 'undefined' && typeof rhythms.tracks[TrackToBuild].octaveDirection != 'undefined') {
		//octave
		eventIndex = 0;
		chord.octave = 0;
		endOctave:
		for (octaveIndex=0;octaveIndex<rhythms.tracks[motion.octaveSource].events.length;octaveIndex++) {
			for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.octaveSource].events[octaveIndex].duration;cycleIndex++) {
				chord = {};
				//get the chord name for the current event, augment it with the octave, and then replace it.
				chord.name = rhythms.tracks[TrackToBuild].events[eventIndex].chord;
				chord = getChordOctave(motion,chord);
				rhythms.tracks[TrackToBuild].events[eventIndex].chord[0] = chord.name;
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) break endOctave;
			}
			if (motion.octaveDirection = "+") {
				motion.currentOctaveCycle++;
				if (motion.currentOctaveCycle > motion.octaveCycles.length-1) motion.currentOctaveCycle = 0;
			} else {
				motion.currentOctaveCycle--;
				if (motion.currentOctaveCycle < 0) motion.currentOctaveCycle = motion.octaveCycles.length-1;
			}
		}
	}
	if (typeof rhythms.tracks[TrackToBuild].voicingOctaveCycles != 'undefined' && typeof rhythms.tracks[TrackToBuild].voicingOctaveSource != 'undefined' && typeof rhythms.tracks[TrackToBuild].voicingOctaveDirection != 'undefined') {
		//voicing
		eventIndex = 0;
		chord.voicingOctave = 0;
		endVoicingOctave:
		for (voicingOctaveIndex=0;voicingOctaveIndex<rhythms.tracks[motion.voicingOctaveSource].events.length;voicingOctaveIndex++) {
			for (cycleIndex=0;cycleIndex<rhythms.tracks[motion.voicingOctaveSource].events[voicingOctaveIndex].duration;cycleIndex++) {
				chord = {};
				chord.name = rhythms.tracks[TrackToBuild].events[eventIndex].chord;
				chord = getChordVoicingOctave(motion,chord);
				rhythms.tracks[TrackToBuild].events[eventIndex].chord[0] = chord.name;
				eventIndex++;
				if (eventIndex > rhythms.tracks[TrackToBuild].events.length-1) break endVoicingOctave;
			}
			if (motion.voicingOctaveDirection = "+") {
				motion.currentVoicingOctaveCycle++;
				if (motion.currentVoicingOctaveCycle > motion.voicingOctaveCycles.length-1) motion.currentVoicingOctaveCycle = 0;
			} else {
				motion.currentVoicingOctaveCycle--;
				if (motion.currentVoicingOctaveCycle < 0) motion.currentVoicingOctaveCycle = motion.voicingOctaveCycles.length-1;
			}
		}
	}
	fixIndexValues(TrackToBuild);
	rhythms.tracks[TrackToBuild].run.run = false;
}

function forceChordType(name,motion) {
	var newName = name.toString();
	var tempRoot = name.toString();
	if (typeof motion.chordTypeDirection != 'undefined') {
		//get the next element in the scaleType list
		if (motion.chordTypeCycles[motion.currentChordTypeCycle] == "M") {
			newName = newName.toUpperCase();
			newName = newName.replace("+","");
			newName = newName.replace("°","");
			//console.log("M: " + newName + " Old:" + tempRoot);
		} else if (motion.chordTypeCycles[motion.currentChordTypeCycle] == "m") {
			newName = newName.replace("+","");
			newName = newName.replace("°","");
			newName = newName.toLowerCase();
			//console.log("m: " + JSON.stringify(newName) + " Old:" + JSON.stringify(tempRoot));
		} else if (motion.chordTypeCycles[motion.currentChordTypeCycle] == "°" || motion.chordTypeCycles[motion.currentChordTypeCycle] == "o") {
			newName = newName.toLowerCase();
			if (newName.indexOf("°") == -1) {
				newName += "°";
			}
			//console.log("o: " + JSON.stringify(newName) + " Old:" + JSON.stringify(tempRoot));
		} else if (motion.chordTypeCycles[motion.currentChordTypeCycle] == "+") {
			newName = newName.toUpperCase();
			if (newName.indexOf("+") == -1) {
				newName += "+";
			}
			//console.log("+: " + JSON.stringify(newName) + " Old:" + JSON.stringify(tempRoot));
		}
		return newName;
	}
	//console.log("***: " + JSON.stringify(newName) + " Old:" + JSON.stringify(tempRoot));
	return name;
}

function getNextScaleChord(key,chord,motion) {
	//console.log('getNextScaleChord' + ' key:' + JSON.stringify(key) + ' chord:' + JSON.stringify(chord) + ' motion:' + JSON.stringify(motion));
	var triads = key.relativeScale.scale;
	var curIndex = 0;
	if (typeof chord.currentRoot != 'undefined') {
		for (i=0;i<triads.length;i++) {
			if (triads[i] == chord.currentRoot) {
				curIndex = i;
				break;
			}
		}
		offset = motion.progressionCycles[motion.currentProgressionCycle] - 1;
		//console.log('---' + motion.currentProgressionCycleMovement + '    ' + motion.progressionCycleMovement[motion.currentProgressionCycleMovement]);
		if (motion.progressionCycleMovement[motion.currentProgressionCycleMovement] == "+") {
			newIndex = curIndex + offset;
			while (newIndex > (triads.length - 1)) {
				newIndex = newIndex - triads.length;
			}
		} else {
			newIndex = curIndex - offset;
			while (newIndex < 0) {
				newIndex = newIndex + triads.length;
			}
		}
		chord.currentRoot = triads[newIndex];
	} else {
		//console.log('triads:' + JSON.stringify(triads));
		chord.currentRoot = triads[0];
	}
	return chord.currentRoot;
}

function getChordInversion(motion,chord) {
	chord.name += "n" + motion.inversionCycles[motion.currentInversionCycle];
	return chord;
}

function getChordVoicing(motion,chord) {
	chord.name += "w" + motion.voicingCycles[motion.currentVoicingCycle];
	return chord;
}

function getChordOctave(motion,chord) {
	chord.name += "r" + motion.octaveCycles[motion.currentOctaveCycle];
	return chord;
}

function getChordVoicingOctave(motion,chord) {
	//console.log('voicingOctave:' + chord.name + ' currentVoicingOctaveCycle:' + motion.currentVoicingOctaveCycle + ' voicingOctaveCycles[current]:' + motion.voicingOctaveCycles[motion.currentVoicingOctaveCycle]);
	chord.name += "y" + motion.voicingOctaveCycles[motion.currentVoicingOctaveCycle];
	return chord;
}

function parsekeyOf(keyOf) {
	var keyString = keyOf.toString();
	key = {}
	//key.scale = {};
	//console.log('keyString:' + keyString);

	var temp = keyString.match(/(Major|Ionian|Minor|Natural Minor|Aeolian|Harmonic Minor|Melodic Minor|Whole Tone|Pentatonic|Dorian|Phrygian|Lydian|Mixolydian|Locrian|Chromatic)/)
	if (temp != null && temp.length > 0) {
		//console.log('scale match:' + JSON.stringify(temp) + ':');
		key.scaleName = temp[1].toString();
		keyString = keyString.replace(key.scale,'');
	} else {
		key.scaleName = "Major";
	}
	var temp = keyString.match(/^[A|B|C|D|E|F|G][#|b]?/);
	if (temp != null && temp.length > 0) {
		//console.log('key match!' + temp);
		key.signature = temp.toString();
		keyString = keyString.replace(key.signature,'');
	} else {
		key.signature = "C";
	}
	//console.log('----temp:' + temp);
	key.sharpFlatFlag = '#';
	/*
	for (var i=0;i<pitchChords.keys.length;i++) {
		if (pitchChords.keys[i].key == key.signature) {
			key.sharpFlatFlag = pitchChords.keys[i].sharpFlat;
			break;
		}
	}
	*/
	key.relativeScale = getRelativeScale(key);
	key.explicitScale = getExplicitScale(key);
	key.sharpFlatFlag = key.explicitScale.sharpFlat;
	//console.log('key:' + JSON.stringify(key));
	return key;	
}

function getRelativeScale(key) {
	var scale = {};
	for (var i=0;i<pitchChords.scales.length;i++) {
		for (var j=0;j<pitchChords.scales[i].scaleNames.length;j++) {
			//console.log('--names:' + pitchChords.scalesExpanded[scale.keyIndex].scales[i].names[j].toString() + ' scale:' + key.scale);
			if (pitchChords.scales[i].scaleNames[j].toString() == key.scaleName) {
				//console.log('found:' + key.scaleName + ' scales:' + JSON.stringify(pitchChords.scales[i]));
				scale.names = []
				scale.names.push(pitchChords.scales[i].scaleNames[j]);
				scale.scale = pitchChords.scales[i].relativeChords[0].triads
				return scale;
			}
		}
	}
	return scale;
}
	
function getExplicitScale(key) {
	var scale = {};
	scale.keyIndex = -1;
	for (var i=0;i<pitchChords.scalesExpanded.length;i++) {
		//console.log('-----keys:' + pitchChords.scalesExpanded[i].keys);
		if (pitchChords.scalesExpanded[i].keys == key.signature) {
			scale.keyIndex = i;
			break;
		}
	}
	for (var i=0;i<pitchChords.scalesExpanded[scale.keyIndex].scales.length;i++) {
		for (var j=0;j<pitchChords.scalesExpanded[scale.keyIndex].scales[i].names.length;j++) {
			//console.log('-----scales:' + pitchChords.scalesExpanded[key.explicitScale.keyIndex].scales[i].names[j] + ' key:' + JSON.stringify(key));
			if (pitchChords.scalesExpanded[scale.keyIndex].scales[i].names[j].toString() == key.scaleName) {
				scale.names = []
				scale.names.push(pitchChords.scalesExpanded[scale.keyIndex].scales[i].names);
				//console.log('------FOUND SCALE!');
				scale.scale = pitchChords.scalesExpanded[scale.keyIndex].scales[i].pitches;
				scale.sharpFlat = pitchChords.scalesExpanded[scale.keyIndex].scales[i].sharpFlat;
				//console.log('returned scale 1:' + JSON.stringify(key));
				return scale;
			}
		}
	}
	//console.log('returned scale 2:' + JSON.stringify(key));
	return scale;
}

function parseChordSymbol(key,chord) {
	//console.log('   parseChordSymbol' + JSON.stringify(chord));
	chord.root = '';
	var temp
	temp = chord.symbol.match(/^[A|B|C|D|E|F|G][#|b]?/);
	if (temp != null && temp.length > 0) {
		chord.root = temp[0].toString();
		chord.symbol = chord.symbol.replace(chord.root,'');
		chord.assumedType = "Maj";
		chord.scaleType = "explicit";
	}
	if (chord.root == '') {
		var temp = chord.symbol.match(/^[a|b|c|d|e|f|g][°][#|b]?/);
		if (temp != null && temp.length > 0) {
			chord.root = temp[0].toString();
			chord.symbol = chord.symbol.replace(chord.root,'');
			chord.root = chord.root.toUpperCase();
			chord.assumedType = "°";
			chord.scaleType = "explicit";
		}
	}
	if (chord.root == '') {
		var temp = chord.symbol.match(/^[a|b|c|d|e|f|g][+][#|b]?/);
		if (temp != null && temp.length > 0) {
			chord.root = temp[0].toString();
			chord.symbol = chord.symbol.replace(chord.root,'');
			chord.root = chord.root.toUpperCase();
			chord.assumedType = "+";
			chord.scaleType = "explicit";
		}
	}
	if (chord.root == '') {
		var temp = chord.symbol.match(/^[a|b|c|d|e|f|g][#|b]?/);
		if (temp != null && temp.length > 0) {
			chord.root = temp[0].toString();
			chord.symbol = chord.symbol.replace(chord.root,'');
			chord.root = chord.root.toUpperCase();
			chord.assumedType = "min";
			chord.scaleType = "explicit";
		}
	}
	if (chord.root == '') {
		var temp = chord.symbol.match(/^(VII|vii|IV|iv|VI|vi|III|iii|II|ii|I|i|V|v)(#|b)?/);
		if (temp != null && temp.length > 0) {
			temp = temp[0].toString();
			//console.log('found temp:' + temp + '   symbol:' + chord.symbol);
			var offset;
			if (temp == "I") {
				chord.offset = 0;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "i") {
				chord.offset = 0;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "II") {
				chord.offset = 1;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "ii") {
				chord.offset = 1;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "III") {
				chord.offset = 2;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "iii") {
				chord.offset = 2;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "IV") {
				chord.offset = 3;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "iv") {
				chord.offset = 3;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "V") {
				chord.offset = 4;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "v") {
				chord.offset = 4;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "VI") {
				chord.offset = 5;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "vi") {
				chord.offset = 5;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			} else if (temp == "VII") {
				chord.offset = 6;
				chord.assumedType = "Maj";
				chord.scaleType = "relative";
			} else if (temp == "vii") {
				chord.offset = 6;
				chord.assumedType = "min";
				chord.scaleType = "relative";
			}
			chord.symbol = chord.symbol.replace(temp,'');
			temp = chord.symbol.match(/\+/);
			if (temp != null && temp.length > 0) {
				chord.assumedType = "+";
				chord.symbol = chord.symbol.replace(temp,'');
			}
			temp = chord.symbol.match(/°/);
			if (temp != null && temp.length > 0) {
				chord.assumedType = "°";
				chord.symbol = chord.symbol.replace(temp,'');
			}
			chord.root = key.relativeScale.scale[chord.offset];
			chord.root = key.explicitScale.scale[0][chord.offset];
			//chord.symbol = chord.symbol.replace(temp,'');	
			//console.log('chord1:' + JSON.stringify(chord));
		}
	}
	return chord;
}

function parseChordOctaveInversionVoicing(chord) {
	//console.log('   parseChordOctaveInversionVoicing');
	var temp = chord.symbol.match(/r[0-9]/);
	if (temp != null && temp.length > 0) {
		chord.octave = temp.toString();
		chord.symbol = chord.symbol.replace(chord.octave,'');
		chord.octave = chord.octave.replace('r','');
	} else {
		chord.octave = 3;
	}
	//voice doubling
	var temp = chord.symbol.match(/w[0-9]{1,2}/);
	if (temp != null && temp.length > 0) {
		chord.voicing = temp.toString();
		chord.symbol = chord.symbol.replace(chord.voicing,'');
		chord.voicing = chord.voicing.replace('w','');
	} else {
		chord.voicing = 0;
	}
	//doubled voice octave multiplier
	var temp = chord.symbol.match(/y[0-9]{1,2}/);
	if (temp != null && temp.length > 0) {
		chord.voicingOctave = temp.toString();
		chord.symbol = chord.symbol.replace(chord.voicingOctave,'');
		chord.voicingOctave = chord.voicingOctave.replace('y','');
	} else {
		chord.voicingOctave = 1;
	}
	//inversion
	var temp = chord.symbol.match(/n[0-9]{1,2}/);
	if (temp != null && temp.length > 0) {
		chord.inversion = temp.toString();
		//console.log(' FOUND - chord.inversion:' + (typeof chord.inversion) + ' ' + chord.inversion);
		chord.symbol = chord.symbol.replace(chord.inversion,'');
		chord.inversion = chord.inversion.replace('n','');
	} else {
		chord.inversion = '0';
	}
	
	if (chord.symbol != '') {
		chord.type = chord.symbol; //symbol is now assumed to hold the remainder of the chord symbol as entered.
	} else if (chord.assumedType != '') {
		chord.type = chord.assumedType;
	}
	
	return chord;
}

function getOctaveInversionVoicingIndex(chord) {
	//console.log('   getOctaveInversionVoicingIndex ' + JSON.stringify(chord));
	chord.typeIndex = -1;
	chord.inversionIndex = 0;
	chord.voicingIndex = 0;
	//find the type
	for (i=0;i<pitchChords.chords.length;i++) {
		//console.log('     pcsL:' + pitchChords.chords[i].symbols.length);
		for (j=0;j<pitchChords.chords[i].symbols.length;j++) {
			if (pitchChords.chords[i].symbols[j] == chord.type) {
				chord.typeIndex = i;
			}
		}
	}
	//console.log('   type:' + chord.typeIndex + 'inversion:' + inversion + 'voicing:' + voicing );
	if (chord.typeIndex == -1) {
		//if we didn't succeed, then fail? or default?
		log('chord not found  ' + 'chord:' + JSON.stringify(chord),'error');
		chord.error = 'Chord not found!';
		return chord;
	}
	//find the inversion
	for (i=0;i<pitchChords.chords[chord.typeIndex].toneOffsets.length;i++) {
		if (pitchChords.chords[chord.typeIndex].toneOffsets[i].inversion == chord.inversion) {
			chord.inversionIndex = i;
		}
	}
	return chord;
}

function getChordPitches(key,chord) {
	console.log('getChordPitches:' + JSON.stringify(chord) + ' key:' + JSON.stringify(key));
	chord.rootCode = getPitchCode(chord.root+chord.octave,"code")
	//console.log('---chord root:' + JSON.stringify(chord.rootCode));
	var newPitchArray = [];
	for (i=0;i<pitchChords.chords[chord.typeIndex].toneOffsets[chord.inversionIndex].offsets.length;i++) {
		newPitchArray.push(setSharpFlat(getPitchCode(chord.rootCode + pitchChords.chords[chord.typeIndex].toneOffsets[chord.inversionIndex].offsets[i],"pitch"),key.sharpFlatFlag));

		console.log('pitch:' + (chord.rootCode + pitchChords.chords[chord.typeIndex].toneOffsets[chord.inversionIndex].offsets[i]) + '  ' + setSharpFlat(getPitchCode(chord.rootCode + pitchChords.chords[chord.typeIndex].toneOffsets[chord.inversionIndex].offsets[i],"pitch")));
		//newPitchArray.push(singlePitchArray);
	}
	if (chord.voicing > 0) {
		//console.log('.voicing:' + chord.voicing + ' voicingOctave:' + chord.voicingOctave);
		var voiceOctaveMultiplier = 12 * chord.voicingOctave;
		newPitchArray.push(setSharpFlat(getPitchCode(chord.rootCode + pitchChords.chords[chord.typeIndex].toneOffsets[chord.inversionIndex].offsets[chord.voicing - 1] + voiceOctaveMultiplier,"pitch"),key.sharpFlatFlag));
	}
	return newPitchArray;
}

function convertChordsToPitches(TrackToBuild) {
	if (typeof rhythms.tracks[TrackToBuild].run.convertChordsToPitches != 'undefined' && rhythms.tracks[TrackToBuild].run.convertChordsToPitches == false) return;
	//var key;
	//if (typeof rhythms.tracks[TrackToBuild].keyOf != 'undefined') {
	//	key = parsekeyOf(rhythms.tracks[TrackToBuild].keyOf);
	//} else {
	//	return;
	//}
	log('convertChordsToPitches(' + TrackToBuild + ')', 'info');
	for (var result=0;result<rhythms.tracks[TrackToBuild].events.length;result++) {
		if (typeof rhythms.tracks[TrackToBuild].events[result].chord != 'undefined') {
			if (typeof rhythms.tracks[TrackToBuild].events[result].keyOf != 'undefined') {
				key = parsekeyOf(rhythms.tracks[TrackToBuild].events[result].keyOf);
			}
			var chord = {};
			chord.symbol = rhythms.tracks[TrackToBuild].events[result].chord[0];
			//console.log(' ------------ ' + rhythms.tracks[TrackToBuild].events[result].chord);
			chord = parseChordSymbol(key,chord);
			//console.log('  chord1:' + JSON.stringify(chord));
			chord = parseChordOctaveInversionVoicing(chord);
			chord = getOctaveInversionVoicingIndex(chord);
			//console.log('  chord2:' + JSON.stringify(key));
			rhythms.tracks[TrackToBuild].events[result].pitch = flattenArray(getChordPitches(key,chord));
		}
	}
}

function getKeysForPitches(pitches) {
	//given an array of pitches, returns an array of keys that the pitches fall within.
	//
}

//Utilities
function flattenArray(inputArray) {
	return inputArray.flat(3);
}

function removeDupeArrayElements(inputArray) {
	if (inputArray.length == 1) {
		return inputArray;
	}
	var dedupe = [];
	dedupe.push(inputArray[0]);
	for (var input=1;input<inputArray.length;input++) {
		notFound = true;
		for (var dedupeIndex=0;dedupeIndex<dedupe.length;dedupeIndex++) {
			if (JSON.stringify(inputArray[input]) == JSON.stringify(dedupe[dedupeIndex])) {
				notFound = false;
				break;
			}
		}
		if (notFound) {
			dedupe.push(inputArray[input]);
		}
	}
	return dedupe;
}

function stringifySourceArray(jsonArray) {
	var temp = '';
	for (var i=0;i<jsonArray.length;i++) {
		if (i>0) {
			temp += ', ';
		}
		temp += jsonArray[i].source;
	}
	return temp;
}

function safeStringify(jsonInput) {
	var stringified = JSON.stringify(jsonInput,function(k,v){
		if(v instanceof Array)
			return JSON.stringify(v);
		   return v;
			},4)
			.replace(/"\[/g, '[')
			.replace(/\]"/g, ']')
			.replace(/\\"/g, '"')
			.replace(/""/g, '"');
			return stringified;
}

//File Generation

function getControlValue (noteEvent, controlChannel) {
	for (i=0;i<noteEvent.control.length;i++) {
		if (noteEvent.control[i].channel == controlChannel) {
			return noteEvent.control[i].value;
		}
	}
}

function buildPitchChartHTML(trackIndex) {
	var colorArray = ["black","blue","green","brown","gray"]
	//find middle note
	//set chart middle to that note
	var highestIndex = 0;
	var totalLength  = 0;
	log('Compute Highest Index Of This Track:' + trackIndex, 'debug');
	if (rhythms.tracks[trackIndex].events.length > 0) {
		noteIndex = rhythms.tracks[trackIndex].events.length-1;
		note = rhythms.tracks[trackIndex].events[noteIndex].index;
		duration = rhythms.tracks[trackIndex].events[noteIndex].duration;
		totalLength = note + duration;
		if (totalLength > highestIndex) {
			highestIndex = totalLength;
		}
	}

	var xValues = [];
	for (m=1;m<=highestIndex+1;m++) {
		xValues.push(m);
	}
	xValues.push('');
	var chartString = '';
	var chartHeight = 200;
	var chartDataArray = [];
	if (rhythms.tracks[trackIndex].events[0].index > 0) {
		totalFiller = rhythms.tracks[trackIndex].events[0].index;
		for (var m=0;m<totalFiller;m++) {
			chartDataArray.push(null);
		}
	}
	//log('   trackIndex:' + trackIndex + ' totalFiller:' + totalFiller + ' items:' + (rhythms.tracks[trackIndex].events.length-1) + ' last:' + rhythms.tracks[trackIndex].events[rhythms.tracks[trackIndex].events.length-1].index + ' MIDIChannel:' + rhythms.tracks[trackIndex].midiChannel, 'debug');
	var maxPitchCount = 0;
	maxPitch = 0;
	minPitch = 9999;
	for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
		if (typeof rhythms.tracks[trackIndex].events[noteIndex].pitch != 'undefined') {
			maxPitchCount = rhythms.tracks[trackIndex].events[noteIndex].pitch.length;
			for (var i=0;i<rhythms.tracks[trackIndex].events[noteIndex].pitch.length;i++) {
				var pitchText = rhythms.tracks[trackIndex].events[noteIndex].pitch[i];
				var pCode = Number.parseInt(getPitchCode(pitchText, "code"));
				//console.log(pitchText + ' ' + temp + ' ' + pCode + ' ' + minPitch + ' ' + maxPitch);
				if (pCode > maxPitch) {
					maxPitch = pCode;
				}
				if (pCode < minPitch) {
					minPitch = pCode;
				}
			}
		}
	}
	//console.log(minPitch + ' ' + maxPitch);
	if (maxPitchCount==0) {
		return '';
	}
	var yValues = []
	for (i=minPitch - 1;i<=maxPitch+1;i++) {
		yValues.push(getPitchCode(i,"pitch"));
		//yValues.push(i);
	}
	yValues = flattenArray(yValues);
	chartString += '<div>\n';
	chartString += '<canvas id="pitchChart' + trackIndex + '"></canvas>\n';
	chartString += '</div>\n';
	chartString += '<script>\n';
//	chartString += 'var xValues = ' + JSON.stringify(xValues) + ';\n';
//	chartString += 'var yValues = ' + JSON.stringify(yValues) + ';\n';
	chartString += 'new Chart("pitchChart' + trackIndex + '", {\n';
	chartString += '  type: "line",\n';
	chartString += '  data: {\n';
//	chartString += '    labels: xValues,\n';
	chartString += '	datasets: [\n';
	//console.log('maxPitchCount:' + maxPitchCount);
	
	for (var pitch=0;pitch<maxPitchCount;pitch++) {
		var lineColor = 'black';
		if (pitch<colorArray.length) {
			lineColor = colorArray[pitch];
		}
		
		for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
			if (typeof rhythms.tracks[trackIndex].events[noteIndex].pitch[pitch] != 'undefined' > 0) {
				for (var m=0;m<rhythms.tracks[trackIndex].events[noteIndex].duration;m++) {
					if (typeof rhythms.tracks[trackIndex].events[noteIndex].pitch[pitch] != 'undefined') {
						chartDataArray.push(getPitchCode(rhythms.tracks[trackIndex].events[noteIndex].pitch[pitch], "code"));
					} else {
						chartDataArray.push(0);
					}
				}
			}
		}
		if (pitch == 0) {
			chartString += '	{\n';
		} else {
			chartString += '	,{\n';
		}
		chartString += '      label: "' + rhythms.tracks[trackIndex].name + '",\n';
		chartString += '      data: ' + JSON.stringify(chartDataArray) + ',\n';
		chartString += '	  borderColor: "' + lineColor + '",\n';
		chartString += '	  stepped: true,\n';
		chartString += '	  spanGaps: false,\n';
		chartString += '	  pointRadius: 0,\n';
		chartString += '	  fill: false\n';
		chartString += '	}\n';
	}
	//console.log('chartDataArray:' + JSON.stringify(chartDataArray));
	chartString += '	]\n';
	chartString += '  },\n';
	chartString += '  options: {\n';
	chartString += '	 scales: {\n';
	chartString += '        x: {\n';
	chartString += '      		labels: ' + JSON.stringify(xValues) + ',\n';
	chartString += '       },\n';
	chartString += '        y: {\n';
	chartString += '      		labels: ' + JSON.stringify(yValues) + ',\n';
	chartString += '       }\n';
	chartString += '    },\n';
	chartString += '    layout: {padding: 5},\n';
	chartString += '	plugins:{\n';
	chartString += '    	legend: {display: false, reverse: true, position: "bottom"},\n';
	chartString += '		line:{stepped:true},\n';
	chartString += '    	title: {\n';
	chartString += '         	display: true,\n';
	if (typeof rhythms.tracks[trackIndex].name != 'undefined') {
		chartString += '         	text: "' + rhythms.tracks[trackIndex].name + '"\n';
	}
	chartString += '     	}\n';
	chartString += '     }\n';
	chartString += '  }\n';
	chartString += '});\n';
	chartString += '</script>\n';	
	
	return chartString;
}

function buildRhythmChartHTML() {
	log('buildRhythmChartHTML()', 'info');
	var chartString = '';
	chartString += '<!DOCTYPE html>\n';
	chartString += '<html>\n';
	chartString += '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n';
	chartString += '<body>\n';
	chartString += '<div>\n';
	chartString += '<canvas id="rhythmChart""></canvas>\n';
	chartString += '</div>\n';
	chartString += '<script>\n';

	var highestIndex = 0;
	var totalLength  = 0;
	log('Compute Highest Index Of All Tracks:' + rhythms.tracks.length, 'debug');
	for (trackIndex=0;trackIndex<rhythms.tracks.length;trackIndex++) {
		if (rhythms.tracks[trackIndex].events.length > 0) {
			noteIndex = rhythms.tracks[trackIndex].events.length-1;
			note = rhythms.tracks[trackIndex].events[noteIndex].index;
			duration = rhythms.tracks[trackIndex].events[noteIndex].duration;
			totalLength = note + duration;
			if (totalLength > highestIndex) {
				highestIndex = totalLength;
			}
		}
	}

	var xValues = [];
	for (m=1;m<=highestIndex+1;m++) {
		xValues.push(m);
	}
	xValues.push('');
	var spacing = rhythms.chartSpacing | 3;
	var chartHeight = 0;
	if (typeof rhythms.timeSignature != 'undefined') {
		chartHeight = (rhythms.tracks.length + 1) * spacing;
	} else {
		chartHeight = (rhythms.tracks.length) * spacing;
	}
	chartString += 'var xValues = ' + JSON.stringify(xValues) + ';\n';
	chartString += 'new Chart("rhythmChart", {\n';
	chartString += '  type: "line",\n';
	chartString += '  data: {\n';
	chartString += '    labels: xValues,\n';
	chartString += '	datasets: [\n';

	//generate datasets

	var baseLine;
	for (trackIndex=rhythms.tracks.length-1;trackIndex>=0;trackIndex--) {
		if (rhythms.tracks[trackIndex].events.length == 0) break;
		if (typeof rhythms.timeSignature != 'undefined') {
			baseLine = ((rhythms.tracks.length - trackIndex)*spacing)+1;
		} else {
			baseLine = (((rhythms.tracks.length - 1) - trackIndex)*spacing)+1;
		}
		var chartDataArray = [];
		var chartHideDataArray = [];
		var flipHighLow = false;
		var totalFiller = 0;

		if (rhythms.tracks[trackIndex].events[0].index > 0) {
			totalFiller = rhythms.tracks[trackIndex].events[0].index;
			for (var m=0;m<totalFiller;m++) {
				chartDataArray.push(null);
			}
		}
		log('   trackIndex:' + trackIndex + ' totalFiller:' + totalFiller + ' items:' + (rhythms.tracks[trackIndex].events.length-1) + ' last:' + rhythms.tracks[trackIndex].events[rhythms.tracks[trackIndex].events.length-1].index + ' MIDIChannel:' + rhythms.tracks[trackIndex].midiChannel, 'debug');
		flipHighLow = !flipHighLow;
		for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
			for (var m=0;m<rhythms.tracks[trackIndex].events[noteIndex].duration;m++) {
				if (flipHighLow) {
					chartDataArray.push(baseLine+1);
				} else {
					chartDataArray.push(baseLine);
				}
			}
			flipHighLow = !flipHighLow;
		}
		flipHighLow = !flipHighLow;
		if (flipHighLow) {
			chartDataArray.push(baseLine+1);
		} else {
			chartDataArray.push(baseLine);
		}
		if (trackIndex == rhythms.tracks.length-1) {
			chartString += '	{\n';
		} else {
			chartString += '	,{\n';
		}
		chartString += 	'     label: "' + rhythms.tracks[trackIndex].name + '",\n';
		chartString += 	'     data: ' + JSON.stringify(chartDataArray) + ',\n';
		if (typeof rhythms.tracks[trackIndex].midiChannel!= 'undefined') {
			chartString += '	  borderColor: "black",\n';
		} else {
			chartString += '	   borderColor: "gray",\n';
		}
		chartString += '	  stepped: true,\n';
		chartString += '	  spanGaps: false,\n';
		chartString += '	  pointRadius: 0,\n';
		chartString += '	  fill: false\n';
		chartString += '	}\n';
	}
	if (typeof rhythms.timeSignature != 'undefined') {
		flipHighLow = true;
		baseLine = 1;
		chartDataArray = [];
		log('TIME SIGNATURE!!! ' + highestIndex, 'debug');
		for (noteIndex=0;noteIndex<highestIndex/rhythms.timeSignature.substring(0,1);noteIndex++) {
			for (var m=0;m<rhythms.timeSignature.substring(0,1);m++) {
				if (flipHighLow) {
					chartDataArray.push(baseLine+1);
				} else {
					chartDataArray.push(baseLine);
				}
				log('   pushChartData:' + noteIndex, 'debug');
			}
			flipHighLow = !flipHighLow;
		}
		flipHighLow = !flipHighLow;
		if (flipHighLow) {
			chartDataArray.push(baseLine+1);
		} else {
			chartDataArray.push(baseLine);
		}
		chartString += '	,{\n';
		chartString += 	'     label: "' + rhythms.timeSignature + ' time",\n';
		chartString += 	'     data: ' + JSON.stringify(chartDataArray) + ',\n';
		chartString += '	  borderColor: "blue",\n';
		chartString += '	  stepped: true,\n';
		chartString += '	  spanGaps: false,\n';
		chartString += '	  pointRadius: 0,\n';
		chartString += '	  fill: false\n';
		chartString += '	}\n';	
	}
	chartString += '	]\n';
	chartString += '  },\n';
	chartString += '  options: {\n';
	chartString += '	    scales: {\n';
	chartString += '      y: {\n';
	chartString += '                ticks: {\n';
	chartString += '                    callback: function(value, index, ticks) {\n';
	chartString += '                        return "";\n';
	chartString += '                     },\n';
	chartString += '                },\n';
	chartString += '                min: 0,\n';
	chartString += '                max: ' + chartHeight.toString() + '\n';
	chartString += '            }\n';
	chartString += '    },\n';
	chartString += '    layout: {padding: 5},\n';
	chartString += '	plugins:{\n';
	chartString += '    	legend: {display: true, reverse: true, position: "bottom"},\n';
	chartString += '		line:{stepped:true},\n';
	chartString += '    	title: {\n';
	chartString += '         	display: true,\n';
	if (typeof rhythms.name != 'undefined') {
		chartString += '         	text: "' + rhythms.name + '"\n';
	}
	chartString += '     	}\n';
	chartString += '     }\n';
	chartString += '  }\n';
	chartString += '});\n';
	chartString += '</script>\n';
	
	for (trackIndex=rhythms.tracks.length-1;trackIndex>=0;trackIndex--) {
		if (rhythms.tracks[trackIndex].events.length > 0) {
			chartString += buildPitchChartHTML(trackIndex);
		}
	}
	
	chartString += '</html>';
	return chartString;
}

function genMidiFileJZZ() {
	log('genMIDIFileJZZ()','info');
	var highestCount = 0
	var anyMidi = false;
	for (trackIndex=0;trackIndex<rhythms.tracks.length;trackIndex++) {
		for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
			if (rhythms.tracks[trackIndex].events[noteIndex].count > highestCount) {
				highestCount = rhythms.tracks[trackIndex].events[noteIndex].count;
			}
		}
		if (typeof rhythms.tracks[trackIndex].midiChannel != 'undefined') {
			anyMidi = true;
		}
	}
	log('   anyMidi:' + anyMidi, 'debug');
	if (!anyMidi) return null;
	var smf = new JZZ.MIDI.SMF(0, 128);
	var avgVelocity = 50;
	if (typeof rhythms.averageVelocity != 'undefined') {
		avgVelocity = rhythms.averageVelocity;
	} else {
		rhythms.averageVelocity = avgVelocity;
	}
	var velocityCountAdjust = (100 - avgVelocity)/highestCount;
	log('   velocityAdjust:' + velocityCountAdjust + ' highestCount:' + highestCount + ' avgVelocity:' + avgVelocity, 'debug');
	
	for (trackIndex=0;trackIndex<rhythms.tracks.length;trackIndex++) {
		if (rhythms.tracks[trackIndex].events.length == 0) break;
		var index = 0;
		if (typeof rhythms.tracks[trackIndex].midiChannel != 'undefined') {
			var track = new JZZ.MIDI.SMF.MTrk();
			var channel = rhythms.tracks[trackIndex].midiChannel;
			smf.push(track);
			smf[smf.length-1].add(index,JZZ.MIDI.smfSeqName(rhythms.tracks[trackIndex].name));
			if (typeof rhythms.copyright != 'undefined') {
				//console.log(rhythms.copyright);
				smf[smf.length-1].add(index,JZZ.MIDI.smfCopyright(rhythms.copyright));
			}
			var tempo;
			if (typeof rhythms.tracks[trackIndex].tempo != 'undefined') {
				tempo = rhythms.tracks[trackIndex].tempo;
			} else if (typeof rhythms.tempo != 'undefined') {
				tempo = rhythms.tempo;
			} else {
				tempo = 90;
			}
			smf[smf.length-1].add(index,JZZ.MIDI.smfBPM(tempo));


			log('   writing midi for track:' + trackIndex + ' notes:' + rhythms.tracks[trackIndex].events.length + ' tempo:' + tempo, 'debug');
			
			//smf[smf.length-1].add(index,JZZ.MIDI.smfTimeSignature(timeSignature));
			
			//console.log('MIDIcode:' + (channel + 192) + " hex:" + (channel + 192).toString(16) + "    instrument:" + instrumentCode + " hex:" + instrumentCode.toString(16));
			
			//could optionally insert a phantom note here because midi players have trouble with notes that start at the immediate beginning. But this could complicate matters for importing into MuseScore, since things no longer align. 
			var velocity;
			var prevTimeSignature;
			var prevInstrumentName;
			var prevInstrumentCode;
			var prevKeySignature;
			for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
				if (rhythms.tracks[trackIndex].events[noteIndex].timeSignature != prevTimeSignature) {
					var tsArray = rhythms.tracks[trackIndex].events[noteIndex].timeSignature.split('/');
					smf[smf.length-1].add(index,JZZ.MIDI.smfTimeSignature(tsArray[0] + "/" + tsArray[1]));
					prevTimeSignature = rhythms.tracks[trackIndex].events[noteIndex].timeSignature;
				}
				if (rhythms.tracks[trackIndex].events[noteIndex].instrumentName != prevInstrumentName) {
					smf[smf.length-1].add(index,JZZ.MIDI.smfInstrName(rhythms.tracks[trackIndex].events[noteIndex].instrumentName));
					prevInstrumentName = rhythms.tracks[trackIndex].events[noteIndex].instrumentName;
				}
				if (rhythms.tracks[trackIndex].events[noteIndex].instrumentCode != prevInstrumentCode) {
					smf[smf.length-1].add(index,JZZ.MIDI.program(channel,rhythms.tracks[trackIndex].events[noteIndex].instrumentCode));
					prevInstrumentCode = rhythms.tracks[trackIndex].events[noteIndex].instrumentCode;
				}
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].shortKey != 'undefined' && rhythms.tracks[trackIndex].events[noteIndex].shortKey != prevKeySignature) {
					smf[smf.length-1].add(index,JZZ.MIDI.smfKeySignature(rhythms.tracks[trackIndex].events[noteIndex].shortKey));
					prevKeySignature = rhythms.tracks[trackIndex].events[noteIndex].shortKey;
				}
				if (typeof rhythms.tracks[trackIndex].adjustVelocity  != 'undefined') {
					if (rhythms.tracks[trackIndex].adjustVelocity == "byCount") {
						if (typeof rhythms.tracks[trackIndex].events[noteIndex].count  != 'undefined') {
							velocity = velocity + (rhythms.tracks[trackIndex].events[noteIndex].count * velocityCountAdjust)
						} else {
							velocity = rhythms.averageVelocity;
						}
					} else if (Number.isInteger(rhythms.tracks[trackIndex].adjustVelocity)) {
						velocity = getControlValue(rhythms.tracks[trackIndex].events[noteIndex], rhythms.tracks[trackIndex].adjustVelocity);
					}
				} else {
					velocity = rhythms.averageVelocity;
				}
				var buildNote;
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].pitch != 'undefined') {
					buildNote = flattenArray(rhythms.tracks[trackIndex].events[noteIndex].pitch);
				//} else if (typeof rhythms.tracks[trackIndex].defaultPitch != 'undefined') {
				//	buildNote = rhythms.tracks[trackIndex].defaultPitch;
				//} else if (typeof rhythms.defaultPitch != 'undefined') {
				//	buildNote = rhythms.defaultPitch;
				}
				log('*****buildNote:' + JSON.stringify(buildNote), 'debug');
				var beatUnit;
				if (typeof rhythms.tracks[trackIndex].beatUnit != 'undefined') {
					beatUnit = rhythms.tracks[trackIndex].beatUnit;
				} else {
					beatUnit = 4;
					rhythms.tracks[trackIndex].beatUnit = beatUnit;
				}
				var duration = ((512/beatUnit) * rhythms.tracks[trackIndex].events[noteIndex].duration);
			
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].isRest != 'undefined' && rhythms.tracks[trackIndex].events[noteIndex].isRest == "rest") {
					velocity = 0;
					log('    track:' + trackIndex + '    rest', 'debug');
				}
				
				if (noteIndex == 0 && rhythms.tracks[trackIndex].events[noteIndex].index > 0) {
					var durationPhantom = ((512/beatUnit) * rhythms.tracks[trackIndex].events[noteIndex].index).toString();
					smf[smf.length-1].add(index,JZZ.MIDI.noteOn(channel, buildNote[chordCtr],0));
					smf[smf.length-1].add(index+durationPhantom,JZZ.MIDI.noteOff(channel, buildNote[chordCtr],0));
				}
				log('    track:' + trackIndex + '    pitch:' + JSON.stringify(buildNote) + ' duration:' + duration + ' velocity:' + velocity, 'debug');
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].chord != 'undefined') {
					smf[smf.length-1].add(index,JZZ.MIDI.smfText(rhythms.tracks[trackIndex].events[noteIndex].chord.toString()));
				}
				
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].control != 'undefined') {
					for (controllerIndex=0;controllerIndex<rhythms.tracks[trackIndex].events[noteIndex].control.length;controllerIndex++) {
						if (rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].interpolationType == 'none') {
							smf[smf.length-1].add(index,JZZ.MIDI.control(channel,rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].controller,rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].startValue));
						} else {
							var shape = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].interpolationType;
							var interpolationType = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].interpolationType;
							var stepSize = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].stepSize;
							var bend = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].bend;
							var startValue = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].startValue;
							var endValue;
							if (typeof rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].endValue != 'undefined') {
								if (rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].endValue == 'next') {
									if (typeof rhythms.tracks[trackIndex].events[noteIndex+1] != 'undefined') {
										for (nextControllerIndex=0;nextControllerIndex<rhythms.tracks[trackIndex].events[noteIndex+1].control.length;nextControllerIndex++) {
											if (rhythms.tracks[trackIndex].events[noteIndex+1].control[nextControllerIndex].controller == rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].controller) {
												endValue = rhythms.tracks[trackIndex].events[noteIndex+1].control[nextControllerIndex].startValue;
												break;
											}
										}
									}
								} else {
									endValue = rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].endValue;
									//console.log('shape:' + shape + '\tendValue:' + endValue);
								}
							} else {
								console.log('Error: endValue required but not found in track:' + trackIndex + '\tnote:' + noteIndex + '\tcontroller:' + controllerIndex);
								console.log('---the entry in error is:' + JSON.stringify(rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex]));
							}
							var startIndex = index;
							var endIndex = startIndex+duration
							if (endValue != null) {
								var controlEvents = buildInterpolatedOutput(shape, stepSize, startValue, endValue, startIndex, endIndex, bend);
							}
							for (var ctrlEventCtr=0;ctrlEventCtr<controlEvents.length;ctrlEventCtr++) {
								//console.log('   channel:' + rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].channel + ' controller:' +rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].controller + ' index:' +  controlEvents[ctrlEventCtr].index + ' sig:' + controlEvents[ctrlEventCtr].sig);
								smf[smf.length-1].add(controlEvents[ctrlEventCtr].index,JZZ.MIDI.control(channel,rhythms.tracks[trackIndex].events[noteIndex].control[controllerIndex].controller,controlEvents[ctrlEventCtr].sig));
							}
						}
					}
				}
				
				for (var chordCtr=0;chordCtr<buildNote.length;chordCtr++) {
					smf[smf.length-1].add(index,JZZ.MIDI.noteOn(channel, buildNote[chordCtr],velocity));
					//console.log(index + '   ' + duration + '   ' + channel + '   ' + buildNote[chordCtr]);
					smf[smf.length-1].add(index+duration,JZZ.MIDI.noteOff(channel, buildNote[chordCtr],0));
				}
				index += duration;
			}
		}
	}
	return smf;
}

function buildInterpolatedOutput(shape, stepSize, startValue, endValue, startIndex, endIndex, bend) {
	//console.log('shape:' + shape + ' stepSize:' + stepSize + ' startValue:' + startValue + ' endValue:' + endValue + ' startIndex:' + startIndex +  ' endIndex:' + endIndex + ' bend:' + bend);
	var resultJSON;
	if (shape == "sigmoid") {
		if (bend<0) {
			bend = bend-1;
		}
		var forward;
		if (startValue > endValue) {
			min = endValue;
			max = startValue;
			forward = false; 
		} else {
			max = endValue;
			min = startValue;
			forward = true;
		}

		var ccString = "";
		var valDiff = max-min;
		var cut = Math.round(valDiff/2);
		var halfMax = max-cut;
		var idxDiff = endIndex-startIndex;
		var halfIDX = Math.round(idxDiff/2) + startIndex;
		var resultJSON;

		resultJSON = exponential(bend,min,halfMax,startIndex,halfIDX,stepSize);

		var resultJSONSize = resultJSON.length;
		var halfWaySig = resultJSON[resultJSON.length-1].sig;
		if (resultJSON[resultJSON.length-1].index < halfIDX) {
			resultJSON.push({"sig": halfWaySig, "index":halfIDX});
		}
		for (var i=resultJSONSize-2;i>=0;i--) {
			var newEvent = {}
			newEvent.index = halfIDX + (halfIDX-resultJSON[i].index);
			newEvent.sig = max - resultJSON[i].sig;
			//console.log('newEventSig:' + halfWaySig + ' ' + resultJSON[i].sig);
			resultJSON.push(newEvent);
		}
		if (!forward) {
			resultJSON = reverseSig(resultJSON);
		}
	} else if (shape == "hump") {
		if (bend<0) {
			bend = bend-1;
		}
		var forward;
		if (startValue > endValue) {
			min = endValue;
			max = startValue;
			forward = false; 
		} else {
			max = endValue;
			min = startValue;
			forward = true;
		}
		//console.log('forward:' + forward);
		var valDiff = max-min;
		var cut = Math.round(valDiff/2);
		var halfMax = max-cut;
		var idxDiff = endIndex-startIndex;
		var halfIDX = Math.round(idxDiff/2) + startIndex;
		resultJSON = exponential(bend,min,max,startIndex,halfIDX,stepSize);
		if (!forward) {
			resultJSON = reverseSig(resultJSON);
		}
		var resultJSONSize = resultJSON.length;
		var halfWaySig = resultJSON[resultJSON.length-1].sig;
		//console.log(halfWaySig + ' ' + halfIDX);
		if (resultJSON[resultJSON.length-1].index < halfIDX) {
			resultJSON.push({"sig": halfWaySig, "index":halfIDX});
		}
		for (var i=resultJSONSize-2;i>=0;i--) {
			var newEvent = {}
			newEvent.index = halfIDX + (halfIDX-resultJSON[i].index);
			newEvent.sig = resultJSON[i].sig;
			//console.log('newEventSig:' + halfWaySig + ' ' + resultJSON[i].sig);
			resultJSON.push(newEvent);
		}
	} else if (shape == "exponential") {
		if (bend<0) {
			bend = bend-1;
		}
		var forward;
		if (startValue > endValue) {
			min = endValue;
			max = startValue;
			forward = false; 
		} else {
			max = endValue;
			min = startValue;
			forward = true;
		}

		resultJSON = exponential(bend,min,max,startIndex,endIndex,stepSize);
		if (!forward) {
			resultJSON = reverseSig(resultJSON);
		}
	}
	return resultJSON;
}

function exponential(bend,min,max,startIndex,endIndex, stepSize) {
	//console.log('exponential:' + bend + '\tmin:' + min + '\tmax:' + max + '\tsI:' + startIndex + '\teI:' + endIndex + '\tstep:' + stepSize);
	var cc = [];
	var oldSig = -999;
	var curIndex = startIndex;
	var steps = (max-min)
	var indexIncrement = (endIndex-startIndex)/steps;
	var t=min;
	for (var i=0;i<=steps;i++) {
		var sig = Math.round(((bend*t) / (bend-t+1))*max);
		//console.log("i:" + i + "\tt:" + t + "\tsig:" + sig + "\toldSig:" + oldSig + "\tcurIndex:" + curIndex + "\tmax:" + max);
		if (sig-oldSig >= stepSize) {
			cc.push({"sig":sig, "index": Math.round(curIndex)});
			oldSig = sig;
		}
		t+=1/steps;
		curIndex+=indexIncrement
	}
	return cc;
}

function reverseSig(anArray) {
	var newArray = [];
	reverseIndex = anArray.length-1;
	for (i=0;i<anArray.length;i++) {
		newArray.push({"index":anArray[i].index,"sig":anArray[reverseIndex].sig});
		reverseIndex--;
	}
	return newArray;
}