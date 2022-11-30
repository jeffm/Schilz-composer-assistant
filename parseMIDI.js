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
var sourceMIDI = JZZ.MIDI.SMF(openMIDIFile(globalArguments.ControlFilePath));
var rhythms = {};
var pitchChords = openInputFile(globalArguments.pitchChordFilePath);
//console.log(pitchChords)
if (sourceMIDI != null) {
	populateGlobalDefaults(globalArguments);
	generateTracks(globalArguments);
	writeJSON(globalArguments.JSONoutpath);
}

function populateGlobalDefaults(globalArguments) {
	for (i=0;i<pitchChords.pitches.length;i++) {
		if (pitchChords.pitches[i][0] == 'A0') {
			globalArguments.MIDIpitchOffset = i-(21-24);
			//console.log('globalArguments.MIDIpitchOffset:' + globalArguments.MIDIpitchOffset);
			break;
		}
	}
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
		.describe('b', 'Beat Unit.')
		.alias('b', 'beat')
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

	if (typeof argv.beat != 'undefined') {
		argStructure.beatUnit = argv.beat;
	}
	if (typeof argv.outfile != 'undefined') {
		argStructure.JSONoutpath = argStructure.projectPath + argv.outfile.replace(/'/g,'');
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
		argStructure.logLevel = 2;
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

function openMIDIFile (inpath) {
	if (inpath != '') {
		console.log('openInputFile:' + inpath, 'info');
		try {
			return fs.readFileSync(inpath);
		} catch (err) {
		   console.log(err,'error');
		   return null;
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

function generateTracks(arguments) {
	log('generateTracks()','info');
	console.log('Track Count:' + sourceMIDI.length);
	rhythms.tracks = [];
	//console.log(sourceMIDI.toString());
	for (currentTrack=0;currentTrack<sourceMIDI.length;currentTrack++) {
		rhythms.tracks.push({});
		parseTrack(currentTrack);
		consolidateEvents(currentTrack);
	}
	//console.log(rhythms);
}

function parseTrack(TrackToParse) {
	console.log('TrackToParse:' + TrackToParse + '  Event Count:' + sourceMIDI[TrackToParse].length)
	rhythms.tracks[TrackToParse].type = "none";
	rhythms.tracks[TrackToParse].midiChannel = TrackToParse;
	rhythms.tracks[TrackToParse].run = {}
	rhythms.tracks[TrackToParse].run.run = false;
	currentNotes = [];
	var currentKey = "C Major";
	var currentSharpFlat  = "#";
	rhythms.tracks[TrackToParse].events = []
	for (currentEvent=0;currentEvent<sourceMIDI[TrackToParse].length;currentEvent++) {
		var currentMessage = sourceMIDI[TrackToParse][currentEvent].toString();
		//console.log(sourceMIDI[TrackToParse][currentEvent])
		if (currentMessage.indexOf("Copyright:") > -1) {
			var text = "Copyright: ";
			rhythms.copyright = currentMessage.substring(currentMessage.indexOf(text) + text.length)
		} else if (currentMessage.indexOf("Sequence Name:") > -1) {
			var text = "Sequence Name: ";
			rhythms.name = currentMessage.substring(currentMessage.indexOf(text) + text.length);
		} else if (currentMessage.indexOf("Tempo:") > -1) {
			var tp = currentMessage.match(/Tempo: (\d\d)/);
			if (tp.length > 0) {
				rhythms.tempo = tp[1];
			}
		} else if (currentMessage.indexOf("Time Signature:") > -1) {
			//console.log('Time Sig:' + currentMessage);
			var tp = currentMessage.match(/Time Signature: (\d\d?\/\d\d?)/);
			if (tp.length > 0) {
				rhythms.timeSignature = tp[1];
			}
		} else if (currentMessage.indexOf("Instrument Name:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt/(128*globalArguments.beatUnit);
			var text = "Instrument Name: ";
			event.instrumentName = currentMessage.substring(currentMessage.indexOf(text) + text.length);
			rhythms.tracks[TrackToParse].events.push(event);
		} else if (currentMessage.indexOf("Key Signature:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt/(128*globalArguments.beatUnit);
			var text = "Key Signature: ";
			temp = currentMessage.substring(currentMessage.indexOf(text) + text.length);
			event.keyOf = normalizeKey(temp);
			currentKey = event.keyOf;
			currentSharpFlat = setKeySharpFlatFlag(currentKey);
			rhythms.tracks[TrackToParse].events.push(event);
		} else if (currentMessage.indexOf("Text:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt/(128*globalArguments.beatUnit);
			var text = "Text: "
			event.chord = [];
			event.chord.push(currentMessage.substring(currentMessage.indexOf(text) + text.length));
			rhythms.tracks[TrackToParse].events.push(event);
		} else if (currentMessage.indexOf("Note On") > -1) {
			var event = {};
			//console.log(temp['1']);
			event.velocity = sourceMIDI[TrackToParse][currentEvent]['2'];
			event.index = sourceMIDI[TrackToParse][currentEvent].tt/(128*globalArguments.beatUnit);
			event.pitch = [];
			var temp = getPitchCode(sourceMIDI[TrackToParse][currentEvent]['1']+globalArguments.MIDIpitchOffset,"pitch");
			event.pitch.push(setSharpFlat(temp,currentSharpFlat));
			rhythms.tracks[TrackToParse].events.push(event);
			//console.log(sourceMIDI[TrackToParse][currentEvent]['1'] + ' ' + globalArguments.MIDIpitchOffset + ' ' + JSON.stringify(event))
			curNote = {};
			curNote.pitch = sourceMIDI[TrackToParse][currentEvent]['1'];
			curNote.item =  rhythms.tracks[TrackToParse].events.length - 1;
			currentNotes.push(curNote);
		} else if (currentMessage.indexOf("Note Off") > -1) {
			//console.log(JSON.stringify(currentNotes) + '   ' + sourceMIDI[TrackToParse][currentEvent]['1']);
			for (i=0;i<currentNotes.length;i++) {
				if (currentNotes[i].pitch == sourceMIDI[TrackToParse][currentEvent]['1']) {
					rhythms.tracks[TrackToParse].events[currentNotes[i].item].duration = (sourceMIDI[TrackToParse][currentEvent].tt/(128*globalArguments.beatUnit)) - (rhythms.tracks[TrackToParse].events[currentNotes[i].item].index);
					currentNotes.splice(i,1);
				}
			}
		}
	}
}

function normalizeKey(midiKey) {
	//need to understand what midi key signatures look like. They are normally given in number of sharps or flats, and a Major or Minor indicator, which comes back as "min"
	var tp = midiKey.match(/(.*) min/);
	if (tp.length > 0) {
		return tp[1] + " Natural Minor";
	} else {
		return tp[1] + " Major";
	}
}

function consolidateEvents(TrackToParse) {
	for (currentEvent=0;currentEvent<rhythms.tracks[TrackToParse].events.length;currentEvent++) {
		if (typeof rhythms.tracks[TrackToParse].events[currentEvent].pitch == 'undefined') {
			var curIndex = rhythms.tracks[TrackToParse].events[currentEvent].index
			for (findEvent=0;findEvent<rhythms.tracks[TrackToParse].events.length;findEvent++) {
				if (findEvent != currentEvent && typeof rhythms.tracks[TrackToParse].events[findEvent].pitch != 'undefined' && rhythms.tracks[TrackToParse].events[findEvent].index == rhythms.tracks[TrackToParse].events[currentEvent].index) {
					var newObj = {...rhythms.tracks[TrackToParse].events[findEvent], ...rhythms.tracks[TrackToParse].events[currentEvent]}
					//console.log(JSON.stringify(newObj))
					rhythms.tracks[TrackToParse].events[currentEvent] = newObj;
					rhythms.tracks[TrackToParse].events.splice(findEvent,1);
					if (findEvent < currentEvent) {
						currentEvent = findEvent
					}
					break;
				}
			}
		}
	}
	for (currentEvent=0;currentEvent<rhythms.tracks[TrackToParse].events.length;currentEvent++) {
		if (typeof rhythms.tracks[TrackToParse].events[currentEvent].pitch != 'undefined') {
			var curIndex = rhythms.tracks[TrackToParse].events[currentEvent].index
			for (findEvent=0;findEvent<rhythms.tracks[TrackToParse].events.length;findEvent++) {
				if (findEvent != currentEvent && typeof rhythms.tracks[TrackToParse].events[findEvent].pitch != 'undefined' && rhythms.tracks[TrackToParse].events[findEvent].index == rhythms.tracks[TrackToParse].events[currentEvent].index) {
					//console.log('found pitches to merge!' + currentEvent + ' ' + rhythms.tracks[TrackToParse].events[currentEvent].pitch + '    ' + findEvent + ' ' + rhythms.tracks[TrackToParse].events[findEvent].pitch)
					for (i=0;i<rhythms.tracks[TrackToParse].events[findEvent].pitch.length;i++) {
						rhythms.tracks[TrackToParse].events[currentEvent].pitch.push(rhythms.tracks[TrackToParse].events[findEvent].pitch[i])
					}
					if (typeof rhythms.tracks[TrackToParse].events[findEvent].chord != 'undefined') {
						if (typeof rhythms.tracks[TrackToParse].events[currentEvent].chord != 'undefined') {
							rhythms.tracks[TrackToParse].events[currentEvent].chord += ' ' + rhythms.tracks[TrackToParse].events[findEvent].chord;
						} else {
							rhythms.tracks[TrackToParse].events[currentEvent].chord = rhythms.tracks[TrackToParse].events[findEvent].chord;
						}
					}
					rhythms.tracks[TrackToParse].events.splice(findEvent,1);
					if (findEvent < currentEvent) {
						currentEvent = findEvent
					}
					break;
				}
			}
		}
	}	
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

function setSharpFlat(pitchCode, sharpOrFlat) {
	if (typeof pitchCode == 'undefined') return;
	//var fS = sharpOrFlat;
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
			}
		}
	}
	if (returnPitch.length == 0) {
		returnPitch.push(flattenArray(pitchCode));
	}
	//console.log('pitchCode:' + pitchCode + ' sharpOrFlat:' + sharpOrFlat + ' tempPitch:' + tempPitch + ' returnPitch:' + returnPitch + ' returnPitchLength:' + returnPitch.length);
	return flattenArray(returnPitch);
}

function setKeySharpFlatFlag (key) {
	//console.log('setKeySharpFlatFlag:' + key);
	tempKey = key.match(/^([A|B|C|D|E|F|G][#|b]?) (.*)/);
	if (tempKey != null) {
		keySig = tempKey[1];
		if (tempKey.length == 3) {
			keyType = tempKey[2];
		} else {
			keyType = "Major"
		}
	} else {
		//console.log('NOT GOOD, MAV!')
	}
	//console.log('keySig:' + keySig + '  keyType:' + keyType);
	var scale = {};
	scale.keyIndex = -1;
	for (var i=0;i<pitchChords.scalesExpanded.length;i++) {
		//console.log('Searching for:' + keySig + '  in keys:' + pitchChords.scalesExpanded[i].keys);
		if (pitchChords.scalesExpanded[i].keys == keySig) {
			scale.keyIndex = i;
			//console.log('-----found key:' + pitchChords.scalesExpanded[i].keys);
			break;
		}
	}
	for (var i=0;i<pitchChords.scalesExpanded[scale.keyIndex].scales.length;i++) {
		for (var j=0;j<pitchChords.scalesExpanded[scale.keyIndex].scales[i].names.length;j++) {
			//console.log('-----scales:' + pitchChords.scalesExpanded[key.explicitScale.keyIndex].scales[i].names[j] + ' key:' + JSON.stringify(key));
			if (pitchChords.scalesExpanded[scale.keyIndex].scales[i].names[j].toString() == keyType) {
				//console.log('setting sharp flat:' + pitchChords.scalesExpanded[scale.keyIndex].scales[i].sharpFlat);
				return pitchChords.scalesExpanded[scale.keyIndex].scales[i].sharpFlat;
			}
		}
	}
	//console.log('returned scale 2:' + JSON.stringify(key));
	return '#';
}

function flattenArray(inputArray) {
	return inputArray.flat(3);
}
