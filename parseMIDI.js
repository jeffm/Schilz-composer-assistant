//Copyright Jeffrey D. Mershon 2022

var fs = require('fs');
//var path = require(path);
var yargs = require('yargs');
//var log = require('npmlog');
var JZZ = require('jzz');
require('jzz-midi-smf')(JZZ);

var instrumentNames = {1:'Acoustic Grand Piano',2:'Bright Acoustic Piano',3:'Electric Grand Piano',4:'Honky-tonk Piano',5:'Electric Piano 1',6:'Electric Piano 2',7:'Harpsichord',8:'Clavi',9:'Celesta',10:'Glockenspiel',11:'Music Box',12:'Vibraphone',13:'Marimba',14:'Xylophone',15:'Tubular Bells',16:'Dulcimer',17:'Drawbar Organ',18:'Percussive Organ',19:'Rock Organ',20:'Church Organ',21:'Reed Organ',22:'Accordion',23:'Harmonica',24:'Tango Accordion',25:'Acoustic Guitar (nylon)',26:'Acoustic Guitar (steel)',27:'Electric Guitar (jazz)',28:'Electric Guitar (clean)',29:'Electric Guitar (muted)',30:'Overdriven Guitar',31:'Distortion Guitar',32:'Guitar harmonics',33:'Acoustic Bass',34:'Electric Bass (finger)',35:'Electric Bass (pick)',36:'Fretless Bass',37:'Slap Bass 1',38:'Slap Bass 2',39:'Synth Bass 1',40:'Synth Bass 2',41:'Violin',42:'Viola',43:'Cello',44:'Contrabass',45:'Tremolo Strings',46:'Pizzicato Strings',47:'Orchestral Harp',48:'Timpani',49:'String Ensemble 1',50:'String Ensemble 2',51:'SynthStrings 1',52:'SynthStrings 2',53:'Choir Aahs',54:'Voice Oohs',55:'Synth Voice',56:'Orchestra Hit',57:'Trumpet',58:'Trombone',59:'Tuba',60:'Muted Trumpet',61:'French Horn',62:'Brass Section',63:'SynthBrass 1',64:'SynthBrass 2',65:'Soprano Sax',66:'Alto Sax',67:'Tenor Sax',68:'Baritone Sax',69:'Oboe',70:'English Horn',71:'Bassoon',72:'Clarinet',73:'Piccolo',74:'Flute',75:'Recorder',76:'Pan Flute',77:'Blown Bottle',78:'Shakuhachi',79:'Whistle',80:'Ocarina',81:'Lead 1 (square)',82:'Lead 2 (sawtooth)',83:'Lead 3 (calliope)',84:'Lead 4 (chiff)',85:'Lead 5 (charang)',86:'Lead 6 (voice)',87:'Lead 7 (fifths)',88:'Lead 8 (bass + lead)',89:'Pad 1 (new age)',90:'Pad 2 (warm)',91:'Pad 3 (polysynth)',92:'Pad 4 (choir)',93:'Pad 5 (bowed)',94:'Pad 6 (metallic)',95:'Pad 7 (halo)',96:'Pad 8 (sweep)',97:'FX 1 (rain)',98:'FX 2 (soundtrack)',99:'FX 3 (crystal)',100:'FX 4 (atmosphere)',101:'FX 5 (brightness)',102:'FX 6 (goblins)',103:'FX 7 (echoes)',104:'FX 8 (sci-fi)',105:'Sitar',106:'Banjo',107:'Shamisen',108:'Koto',109:'Kalimba',110:'Bag pipe',111:'Fiddle',112:'Shanai',113:'Tinkle Bell',114:'Agogo',115:'Steel Drums',116:'Woodblock',117:'Taiko Drum',118:'Melodic Tom',119:'Synth Drum',120:'Reverse Cymbal',121:'Guitar Fret Noise',122:'Breath Noise',123:'Seashore',124:'Bird Tweet',125:'Telephone Ring',126:'Helicopter',127:'Applause',128:'Gunshot'}

var globalArguments = parseArguments(process.argv.slice(2))
log('Parsed globalArguments:' + JSON.stringify(globalArguments), 'debug');
globalArguments.pitchChordFilePath = (__dirname + '\\pitchChords.json');
var sourceMIDI = JZZ.MIDI.SMF(openMIDIFile(globalArguments.ControlFilePath));
var sourceMIDIText = sourceMIDI.toString();
console.log(sourceMIDI.toString());
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
			globalArguments.MIDIpitchOffset = i-(21-12);
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
		.example('$0 generate -p "c:\projectFolder" -i "input file.mid" -o "output file.js" -v n', 'read a MIDI file and generate a Schilz control file')
		.alias('g', 'generate')
		//.describe('g', 'Generate a score')
		.demandOption(['p','i'])
		.describe('p', 'Path to the project folder.')
		.alias('p', 'project')
		.describe('i', 'Input file name. Must be a MIDI file in the project folder.')
		.alias('i', 'infile')
		.describe('j', 'JSON output file name. Will be placed in the project folder.')
		.alias('j', 'outfile')
		//.describe('b', 'Beat Unit.')
		//.alias('b', 'beat')
		.describe('a', 'Cb/B adjustment')
		.alias('a', 'adjustment')
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

	//if (typeof argv.beat != 'undefined') {
	//	argStructure.beatUnit = argv.beat;
	//}
	if (typeof argv.adjustment != 'undefined') {
		argStructure.adjustment = argv.adjustment;
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
	defaults = {}
	temp = sourceMIDIText.match(/ppqn: (\d\d?\d?)/);
	defaults.ppqn = temp[1]
	for (currentTrack=0;currentTrack<sourceMIDI.length;currentTrack++) {
		defaults = analyzeTracks(currentTrack, defaults);
	}
	for (currentTrack=0;currentTrack<sourceMIDI.length;currentTrack++) {
		rhythms.tracks.push({});
		defaults = parseTrack(currentTrack, defaults);
		convertToDurations(currentTrack, defaults);
		consolidateEvents(currentTrack);
		insertRests(currentTrack,defaults);
		
	}
	//console.log(rhythms);
}

function insertRests(TrackToParse,defaults) {
	currentIndex = 0;
	currentDuration = 0;
	for (i=0;i<rhythms.tracks[TrackToParse].events.length;i++) {
		console.log(i + '  ' + JSON.stringify(rhythms.tracks[TrackToParse].events[i]))
		console.log('index:' + rhythms.tracks[TrackToParse].events[i].index + ' curIndex:' + currentIndex + ' curDuration:' + currentDuration)
		if (rhythms.tracks[TrackToParse].events[i].index > (currentIndex + currentDuration)) {
			event = {};
			event.index = currentIndex + currentDuration;
			event.duration = rhythms.tracks[TrackToParse].events[i].index - event.index;
			event.isRest = "rest"
			currentIndex = event.index;
			currentDuration = event.duration;
			console.log('---adding event:' + JSON.stringify(event));
			rhythms.tracks[TrackToParse].events.splice(i, 0, event);
			//i++
		} else {
			currentDuration = rhythms.tracks[TrackToParse].events[i].duration;
			currentIndex = rhythms.tracks[TrackToParse].events[i].index;
		}

	}
}



function analyzeTracks(TrackToParse, defaults) {
	defaults.shortestDuration = 9999999;
	currentNotes = [];
	for (currentEvent=0;currentEvent<sourceMIDI[TrackToParse].length;currentEvent++) {
		var currentMessage = sourceMIDI[TrackToParse][currentEvent].toString();
		if (currentMessage.indexOf("Note On") > -1) {
			var found = false;
			for (i=0;i<currentNotes.length;i++) {
				if (currentNotes[i].pitch == sourceMIDI[TrackToParse][currentEvent]['1']) {
					duration = sourceMIDI[TrackToParse][currentEvent].tt - currentNotes[i].index;
					if (duration < defaults.shortestDuration) {
						defaults.shortestDuration = duration;
					}
					//console.log('Note Off duration:' + duration + ' tt: ' + sourceMIDI[TrackToParse][currentEvent].tt + ' index: ' + currentNotes[i].index + '     shortest:' + defaults.shortestDuration)
					currentNotes.splice(i,1);
					found = true;
				}
			}
			if (!found) {
				var event = {};
				event.velocity = sourceMIDI[TrackToParse][currentEvent]['2'];
				event.index = sourceMIDI[TrackToParse][currentEvent].tt
				event.duration = 0;
				event.pitch = sourceMIDI[TrackToParse][currentEvent]['1'];
				currentNotes.push(event);
			}
		} else if (currentMessage.indexOf("Tempo:") > -1) {
			var tp = currentMessage.match(/Tempo: (\d\d?\d?)/);
			if (tp.length > 0) {
				defaults.tempo = tp[1];
			}
		} else if (currentMessage.indexOf("Time Signature:") > -1) {
			//console.log('Time Sig:' + currentMessage);
			var tp = currentMessage.match(/Time Signature: (\d\d?\/\d\d?)/);
			if (tp.length > 0) {
				defaults.timeSignature = tp[1];
				temp = tp[1].split("/");
				//console.log(temp)
				if (temp.length == 2) {
					defaults.beatUnit = temp[1];
				}
			}
		}
	}
	//Now we have to convert ppqn into a musical beat unit. 4=quarter note, 8 = eigth note, etc.
	defaults.beatUnit = Math.round((defaults.ppqn / defaults.shortestDuration) * 4) //ppqn = parts per quarter note
	//console.log(' ----- defaults.beatUnit:' + defaults.beatUnit + ' ----- defaults.ppqn:' + defaults.ppqn + ' defaults.shortestDuration:' + defaults.shortestDuration)
	return defaults;
}

function convertToDurations(TrackToParse, defaults) {
	console.log('convertToDurations TrackToParse:' + TrackToParse + '  Event Count:' + sourceMIDI[TrackToParse].length + ' divisor:' + defaults.shortestDuration)
	for (i=0;i<rhythms.tracks[TrackToParse].events.length;i++) {
		if (rhythms.tracks[TrackToParse].events[i].index > 0) {
			rhythms.tracks[TrackToParse].events[i].index = Math.round(rhythms.tracks[TrackToParse].events[i].index / defaults.shortestDuration)
		}
		rhythms.tracks[TrackToParse].events[i].duration = Math.floor((rhythms.tracks[TrackToParse].events[i].duration+defaults.shortestDuration)  / defaults.shortestDuration)
	}
}

function parseTrack(TrackToParse, defaults) {
	ttDiv = defaults.shortestDuration
	console.log('TrackToParse:' + TrackToParse + '  Event Count:' + sourceMIDI[TrackToParse].length + ' divisor:' + JSON.stringify(defaults))
	if (typeof defaults.beatUnit != 'undefined') {
		rhythms.beatUnit = defaults.beatUnit;
	}
	rhythms.tracks[TrackToParse].type = "fromMIDI";
	rhythms.tracks[TrackToParse].midiChannel = TrackToParse;
	rhythms.tracks[TrackToParse].run = {}
	rhythms.tracks[TrackToParse].run.run = false;
	currentNotes = [];
	hasKey = false;
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
			var temp = currentMessage.substring(currentMessage.indexOf(text) + text.length)
			//junk characters out of MuseScore
			if (temp.indexOf("\\x00") > -1) {
				temp = temp.substring(0,temp.length-4)
			}
			rhythms.tracks[TrackToParse].name = temp;
		} else if (currentMessage.indexOf("Tempo:") > -1) {
			var tp = currentMessage.match(/Tempo: (\d\d?\d?)/);
			if (tp.length > 0) {
				rhythms.tempo = tp[1];
				defaults.tempo = tp[1];
			}
		} else if (currentMessage.indexOf("Time Signature:") > -1) {
			//console.log('Time Sig:' + currentMessage);
			var tp = currentMessage.match(/Time Signature: (\d\d?\/\d\d?)/);
			if (tp.length > 0) {
				var event = {};
				event.index = sourceMIDI[TrackToParse][currentEvent].tt;
				//event.duration = 0;
				event.timeSignature = tp[1];
				defaults.timeSignature = tp[1];
				temp = tp[1].split("/");
				console.log(temp)
				if (temp.length == 2) {
					rhythms.tracks[TrackToParse].timeSignature = tp[1];
					divisor = defaults.tempo / defaults.beatUnit
					divisorUpper = divisor * 1.1
					divisorLower = divisor * .9
					for (i=1;i<32;i++) {
						if (defaults.shortestDuration >= divisorLower/i && defaults.shortestDuration <= divisorUpper/1) {
							defaults.beatUnit = 4 * i;
							defaults.shortestDuration = defaults.tempo / defaults.beatUnit
							break;
						}
					}
				}
				if (typeof rhythms.timeSignature == 'undefined') {
					rhythms.timeSignature = tp[1];
				}
			}
		} else if (currentMessage.indexOf("Instrument Name:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt;
			//event.duration = 0;
			var text = "Instrument Name: ";
			event.instrumentName = currentMessage.substring(currentMessage.indexOf(text) + text.length);
			defaults.instrumentName = event.instrumentName;
			rhythms.tracks[TrackToParse].events.push(event);
			
//$$$Program Change 
		} else if (currentMessage.indexOf("Program Change") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt;
			//event.duration = 0;
			event.instrumentCode = sourceMIDI[TrackToParse][currentEvent]['1'];
			defaults.instrumentCode = event.instrumentCode;
			//console.log('instrument Code:' + event.instrumentCode);
			event.instrumentName = instrumentNames[event.instrumentCode]
			rhythms.tracks[TrackToParse].events.push(event);
		} else if (currentMessage.indexOf("Key Signature:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt;
			//event.duration = 0;
			var text = "Key Signature: ";
			temp = currentMessage.substring(currentMessage.indexOf(text) + text.length);
			event.keyOf = normalizeKey(temp);
			currentKey = event.keyOf;
			currentSharpFlat = setKeySharpFlatFlag(currentKey);
			temp = parsekeyOf(currentKey);
			event.shortKey = temp.shortKey;
			rhythms.tracks[TrackToParse].events.push(event);
			defaults.keyOf = event.keyOf;
			defaults.shortKey = event.shortKey;
			hasKey = true;
			//console.log('ParseMIDIKeyChange: ' + JSON.stringify(event));
		} else if (currentMessage.indexOf("Text:") > -1) {
			var event = {};
			event.index = sourceMIDI[TrackToParse][currentEvent].tt;
			//event.duration = 0;
			var text = "Text: "
			event.chord = [];
			event.chord.push(currentMessage.substring(currentMessage.indexOf(text) + text.length));
			rhythms.tracks[TrackToParse].events.push(event);
		} else if (currentMessage.indexOf("Note On") > -1) {
			var event = {};
			event.velocity = sourceMIDI[TrackToParse][currentEvent]['2'];
			event.index = sourceMIDI[TrackToParse][currentEvent].tt;
			//event.duration = 0;
			event.pitch = [];
			var tempPitch = setSharpFlat(getPitchCode(sourceMIDI[TrackToParse][currentEvent]['1']+globalArguments.MIDIpitchOffset,"pitch"),currentSharpFlat);
			if (typeof globalArguments.adjustment != 'undefined' && globalArguments.adjustment == true) {
				var matched = tempPitch[0].match(/^(Cb|B)(\d\d?)/)
				if (matched != null && matched.length == 3) {
					tempPitch.length = 0;
					tempPitch.push(matched[1] + (parseInt(matched[2])+1))
				}
			}
			event.pitch.push(tempPitch)
			rhythms.tracks[TrackToParse].events.push(event);
			curNote = {};
			curNote.pitch = sourceMIDI[TrackToParse][currentEvent]['1'];
			curNote.item =  rhythms.tracks[TrackToParse].events.length - 1;
			currentNotes.push(curNote);
			
			console.log('New NoteOn:' + JSON.stringify(curNote) + '   ' + JSON.stringify(event) + '  ' + sourceMIDI[TrackToParse][currentEvent].tt)

		} else if (currentMessage.indexOf("Note Off") > -1) {
			console.log("Current Notes: " + JSON.stringify(currentNotes) + '  Pitch to Turn Off: ' + sourceMIDI[TrackToParse][currentEvent]['1']);
			for (i=0;i<currentNotes.length;i++) {
				if (currentNotes[i].pitch == sourceMIDI[TrackToParse][currentEvent]['1']) {

					rhythms.tracks[TrackToParse].events[currentNotes[i].item].duration = sourceMIDI[TrackToParse][currentEvent].tt - (rhythms.tracks[TrackToParse].events[currentNotes[i].item].index);
					console.log('Note Off duration: ' + sourceMIDI[TrackToParse][currentEvent].tt + ' - ' + rhythms.tracks[TrackToParse].events[currentNotes[i].item].index  + ' = ' + rhythms.tracks[TrackToParse].events[currentNotes[i].item].duration)
					//console.log('Note Off:' + JSON.stringify(rhythms.tracks[TrackToParse].events[currentNotes[i].item]))
					currentNotes.splice(i,1);
				}
			}
		}
	}
	if (!hasKey) {
		var temp = {
			index : 0,
			keyOf : defaults.keyOf,
			shortKey : defaults.shortKey,
			timeSignature : defaults.timeSignature
		}
		rhythms.tracks[TrackToParse].events.unshift(temp)
	}
	return defaults;
}

function normalizeKey(midiKey) {
	if (typeof midiKey == 'undefined' || midiKey.length == 0) return;
	//console.log(midiKey)
	//need to understand what midi key signatures look like. They are normally given in number of sharps or flats, and a Major or Minor indicator, which comes back as "min"
	var tp = midiKey.match(/(.*) min/);
	if (typeof tp != 'undefined' && tp != null && tp.length > 0) {
		return tp[1] + " Natural Minor";
	} else {
		return midiKey + " Major";
	}
}

function consolidateEvents(TrackToParse) {
	for (currentEvent=0;currentEvent<rhythms.tracks[TrackToParse].events.length;currentEvent++) {
		if (typeof rhythms.tracks[TrackToParse].events[currentEvent].pitch == 'undefined') {
			var curIndex = rhythms.tracks[TrackToParse].events[currentEvent].index
			for (findEvent=0;findEvent<rhythms.tracks[TrackToParse].events.length;findEvent++) {
				if (findEvent != currentEvent && typeof rhythms.tracks[TrackToParse].events[findEvent].pitch != 'undefined' && rhythms.tracks[TrackToParse].events[findEvent].index == rhythms.tracks[TrackToParse].events[currentEvent].index) {
					var newObj = {...rhythms.tracks[TrackToParse].events[currentEvent],...rhythms.tracks[TrackToParse].events[findEvent]}
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
					if (typeof rhythms.tracks[TrackToParse].events[findEvent].instrumentName != 'undefined') {
						rhythms.tracks[TrackToParse].events[currentEvent].instrumentName = rhythms.tracks[TrackToParse].events[findEvent].instrumentName;
					}
					if (typeof rhythms.tracks[TrackToParse].events[findEvent].keyOf != 'undefined') {
						rhythms.tracks[TrackToParse].events[currentEvent].keyOf = rhythms.tracks[TrackToParse].events[findEvent].keyOf;
						rhythms.tracks[TrackToParse].events[currentEvent].shortKey = rhythms.tracks[TrackToParse].events[findEvent].shortKey;
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

function createShortKey(key) {
	var temp = keyString.match(/^[A|B|C|D|E|F|G][#|b]?/);
}

function getInstrumentNameCode(item, code, channel) {
	ret = {
		instrumentName : '',
		instrumentCode : ''
	}
	if (code == name) {
		ret.instrumentCode = item;
	} else {
		ret.instrumentName = item;
	}
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
		if (key.scaleName == 'Minor' || key.scaleName == 'Natural Minor' || key.scaleName == 'Aeolian') {
			key.shortKeyType = 'm';
		} else if (key.scaleName == 'Major' || key.scaleName == 'Ionian') {
			key.shortKeyType = '';
		//for other keys and modes we need to determine the equivalent major or minor key where possible, and put that here. 
		} else if (key.scaleName == 'Harmonic Minor') {
			key.shortKeyType = 'm';
		} else if (key.scaleName == 'Melodic Minor') {
			key.shortKeyType = 'm';
		//} else if (key.scaleName == 'Chromatic') {
		//} else if (key.scaleName == 'Whole Tone') {
		} else if (key.scaleName == 'Pentatonic') {
			key.shortKeyType = '';
		//} else if (key.scaleName == 'Dorian') {
			//C Dorian = Bb/A# Major, or minus 2
		//} else if (key.scaleName == 'Phrygian') {
			//C Phrygian = Ab/G# Major
		//} else if (key.scaleName == 'Lydian') {
			//C Lydian = G Major
		//} else if (key.scaleName == 'Myxolydian') {
			//C Myxolydian = F Major
		//} else if (key.scaleName == 'Locrian') {
			//C Locrian = C# Major
		} else {
			key.shortKeyType = '';
		}
	} else {
		key.scaleName = "Major";
		key.shortKeyType = '';
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
	key.shortKey = key.signature + key.shortKeyType
	//console.log('key:' + JSON.stringify(key));
	return key;	
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
	var tempPitch;
	var returnPitch = [];
	//console.log(pitchCode + ' ' + sharpOrFlat);
	//Special handling for B, Cb
	if (pitchCode.length == 2 && pitchCode[0].startsWith('B') && pitchCode[1].startsWith('Cb')) {
		//console.log('1');
		if (sharpOrFlat == '#') {
			returnPitch.push(pitchCode[0])
		} else {
			returnPitch.push(pitchCode[1])
		}
	} else {
		for (var i=0;i<pitchCode.length;i++) {
			if (sharpOrFlat == '#') {
				tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]#\d/);
				if (tempPitch != null) {
					
					returnPitch.push(tempPitch);
				//} else {
				//	tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]\d/);
				//	if (tempPitch != null) {
				//		returnPitch.push(tempPitch);
				//	}
				}
			} else {
				tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]b\d/);
				if (tempPitch != null) {
					//console.log('2');
					returnPitch.push(tempPitch);
				} else {
					tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]\d/);
					if (tempPitch != null) {
						//console.log('3');
						returnPitch.push(tempPitch);
					}
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

function flattenArray(inputArray) {
	return inputArray.flat(3);
}
