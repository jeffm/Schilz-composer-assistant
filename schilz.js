var fs = require('fs');
var yargs = require('yargs');
//var log = require('npmlog');
var MidiWriter = require('midi-writer-js');

var globalArguments = parseArguments(process.argv.slice(2))
log('Parsed globalArguments:' + JSON.stringify(globalArguments), 'debug');
var rhythms = openInputFile(globalArguments.ControlFilePath);
if (rhythms != null) {
	populateGlobalDefaults(globalArguments);
	generateRhythms(globalArguments);
	writeJSON(globalArguments.JSONoutpath);
	writeChart(globalArguments.Chartoutpath);
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
	argStructure.ControlFilePath = argStructure.projectPath + argv.infile.replace(/'/g,'');
	argStructure.logLevel = 0;
	argStructure.JSONoutpath = '';
	argStructure.MIDIoutpath = '';
	argStructure.Chartoutpath = '';
	argStructure.globalDefaultPitch = 'C4';
	if (typeof argv.midi != 'undefined') {
		argStructure.MIDIoutpath = argStructure.projectPath + argv.midi.replace(/'/g,'');
	}
	if (typeof argv.outfile != 'undefined') {
		argStructure.JSONoutpath = argStructure.projectPath + argv.outfile.replace(/'/g,'');
	}
	if (typeof argv.chart != 'undefined') {
		argStructure.Chartoutpath = argStructure.projectPath + argv.chart.replace(/'/g,'');
	}
	if (typeof argv.pitch != 'undefined') {
		argStructure.globalDefaultPitch = argv.pitch.replace(/'/g,'');
	} else {
		argStructure.globalDefaultPitch = "C4";
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
	//log('argStructure.logLevel:' + argStructure.logLevel + ' level:' + level + ' argv.verbose:' + argv.verbose, 'debug');
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
	if (typeof globalArguments.logLevel == 'undefined' || logLevel <= globalArguments.logLevel) {
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
	log('writeMIDI ' + MIDIoutpath, 'info');
	var midiFile = genMIDIFile();
	if (MIDIoutpath != '' && midiFile != null) {
		try {
			var outFile = fs.openSync(MIDIoutpath,'w');
			
			fs.writeSync(outFile,midiFile);
		} catch (err) {
		   log(err,'error');
		}
	}
}

function writeChart(Chartoutpath) {
	log('writeChart() ' + Chartoutpath, 'info');
	if (Chartoutpath != '') {
		try {
			var outFile = fs.openSync(Chartoutpath,'w');
			fs.writeSync(outFile,buildChartjsPage());
		} catch (err) {
		   log(err,'error');
		}
	}
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

function generateRhythms(arguments) {
	log('generateRhythms()','info');
	for (var j=0;j<rhythms.tracks.length;j++) {
		createEmptyTrackEventArrays(j)
		if (rhythms.tracks[j].type == 'beat') {
			generateBeat(j);
			addPitches(j);
			addChordSymbols(j);
		} else if (rhythms.tracks[j].type == 'rhythm') {
			generateRhythm(j);
			setDuration(j);
			setCounts(j);
			addPitches(j);
			addChordSymbols(j);
		} else if (rhythms.tracks[j].type == 'concatenate') {
			concatenatePeriodicity(j);
			setDuration(j);
			addPitches(j);
			addChordSymbols(j);
		} else if (rhythms.tracks[j].type == 'clone') {
			clonePeriodicity(j);
			setDuration(j);
			addPitches(j);
			addChordSymbols(j);
		} else if (rhythms.tracks[j].type == 'split') {
			splitPeriodicity(j);
		} else if (rhythms.tracks[j].type == 'none') {
			addPitches(j);
			addChordSymbols(j);
			//used for periodicities that are only the result of another task (e.g., split).
		}
	}
}

function populateGlobalDefaults(arguments) {
	log('Set Default Pitch:' + arguments.globalDefaultPitch + ' rhythms.defaultPitch:' + rhythms.defaultPitch, 'debug');
	if (typeof rhythms.defaultPitch == 'undefined') {
		rhythms.defaultPitch = arguments.globalDefaultPitch;
		log('Set Default Pitch:' + arguments.globalDefaultPitch + ' rhythms.defaultPitch:' + rhythms.defaultPitch, 'debug');
	}
	if (typeof rhythms.averageVelocity == 'undefined') {
		rhythms.averageVelocity = 50;
	}
	if (typeof rhythms.tempo == 'undefined') {
		rhythms.tempo = 90;
	}
}

function createEmptyTrackEventArrays(trackToBuild) {
	if (typeof rhythms.tracks[trackToBuild].events == 'undefined') {
		rhythms.tracks[trackToBuild].events = [];
	}
	if (typeof rhythms.tracks[trackToBuild].run == 'undefined') {
		rhythms.tracks[trackToBuild].run = true
	}
}

function populateName(trackToBuild, name) {
	//Autopopulate name
	if (typeof rhythms.tracks[trackToBuild].name == 'undefined' || rhythms.tracks[trackToBuild].name.length == 0) {
		rhythms.tracks[trackToBuild].name = name;
	}
}

function populateID(trackToBuild) {
	if (typeof rhythms.tracks[trackToBuild].id == 'undefined' || rhythms.tracks[trackToBuild].id.length == 0) {
		rhythms.tracks[trackToBuild].id = trackToBuild;
	}
}

function generateBeat(trackToBuild) {
	if (!shouldRun(trackToBuild)) {
		return;
	}
	log('generateBeat(' + trackToBuild + ')', 'info');
	populateName(trackToBuild, "Beat of " + rhythms.tracks[trackToBuild].period);
	populateID(trackToBuild);
	
	var offset = 1;
	if (typeof rhythms.tracks[trackToBuild].offsetFrom == 'undefined' && typeof rhythms.tracks[trackToBuild].offsetAmount !== 'undefined') {
		
		log('offsetAmount:' + rhythms.tracks[trackToBuild].offsetAmount, 'debug');
		offset = ((rhythms.tracks[trackToBuild].offsetAmount * rhythms.tracks[trackToBuild].period));
		var entry = {
			index: offset,
			duration: rhythms.tracks[trackToBuild].period
		};
		rhythms.tracks[trackToBuild].events.push(entry);
		log('local offset:' + offset, 'debug');
	} else if (typeof rhythms.tracks[trackToBuild].offsetFrom !== 'undefined' && typeof rhythms.tracks[trackToBuild].offsetAmount !== 'undefined') {
		log('offsetFrom:' + rhythms.tracks[trackToBuild].offsetAmount + '=' + rhythms.tracks[rhythms.tracks[trackToBuild].offsetFrom].period + ' offset:' + rhythms.tracks[trackToBuild].offsetAmount, 'debug');
		
		offset = ((rhythms.tracks[trackToBuild].offsetAmount * rhythms.tracks[rhythms.tracks[trackToBuild].offsetFrom].period));
		log('Offset is From Another:' + offset, 'debug');
	} else {
		offset = 0;
		log('defaultOffset:' + offset, 'debug');
	}
	var limit = rhythms.tracks[trackToBuild].endAt + offset;
	log('limit:' + limit, 'debug');
	for (var k=offset;k<=limit;k++) {
		log('k:' + (k + offset) + ' period:' + rhythms.tracks[trackToBuild].period, 'debug');
		if ((k - offset) % rhythms.tracks[trackToBuild].period == 0) {
		//add an entry to the result
			if (k < limit) {
				var entry = {
					index: k,
					duration: rhythms.tracks[trackToBuild].period,
					count: 1
				};
				rhythms.tracks[trackToBuild].events.push(entry);
			}
		}
	}
	rhythms.tracks[trackToBuild].run = false;
}

function generateRhythm(trackToBuild) {
	if (!shouldRun(trackToBuild)) {
		return;
	}
	log('generateRhythm(' + trackToBuild + ')', 'info');
	populateName(trackToBuild, "Rhythm combining " + stringifySourceArray(rhythms.tracks[trackToBuild].sources));
	populateID(trackToBuild);
	var HighIndex = 0;
	var sourceTrack;
	for (var source=0;source<rhythms.tracks[trackToBuild].sources.length;source++) {
		var sourceTrack = rhythms.tracks[trackToBuild].sources[source].source;
		if (rhythms.tracks[sourceTrack].events[rhythms.tracks[sourceTrack].events.length-1].index > HighIndex) {
			HighIndex = rhythms.tracks[sourceTrack].events[rhythms.tracks[sourceTrack].events.length-1].index;
		}
	}
	rhythms.tracks[trackToBuild].endAt = HighIndex;
	var lastIndex = -1;
	log('sources:' + JSON.stringify(rhythms.tracks[trackToBuild].sources), 'debug');
	for (var k=0;k<=rhythms.tracks[trackToBuild].endAt;k++) {
		for (var source=0;source<rhythms.tracks[trackToBuild].sources.length;source++) {
			sourceTrack = rhythms.tracks[trackToBuild].sources[source].source
			sourceLoop:
			for (var m=0;m<rhythms.tracks[sourceTrack].events.length;m++) {
				log(rhythms.tracks[sourceTrack].events[m].index + ' ' + k + ' li:' + lastIndex, 'debug');
				if (typeof rhythms.tracks[sourceTrack].events[m].index != 'undefined' && rhythms.tracks[sourceTrack].events[m].index == k && rhythms.tracks[sourceTrack].events[m].index > lastIndex) {
					var entry = {
						index: k,
						duration: rhythms.tracks[sourceTrack].events[m].duration,
						count: 0
					};
					lastIndex = k;
					rhythms.tracks[trackToBuild].events.push(entry);
					log(JSON.stringify(rhythms.tracks[trackToBuild].events), 'debug');
					break sourceLoop;
				}	
			}
		}	
	}
	//Compute LCM Statistic
	var timeSignature = '';
	var hcf = 1;
	var newIndex = HighIndex + rhythms.tracks[trackToBuild].events[rhythms.tracks[trackToBuild].events.length-1].duration;
	if (typeof rhythms.tracks[trackToBuild].timeSignature != 'undefined') {
		timeSignature = rhythms.tracks[trackToBuild].timeSignature;
	} else if (typeof rhythms.timeSignature != 'undefined') {
		timeSignature = rhythms.timeSignature;
	} else {
		timeSignature = "4/4";
		rhythms.timeSignature = timeSignature;
	}
	var timeSigArray = timeSignature.split('/');
	if (typeof rhythms.tracks[trackToBuild].computeLCM != 'undefined' && rhythms.tracks[trackToBuild].computeLCM == true) {
		rhythms.tracks[trackToBuild].LCM = computeLCM(timeSigArray[0],newIndex);
		log('totalLength:' + newIndex + ' LCM:' + rhythms.tracks[trackToBuild].LCM, 'debug');
	}
	rhythms.tracks[trackToBuild].run = false;
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

function shouldRun(trackToBuild) {
	if (typeof rhythms.tracks[trackToBuild].run != 'undefined' && rhythms.tracks[trackToBuild].run == false) {
		return false;
	} else {
		rhythms.tracks[trackToBuild].run = true;
	}
return true;	
}

function concatenatePeriodicity(trackToBuild) {
	if (!shouldRun(trackToBuild)) {
		return;
	}
	console.log('concatenatePeriodicity(' + trackToBuild + ')');
	var lastIndex = 0;
	var lastDuration = 0;
	var lastCount = 0;
	var newIndex = 0;
	populateName(trackToBuild, "Rhythm combining " + stringifySourceArray(rhythms.tracks[trackToBuild].sources));
	populateID(trackToBuild);
	for (var source=0;source<rhythms.tracks[trackToBuild].sources.length;source++) { //for each already created source periodicity
		var reIndexTo = null;
		if (typeof rhythms.tracks[trackToBuild].reIndexTo != 'undefined') {
			reIndexTo = rhythms.tracks[trackToBuild].reIndexTo;
		}
		var offset = 1;
		if (typeof rhythms.tracks[trackToBuild].sources[source].offsetFrom == 'undefined' && typeof rhythms.tracks[trackToBuild].sources[source].offsetAmount !== 'undefined') {
			log('source:' + source, 'debug');
			log('source duration:' + rhythms.tracks[source].events[0].duration, 'debug');
			var sourceTrack = rhythms.tracks[trackToBuild].sources[source].source;
			offset = (rhythms.tracks[trackToBuild].sources[source].offsetAmount * (rhythms.tracks[sourceTrack].events[0].duration + rhythms.tracks[sourceTrack].events[0].index));
			log('   source:' + source + ' offsetAmount:' + rhythms.tracks[trackToBuild].sources[source].offsetAmount + ' source index:' + rhythms.tracks[sourceTrack].events[0].index + ' source duration:' + rhythms.tracks[sourceTrack].events[0].duration + ' offset:' + offset, 'debug');
		} else if (typeof rhythms.tracks[trackToBuild].sources[source].offsetFrom !== 'undefined' && typeof rhythms.tracks[trackToBuild].sources[source].offsetAmount !== 'undefined') {
			offset = ((rhythms.tracks[trackToBuild].sources[source].offsetAmount * rhythms.tracks[rhythms.tracks[trackToBuild].sources[source].offsetFrom].events[0].duration));
			log('   source:' + rhythms.tracks[trackToBuild].sources[source].offsetFrom + ' offsetAmount:' + rhythms.tracks[trackToBuild].sources[source].offsetAmount + ' source index:' + rhythms.tracks[sourceTrack].events[0].index + ' source duration:' + rhythms.tracks[sourceTrack].events[0].duration + ' offset:' + offset, 'debug');
			log('Offset is From Another:' + offset, 'debug');
		} else {
			offset = 0;
			log('   source:' + source + '   local offset:' + offset, 'debug');
			log('defaultOffset:' + offset, 'debug');
		}
		log('offset:' + offset, 'debug');
		var sourceTrack = rhythms.tracks[trackToBuild].sources[source].source;
		var muteInitial;
		if (typeof rhythms.tracks[trackToBuild].sources[source].muteInitial == 'undefined' || rhythms.tracks[trackToBuild].sources[source].muteInitial == false) {
			muteInitial = false;
		} else if (rhythms.tracks[trackToBuild].sources[source].muteInitial == true) {
			muteInitial = true;
		}
		log('   muteInitial: ' + muteInitial, 'debug');
		var concatenateType;
		if (typeof rhythms.tracks[trackToBuild].sources[source].permutation == 'undefined' || rhythms.tracks[trackToBuild].sources[source].permutation == 'none') {
			concatenateType = 'none';
		} else if (rhythms.tracks[trackToBuild].sources[source].permutation == 'left') {
			concatenateType = 'left';
		} else if (rhythms.tracks[trackToBuild].sources[source].permutation == 'right') {
			concatenateType = 'right';
		} else if (rhythms.tracks[trackToBuild].sources[source].permutation == 'retrograde') {
			concatenateType = 'retrograde';
		} else if (rhythms.tracks[trackToBuild].sources[source].permutation == 'custom') {
			concatenateType = 'custom';
		}
		log('   concatenate type:' + concatenateType, 'debug');
		var increment;
		if (typeof rhythms.tracks[trackToBuild].sources[source].increment != 'undefined') {
			
			if (typeof rhythms.tracks[trackToBuild].sources[source].increment == 'string' && rhythms.tracks[trackToBuild].sources[source].increment.indexOf('%') == rhythms.tracks[trackToBuild].sources[source].increment.length-1) {
				//increment is a percentage
				increment = Math.round(rhythms.tracks[sourceTrack].events.length-1 / parseInt(substring(rhythms.tracks[trackToBuild].sources[source].increment,0,rhythms.tracks[trackToBuild].sources[source].increment.length-2)));
			} else {
				//increment is an integer
				increment = rhythms.tracks[trackToBuild].sources[source].increment;
			}
		} else {
			increment = 1;
		}
		
		log('   increment:' + increment, 'debug');
		var startAt = rhythms.tracks[trackToBuild].sources[source].startAt;
		if (typeof rhythms.tracks[trackToBuild].sources[source].startAt != 'undefined') {
			if (typeof rhythms.tracks[trackToBuild].sources[source].startAt == 'string'  && rhythms.tracks[trackToBuild].sources[source].startAt.indexOf('%') > -1) {
				//startAt is a percentage
				startAt = Math.round(rhythms.tracks[sourceTrack].events.length-1 / parseInt(substring(rhythms.tracks[trackToBuild].sources[source].startAt,0,rhythms.tracks[trackToBuild].sources[source].startAt.length-2)));
			} else {
				//startAt is an integer
				startAt = rhythms.tracks[trackToBuild].sources[source].startAt;
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
		if (typeof rhythms.tracks[trackToBuild].sources[source].endAt != 'undefined') {
			endAt = rhythms.tracks[trackToBuild].sources[source].endAt
		} else if (concatenateType == 'retrograde') {
			endAt = 0;
		} else {
			endAt = rhythms.tracks[sourceTrack].events.length;
		}
		log('concatenate type:' + concatenateType + ' startAt:' + startAt + ' endAt:' + endAt + ' increment:' + increment, 'debug');
		
		if (concatenateType == 'none' || concatenateType == 'left' || concatenateType == 'right' || concatenateType == 'retrograde' || concatenateType == 'custom') {
			var loopCount = 0;
			for (loopCount=startAt;loopCount<endAt;loopCount+=increment) {
				if (loopCount == startAt && offset > 0 && muteInitial) {
					entry.isRest = "rest";
				}
				lastIndex = rhythms.tracks[sourceTrack].events[loopCount].index;
				lastDuration = rhythms.tracks[sourceTrack].events[loopCount].duration;
				lastCount = rhythms.tracks[sourceTrack].events[loopCount].count;
				var entry = JSON.parse(JSON.stringify(rhythms.tracks[sourceTrack].events[loopCount]));
				entry.index = lastIndex + newIndex + offset;
				entry.duration = lastDuration;
				entry.count = lastCount;
				rhythms.tracks[trackToBuild].events.push(entry);
				log('loopCount:' + loopCount + ' ' + JSON.stringify(entry), 'debug');
			}
			if (concatenateType == 'left' || concatenateType == 'right') {
				if (loopCount >= endAt) {
					loopCount = loopCount - endAt;
				}
				var loopCount2;
				log('left--2nd loop. ' + 'loopCount:' + loopCount + ' startAt:' + startAt + ' increment:' + increment, 'debug');
				for (loopCount2=loopCount;loopCount2<startAt;loopCount2+=increment) {
					var entry = JSON.parse(JSON.stringify(rhythms.tracks[sourceTrack].events[loopCount2]));
					entry.index = lastIndex + newIndex + lastDuration;
					entry.duration = rhythms.tracks[sourceTrack].events[loopCount2].duration;
					entry.count = rhythms.tracks[sourceTrack].events[loopCount2].count;
					rhythms.tracks[trackToBuild].events.push(entry);
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
					swapStat = endAt;
					swapEnd = startAt;
				} else {
					//start and end are equal so there is nothing to do.
				}
				while (swapStart < swapEnd) {
					var swapTemp = {};
					swapTemp = rhythms.tracks[trackToBuild].events[swapStart];
					rhythms.tracks[trackToBuild].events[swapStart] = rhythms.tracks[trackToBuild].events[swapEnd];
					rhythms.tracks[trackToBuild].events[swapEnd] = swapTemp;
					swapStart += 1;
					swapEnd -= 1;
				}
			}
			if (concatenateType == 'custom') {
				tempArray = [];
				var loopCount = 0;
				for (loopCount=startAt;loopCount<endAt;loopCount++) {
					tempArray.push(rhythms.tracks[trackToBuild].events[loopCount]);
				}
				log('customconcatenate:' + JSON.stringify(tempArray), 'debug');
				rhythmCount = startAt;
				var currentIndex = 0
				for (loopCount=0;loopCount<rhythms.tracks[trackToBuild].sources[source].permOrder.length;loopCount++) {
					currentIndex = rhythms.tracks[trackToBuild].sources[source].permOrder[loopCount] - 1;
					rhythms.tracks[trackToBuild].events[rhythmCount] = tempArray[currentIndex];
					log('loopCount:' + loopCount + ' currentIndex:' + currentIndex + ' entry:' + JSON.stringify(tempArray[currentIndex]), 'debug');
					rhythmCount++
				}
			}
		}
		if (reIndexTo != null && source == 0) {
			fixIndexValues(trackToBuild, reIndexTo);
		}
		newIndex = lastIndex;
	}
	//Compute LCM Statistic - only works for 2 items and we should do more!
	var timeSignature = '';

	if (typeof rhythms.tracks[trackToBuild].timeSignature != 'undefined') {
		timeSignature = rhythms.tracks[trackToBuild].timeSignature;
	} else {
		timeSignature = rhythms.timeSignature;
	}
	var timeSigArray = timeSignature.split('/');
	if (typeof rhythms.tracks[trackToBuild].computeLCM != 'undefined' && rhythms.tracks[trackToBuild].computeLCM == true) {
		var newIndex = newIndex + rhythms.tracks[trackToBuild].events[rhythms.tracks[trackToBuild].events.length-1].duration;
		rhythms.tracks[trackToBuild].LCM = computeLCM(timeSigArray[0],newIndex);
		log('    totalLength:' + newIndex + ' timeSigArray[0]:' + timeSigArray[0] + ' LCM:' + rhythms.tracks[trackToBuild].LCM, 'debug');
	}
	fixIndexValues(trackToBuild);
	rhythms.tracks[trackToBuild].run = false;
}

function computePolyLCM(trackToBuild) {
	var pairs = [];
	var pairLCM = [];
	var LCMs = []
	//we need to compute the LCM of each pair within a list of sources.
	//first--figure out the pairs.
	for (var increment=1;increment<rhythms.tracks[trackToBuild].sources.length;increment++) {
		for (var source=0;source<rhythms.tracks[trackToBuild].sources.length;source++) {
			if ((source + increment) < rhythms.tracks[trackToBuild].sources.length) {
				var temp = [];
				if (rhythms.tracks[source].type == 'beat') {
					temp.push(rhythms.tracks[source].period);
				} else {
					//get the index of the last event and add its duration
					temp.push(rhythms.tracks[source].events[rhythms.tracks[source].events.length].index + rhythms.tracks[source].events[rhythms.tracks[source].events.length].duration);
				}
				pairs.push(temp);
			}
		}
	}
	//now compute the LCM for each pair.
	for (var pairCount=0;pairCount < pair.length;pairCount++) {
		pairLCM.push(computeLCM(pair[pairCount][0],pair[pairCount][1]));
	}
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

function splitPeriodicity(trackToBuild) {
	if (!shouldRun(trackToBuild)) {
		return;
	}
	for (var i=0;i<rhythms.tracks[trackToBuild].targets.length;i++) {
		populateName(rhythms.tracks[trackToBuild].targets[i], 'Split of track ' + trackToBuild);
		populateID(rhythms.tracks[trackToBuild].targets[i]);
	}
	log('splitPeriodicity(' + trackToBuild + ')', 'info');
	var lastIndex = 0;
	var source = rhythms.tracks[trackToBuild].source;
	var numTargets = rhythms.tracks[trackToBuild].targets.length - 1;
	var currentTargetIndex = 0
	var currentCountIndex = 0
	var targetLength = rhythms.tracks[trackToBuild].targets.length;
	var countLength = rhythms.tracks[trackToBuild].targetCounts.length;
	log('source:' + source + ' numTargets:' + numTargets + ' currentTarget:' + currentTarget + ' currentTargetCount:' +  currentTargetCount, 'debug');
	for (var sourceIndex=0;sourceIndex<rhythms.tracks[source].events.length;sourceIndex++) { //for each *already created* target periodicity
		var currentTarget = rhythms.tracks[trackToBuild].targets[currentTargetIndex];
		log('   source:' + source + ' sourceIndex:' + sourceIndex + ' currentTargetIndex:' + currentTargetIndex + ' currentCountIndex:' +  currentCountIndex + ' currentTarget:' + currentTarget + ' events:' + JSON.stringify(rhythms.tracks[source].events[sourceIndex]), 'debug');
		rhythms.tracks[currentTarget].events.push(rhythms.tracks[source].events[sourceIndex]);
		currentTargetCount = rhythms.tracks[trackToBuild].targetCounts[currentCountIndex];
		currentCountIndex++;
		if (currentCountIndex >= countLength) {
			currentCountIndex = 0;
			currentTargetIndex++;
		}
		if (currentTargetIndex >= targetLength) {
			currentTargetIndex = 0;
		}
	}
	rhythms.tracks[trackToBuild].run = false;
}

function fixIndexValues(trackToBuild, reIndexTo) {
	log('fixIndexValues(' + trackToBuild + ',' + reIndexTo + ')' + ' length:' + rhythms.tracks[trackToBuild].events.length, 'debug');
	if (typeof reIndexTo != 'undefined') {
		var duration = rhythms.tracks[trackToBuild].events[0].duration;
		rhythms.tracks[trackToBuild].events[0].index = reIndexTo;
	}
	log('     index:' + rhythms.tracks[trackToBuild].events[0].index + ' duration:' + rhythms.tracks[trackToBuild].events[0].duration  + ' count:' + rhythms.tracks[trackToBuild].events[0].count + ' events:' + 0, 'debug');
	for (var result=1;result<rhythms.tracks[trackToBuild].events.length;result++) {
		log('events:' + JSON.stringify(rhythms.tracks[trackToBuild].events), 'debug');
		var durationOffset = rhythms.tracks[trackToBuild].events[result-1].duration;
		var index = rhythms.tracks[trackToBuild].events[result-1].index + durationOffset;
		rhythms.tracks[trackToBuild].events[result].index = index;
		log('     index:' + index + ' duration:' + durationOffset  + ' count:' + rhythms.tracks[trackToBuild].events[result].count + ' result:' + result, 'debug');
	}
}

function setDuration(trackToBuild) {
	log('setDuration(' + trackToBuild + ')', 'info');
	for (var result=1;result<rhythms.tracks[trackToBuild].events.length;result++) {
		var duration = rhythms.tracks[trackToBuild].events[result].index - rhythms.tracks[trackToBuild].events[result-1].index
		if (duration != 0) {
			rhythms.tracks[trackToBuild].events[result-1].duration = Math.abs(duration);
		}
	}
}

function setCounts(trackToBuild) {
	log('setCounts(' + trackToBuild + ')', 'info');
	for (var source=0;source<rhythms.tracks[trackToBuild].sources.length;source++) { //for each already created source periodicity
		var sourceTrack = rhythms.tracks[trackToBuild].sources[source].source
		for (var m=0;m<rhythms.tracks[sourceTrack].events.length;m++) {
			for (var n=0;n<rhythms.tracks[trackToBuild].events.length;n++) {
				if (rhythms.tracks[trackToBuild].events[n].index == rhythms.tracks[sourceTrack].events[m].index) {
					rhythms.tracks[trackToBuild].events[n].count = rhythms.tracks[trackToBuild].events[n].count + 1;
				}
			}
		}
	}
}

function addPitches(trackToBuild) {
	if (typeof rhythms.tracks[trackToBuild].pitches == 'undefined') return;
	
	log('addPitches(' + trackToBuild + ')', 'debug');
	var symbolIndex = 0;
	
	for (var result=1;result<=rhythms.tracks[trackToBuild].events.length;result++) {
		//this needs to support multiple pitches. All pitches need to be arrays. Pitches is an array of arrays
		rhythms.tracks[trackToBuild].events[result-1].pitch = [];
		for (var i=0;i<rhythms.tracks[trackToBuild].pitches[symbolIndex].length;i++) {
			rhythms.tracks[trackToBuild].events[result-1].pitch.push(rhythms.tracks[trackToBuild].pitches[symbolIndex][i]);
		}
		symbolIndex += 1;
		if (symbolIndex >= rhythms.tracks[trackToBuild].pitches.length) {
			symbolIndex = 0;
		}
	}
}

function addChordSymbols(trackToBuild) {
	if (typeof rhythms.tracks[trackToBuild].chords == 'undefined') return;
	log('addChordSymbols(' + trackToBuild + ')', 'info');
	
	var symbolIndex = 0;
	
	for (var result=1;result<=rhythms.tracks[trackToBuild].events.length;result++) {
		//this needs to support multiple pitches. All pitches need to be arrays. Pitches is an array of arrays
		for (var i=0;i<rhythms.tracks[trackToBuild].chords[symbolIndex].length;i++) {
			if (typeof rhythms.tracks[trackToBuild].events[result-1].chord == 'undefined') {
				rhythms.tracks[trackToBuild].events[result-1].chord = [];
			}
			rhythms.tracks[trackToBuild].events[result-1].chord.push(rhythms.tracks[trackToBuild].chords[symbolIndex][i]);
		}
		symbolIndex += 1;
		if (symbolIndex >= rhythms.tracks[trackToBuild].chords.length) {
			symbolIndex = 0;
		}
	}
	convertChordsToPitches(trackToBuild);
}

//TODO!
function convertChordsToPitches(trackToBuild) {
	log('convertChordsToPitches(' + trackToBuild + ')', 'info');
	for (var result=1;result<rhythms.tracks[trackToBuild].events.length;result++) {
		if (typeof rhythms.tracks[trackToBuild].events[result].chord != 'undefined') {
			var symbol = rhythms.tracks[trackToBuild].events[result].chord[0];
			var chordRoot;
			var chordInversion;
			/*Chord types
			Maj (Major),
			- (Minor),
			° or o (Diminished),
			7 (Dominant 7th),
			Maj7 (Major 7th),
			-7 (Minor 7th),
			-maj7 (minor chord with major 7th),
			7b9,
			7#9,
			7#9b5,
			7b5,
			7sus4,
			sus4,
			+,
			9,
			b9,
			b9#11,
			#9,
			11,
			#11,
			b5,
			-6,
			-b6
			*/
			var chordType;
			var chordVoicing;
			//
			var chordOctave;
/*
Fully defining a chord is a bit verbose, but it does allow for flexible expression.
CMaj7v0i0r2
chordRoot=C
chordRootOctave=r2
chordInversion=i0
chordVoicing=v0
chordType=Maj7
*/
			var temp = symbol.match(/[A|B|C|D|E|F|G][#|b]?/);
			if (temp != null && temp.length > 0) {
				chordRoot = temp;
				symbol= symbol.replace(chordRoot,'');
			}
			var temp = symbol.match(/o[0-9]/);
			if (temp != null && temp.length > 0) {
				chordOctave = temp;
				chordOctave = chordOctave.replace('o','');
				symbol= symbol.replace(chordVoicing,'');
			}
			var temp = symbol.match(/v[0-9]{1,2}/);
			if (temp != null && temp.length > 0) {
				chordVoicing = temp;
				chordVoicing = chordVoicing.replace('v','');
				symbol= symbol.replace(chordVoicing,'');
			}

			var temp = symbol.match(/i[0-9]{1,2}/);
			if (temp != null && temp.length > 0) {
				chordInversion = temp;
				chordInversion = chordInversion.replace('i','');
				symbol= symbol.replace(chordInversion,'');
			} else {
				chordInversion = '0';
			}
			chordType = symbol;
			console.log('chordRoot:' + chordRoot + ' chordType:' + chordType + ' chordInversion:' + chordInversion);
			//we now know the chord's root, type (7, 9, etc.) and inversion, so the next step is to insert pitches.
			//Look up the type and inversion to get the pitches
			var type = -1;
			var inversion = 0;
			var voicing = 0;
			var octave = 2;
			var pitches = [];
			//find the type
			for (i=0;i<chords.length;i++) {
				for (j=0;chords[i].symbols.length;j++) {
					if (chords[i].symbols[j] = chordType) {
						type = i;
					}
				}
			}
			if (type == -1) {
				//if we didn't succeed, then fail? or default?
				log("chord not found",'error');
			}
			//find the inversion
			for (i=0;i<chords[type].toneOffsets.length;i++) {
				if (chords[type].toneOffsets[i].inversion == chordInversion) {
					inversion = i;
				}
			}
			//find the voicing
			for (i=0;i<chords[type].toneOffsets[inversion].voicings.length;i++) {
				if (chords[type].toneOffsets[inversion].voicings[i] == chordVoicing) {
					voicing = i;
				}
			}
			if (typeof chords[type].toneOffsets[inversion].voicings[voicing].octave != 'undefined') {
				octave = chords[type].toneOffsets[inversion].voicings[voicing].octave;
			}
			
			//if we got this far, now we convert the numbers to pitches & octaves, and insert them
			//for (i=0;i<) {
			//}
		}
	}
}

function genMIDIFile() {
	log('genMIDIFile()','info');
	var highestCount = 0
	var anyMidi = false;
	for (trackIndex=0;trackIndex<rhythms.tracks.length;trackIndex++) {
		for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
			if (rhythms.tracks[trackIndex].events[noteIndex].count > highestCount) {
				highestCount = rhythms.tracks[trackIndex].events[noteIndex].count;
			}
		}
		if (typeof rhythms.tracks[trackIndex].includeInScore == 'undefined') {
			rhythms.tracks[trackIndex].includeInScore = false;
		} else if (rhythms.tracks[trackIndex].includeInScore == true) {
			anyMidi = true;
		}
	}
	log('   anyMidi:' + anyMidi, 'debug');
	if (!anyMidi) return null;
	var avgVelocity = 50;
	if (typeof rhythms.averageVelocity != 'undefined') {
		avgVelocity = rhythms.averageVelocity;
	} else {
		rhythms.averageVelocity = avgVelocity;
	}
	var velocityAdjust = (100 - avgVelocity)/highestCount;
	log('   velocityAdjust:' + velocityAdjust + ' highestCount:' + highestCount + ' avgVelocity:' + avgVelocity, 'debug');
	var midiTracks = [];
	for (trackIndex=0;trackIndex<rhythms.tracks.length;trackIndex++) {
		if (rhythms.tracks[trackIndex].events.length == 0) break;
		if (rhythms.tracks[trackIndex].includeInScore) {
			var track = new MidiWriter.Track();
			midiTracks.push(track);
			var tempo;
			if (typeof rhythms.tracks[trackIndex].tempo != 'undefined') {
				tempo = rhythms.tracks[trackIndex].tempo;
			} else if (typeof rhythms.tempo != 'undefined') {
				tempo = rhythms.tempo;
			} else {
				tempo = 90;
			}
			midiTracks[midiTracks.length-1].setTempo(tempo);
			var instrumentName;
			if (typeof rhythms.tracks[trackIndex].instrumentName != 'undefined') {
				instrumentName = rhythms.tracks[trackIndex].instrumentName;
			} else {
				instrumentName = "piano";
			}
			var instrumentCode;
			if (typeof rhythms.tracks[trackIndex].instrumentCode != 'undefined') {
				instrumentCode = rhythms.tracks[trackIndex].instrumentCode;
			} else {
				instrumentCode = 1;
			}
			var timeSignature = '';
			if (typeof rhythms.tracks[trackIndex].timeSignature != 'undefined') {
				timeSignature = rhythms.tracks[trackIndex].timeSignature;
			} else {
				timeSignature = rhythms.timeSignature;
			}
			log('   writing midi for track:' + trackIndex + ' notes:' + rhythms.tracks[trackIndex].events.length + ' timeSignature:' + timeSignature, 'debug');
			var timeSigArray = timeSignature.split('/');
			midiTracks[midiTracks.length-1].setTimeSignature(timeSigArray[0],timeSigArray[1]);
			midiTracks[midiTracks.length-1].addInstrumentName(instrumentName);
			midiTracks[midiTracks.length-1].addEvent(new MidiWriter.ProgramChangeEvent({instrument: instrumentCode}));
			var velocity;
			for (noteIndex=0;noteIndex<rhythms.tracks[trackIndex].events.length;noteIndex++) {
				if (typeof rhythms.tracks[trackIndex].adjustVelocityByCount  != 'undefined' && rhythms.tracks[trackIndex].adjustVelocityByCount == true) {
					if (typeof rhythms.tracks[trackIndex].events[noteIndex].count  != 'undefined') {
						velocity = velocity + (rhythms.tracks[trackIndex].events[noteIndex].count * velocityAdjust)
					} else {
						velocity = rhythms.averageVelocity;
					}
				} else {
					velocity = rhythms.averageVelocity;
				}
				var buildNote;
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].pitch != 'undefined') {
					//midi writer will support chords if we pass in an array of pitches.
					buildNote = rhythms.tracks[trackIndex].events[noteIndex].pitch;
				} else if (typeof rhythms.tracks[trackIndex].defaultPitch != 'undefined') {
					buildNote = rhythms.tracks[trackIndex].defaultPitch;
				} else if (typeof rhythms.defaultPitch != 'undefined') {
					buildNote = rhythms.defaultPitch;
				}
				log('*****buildNote:' + buildNote, 'debug');
				var beatUnit;
				if (typeof rhythms.tracks[trackIndex].beatUnit != 'undefined') {
					beatUnit = rhythms.tracks[trackIndex].beatUnit;
				} else {
					beatUnit = 4;
					rhythms.tracks[trackIndex].beatUnit = beatUnit;
				}
				var duration = 'T' + ((512/beatUnit) * rhythms.tracks[trackIndex].events[noteIndex].duration).toString();
			
				if (typeof rhythms.tracks[trackIndex].events[noteIndex].isRest != 'undefined' && rhythms.tracks[trackIndex].events[noteIndex].isRest == "rest") {
					velocity = 0;
					log('    track:' + trackIndex + '    rest', 'debug');
				}
				if (noteIndex == 0 && rhythms.tracks[trackIndex].events[noteIndex].index > 0) {
					var durationPhantom = 'T' + ((512/beatUnit) * rhythms.tracks[trackIndex].events[noteIndex].index).toString();
					
					midiTracks[midiTracks.length-1].addEvent([new MidiWriter.NoteEvent({pitch: buildNote, duration: durationPhantom, velocity: 0})]);
				}
				log('    track:' + trackIndex + '    pitch:' + JSON.stringify(buildNote) + ' duration:' + duration + ' velocity:' + velocity, 'debug');
				midiTracks[midiTracks.length-1].addEvent([new MidiWriter.NoteEvent({pitch: buildNote, duration: duration, velocity: velocity})]);
			}
		}
	}
	var write = new MidiWriter.Writer(midiTracks);
	return write.buildFile();
}

function buildChartjsPage() {
	log('buildChartjsPage()', 'info');
	var chartString = '';
	chartString += '<!DOCTYPE html>\n';
	chartString += '<html>\n';
	chartString += '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n';
	chartString += '<body>\n';
	chartString += '<div>\n';
	chartString += '<canvas id="myChart""></canvas>\n';
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
	chartString += 'new Chart("myChart", {\n';
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
		log('   trackIndex:' + trackIndex + ' totalFiller:' + totalFiller + ' items:' + (rhythms.tracks[trackIndex].events.length-1) + ' last:' + rhythms.tracks[trackIndex].events[rhythms.tracks[trackIndex].events.length-1].index + ' inScore:' + rhythms.tracks[trackIndex].includeInScore, 'debug');
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
		if (rhythms.tracks[trackIndex].includeInScore == true) {
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
	chartString += '</html>';
	return chartString;
}
