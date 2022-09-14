var fs = require('fs');
var pitchChords = openInputFile(__dirname + '\\pitchChords.json');
//generateAllScales();
//chords
writeJSON(__dirname + '\\chordExpansions.json', generateChordExpansions("C"));
//generateKeyExpansions();

function generateKeyExpansions() {
	var expandedScales = generateKeyExpansions("A","retArray");
	//console.log('***expandedScales.length: ' + expandedScales.length);
	var expandedScalesReport = []
	for (var escale=0;escale<expandedScales.length;escale++) {
		console.log('\ti:' + escale + ' array:' + expandedScales[escale].array)
		var temp = findScalesKeysModes(expandedScales[escale].array,100,["Chromatic"]);
		if (temp.matches.length > 0) {
			temp.multiplier = expandedScales[escale].multiplier;
			expandedScalesReport.push(temp);
		}
	}
	writeString(__dirname + '\\pitchesInScales.txt', stringifyKeysMatchingTones(expandedScalesReport));
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

function writeJSON(JSONoutpath, content) {
	log('writeJSON() ' + JSONoutpath, 'info');
	if (typeof JSONoutpath != 'undefined' && JSONoutpath != '' && typeof content != 'undefined') {
		try {
			var outFile = fs.openSync(JSONoutpath,'w');
			fs.writeSync(outFile,JSON.stringify(content));
		} catch (err) {
		   log(err,'error');
		}
	}
}

function writeString(Stringoutpath, content) {
	log('writeString() ' + Stringoutpath, 'info');
	if (typeof Stringoutpath != 'undefined' && Stringoutpath != '' && typeof content != 'undefined') {
		try {
			var outFile = fs.openSync(Stringoutpath,'w');
			fs.writeSync(outFile,content);
		} catch (err) {
		   log(err,'error');
		}
	}
}

function stringifyKeysMatchingTones(jsonInput) {
	var outputString = '';
	for (var i=0;i<jsonInput.length;i++) {
		//source
		var sourceString = '';
		sourceString += jsonInput[i].source[0].toString().match(/([A-G][\#|b]?)(\d)?/)[1];
		for (var j=1;j<jsonInput[i].source.length;j++) {
			sourceString += ',' + jsonInput[i].source[j].toString().match(/([A-G][\#|b]?)(\d)?/)[1];
		}
		outputString += 'Multiplier: ' + jsonInput[i].multiplier + '   Input Pitches: ' + sourceString + '\n'
		
		for (var m=0;m<jsonInput[i].matches.length;m++) {
			var keyString = '';
			keyString += '\tKey: ' + jsonInput[i].matches[m].key + '\tScales: ' + jsonInput[i].matches[m].scales[0].toString();
			for (var k=1;k<jsonInput[i].matches[m].scales.length;k++) {
				keyString += '\t' + jsonInput[i].matches[m].scales[k].toString();
			}
			outputString += keyString + '\n'
		}
		outputString += '\n'
	}
	//console.log(outputString);
	return outputString;
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
	if (logLevel <= 2) {
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

function findChords(inPitches, threshold, ignoreChords){
	//not at all working as this was just copied from another function.
	//Note that the commented out levels of nesting are because we assume that voicings have the same notes. 
	log('findChords:' + JSON.stringify(inPitches) + ' ' + pitchChords.chordsExpanded.length,'info');
	var result = {};
	var keys = [];
	for (var i=0;i<pitchChords.scalesExpanded.length;i++) {
		scales = {};
		scales.key = pitchChords.scalesExpanded[i].keys;
		scales.matches = [];
		//console.log('  i:' + i + 'j:' + pitchChords.scalesExpanded[i].scales.length);
		
		for (var j=0;j<pitchChords.scalesExpanded[i].scales.length;j++) {
			scale = {};
			scale.pitches2 = [];
			scale.scaleNames = pitchChords.scalesExpanded[i].scales[j].names;
			//log('key:' + scales.key + ' name:' + scale.scaleNames +  ' k:' + JSON.stringify(pitchChords.scalesExpanded[i].scales[j].pitches),'debug');
			nextScale:
			for (var k=0;k<pitchChords.scalesExpanded[i].scales[j].pitches.length;k++) {
				//log('  scale:' + JSON.stringify(pitchChords.scalesExpanded[i].scales[j]),'debug');
				for (ignoreIndex=0;ignoreIndex<ignoreScales.length;ignoreIndex++) {
					for (scaleNameIndex=0;scaleNameIndex<pitchChords.scalesExpanded[i].scales[j].names.length;scaleNameIndex++) {
						if (pitchChords.scalesExpanded[i].scales[j].names[scaleNameIndex] == ignoreScales[ignoreIndex]) {
							break nextScale;
						}
					}
				}
				for (var l=0;l<pitchChords.scalesExpanded[i].scales[j].pitches[k].length;l++) {
					pitches = [];
					for (var m=0;m<inPitches.length;m++) {
						//console.log('    l:' + l + ' v:' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l] + ' m:' + m + ' v:' + inPitches[m],'debug');
						if (inPitches[m] == pitchChords.scalesExpanded[i].scales[j].pitches[k][l]) {
							pitches.push(inPitches[m]);
							//console.log('        match!' + JSON.stringify(pitches) + ' l-' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l],'debug');
						}
					}
					if (pitches.length > 0) {
						scale.pitches2.push(Array.from(new Set(pitches))[0]);
						//log('    match 72!' + JSON.stringify(scale.pitches),'debug');
					}
				//log('i:'+i + ' j:' + j + ' k:' + k + ' value:' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l],'debug');
				}
				
			}
			if (scale.pitches2.length > 0) {
					scale.pitches = Array.from(new Set(scale.pitches2));
					delete scale["pitches2"];
					//scale.matchCount = Array.from(new Set(scale.pitches)).length;
					scale.matchPercent = Math.round((scale.pitches.length / inPitches.length)*100);
					if (scale.matchPercent >= threshold) {
						scales.matches.push(scale);
					}
					
					//console.log('    match 78!' + JSON.stringify(scales.matches));
				}
			
		}
		if (scales.matches.length > 0) {
			keys.push(scales);
		}
		
	}
	result.matchingScales = keys.length;
	result.results = keys;
	result.compact = {};
	result.compact.source = JSON.stringify(inPitches); 
	result.compact.matches = [];
	//console.log('---' + result.results.length)
	for (var i=0;i<result.results.length;i++) {
		//console.log(JSON.stringify(result.results[i]));
		var newResult = {};
		newResult.key = result.results[i].key;
		newResult.scales = [];
		for (var j=0;j<result.results[i].matches.length;j++) {
			newResult.scales.push(result.results[i].matches[j].scaleNames);
		}
		result.compact.matches.push(newResult);
	}
	
	return result.compact;	
}


function uniqifyArray(arrayIn, arrayElements) {
	var tempArray = [];
	for (i=0;i<arrayIn.length;i++) {
		tempArray.push(arrayIn[i].toString());
	}
	if (!arrayElements) {
		return Array.from(new Set(tempArray))
	} else {
		//console.log('tempArray:' + tempArray);
		tempArray = Array.from(new Set(tempArray));
		var tempArray2 = [];
		for (i=0;i<tempArray.length;i++) {
			tempArrayElement = [];
			tempArrayElement.push(tempArray[i])
			tempArray2.push(tempArrayElement);
		}
		return tempArray2;
	}
}

function findScalesKeysModes(inPitches, threshold, ignoreScales) {
	var uniqueInPitches = uniqifyArray(inPitches,true);
	log('findScalesKeysModes:' + JSON.stringify(uniqueInPitches) + ' ' + pitchChords.scalesExpanded.length,'info');
	
	var result = {};
	var keys = [];
	for (var i=0;i<pitchChords.scalesExpanded.length;i++) {
		scales = {};
		scales.key = pitchChords.scalesExpanded[i].keys;
		scales.matches = [];
		//console.log('  i:' + i + ' j:' + pitchChords.scalesExpanded[i].scales.length);
		for (var j=0;j<pitchChords.scalesExpanded[i].scales.length;j++) {
			scale = {};
			scale.pitches2 = [];
			scale.scaleNames = pitchChords.scalesExpanded[i].scales[j].names;
			//console.log('key:' + scales.key + ' name:' + scale.scaleNames +  ' k:' + JSON.stringify(pitchChords.scalesExpanded[i].scales[j].pitches));
			nextScale:
			for (var k=0;k<pitchChords.scalesExpanded[i].scales[j].pitches.length;k++) {
				//log('  scale:' + JSON.stringify(pitchChords.scalesExpanded[i].scales[j]),'debug');
				for (ignoreIndex=0;ignoreIndex<ignoreScales.length;ignoreIndex++) {
					for (scaleNameIndex=0;scaleNameIndex<pitchChords.scalesExpanded[i].scales[j].names.length;scaleNameIndex++) {
						if (pitchChords.scalesExpanded[i].scales[j].names[scaleNameIndex] == ignoreScales[ignoreIndex]) {
							break nextScale;
						}
					}
				}
				for (var l=0;l<pitchChords.scalesExpanded[i].scales[j].pitches[k].length;l++) {
					pitches = [];
					for (var m=0;m<uniqueInPitches.length;m++) {
						
						var pitchNoOctave = uniqueInPitches[m].toString().match(/([A-G][\#|b]?)(\d)?/)[1];
						//console.log('    l:' + l + ' v:' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l] + ' m:' + m + ' v:' + pitchNoOctave,'debug');
						if (pitchNoOctave == pitchChords.scalesExpanded[i].scales[j].pitches[k][l].toString()) {
							pitches.push(pitchNoOctave);
							//console.log('        match!' + JSON.stringify(pitches) + ' l-' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l],'debug');
						}
					}
					if (pitches.length > 0) {
						scale.pitches2.push(Array.from(new Set(pitches)).toString());
						//console.log('    match 72!' + JSON.stringify(scale.pitches),'debug');
					}
				//console.log('i:'+i + ' j:' + j + ' k:' + k + ' value:' + pitchChords.scalesExpanded[i].scales[j].pitches[k][l],'debug');
				}
			}
			if (scale.pitches2.length > 0) {
				scale.pitches = Array.from(new Set(scale.pitches2));
				delete scale["pitches2"];
				//scale.matchCount = Array.from(new Set(scale.pitches)).length;
				scale.matchPercent = Math.round((scale.pitches.length / uniqueInPitches.length)*100);
				if (scale.matchPercent >= threshold) {
					scales.matches.push(scale);
				}
			}
			
		}
		if (scales.matches.length > 0) {
			//console.log('    match 78!' + JSON.stringify(scales.matches));
			keys.push(scales);
		}
		
	}
	result.matchingScales = keys.length;
	result.results = keys;
	result.compact = {};
	result.compact.source = uniqueInPitches; 
	result.compact.matches = [];
	//console.log('---' + result.results.length)
	for (var i=0;i<result.results.length;i++) {
		//console.log(JSON.stringify(result.results[i]));
		var newResult = {};
		newResult.key = result.results[i].key;
		newResult.scales = [];
		for (var j=0;j<result.results[i].matches.length;j++) {
			newResult.scales.push(result.results[i].matches[j].scaleNames);
		}
		result.compact.matches.push(newResult);
	}
	//console.log(JSON.stringify(result.compact));
	
	return result.compact;	
}

function generateChordExpansions(root) {
	//For a given root, generate all of the chords
	var specificRoot = root + '4';
	var sharpFlatFlag = "#";
	var rootCode = pitchCodeFinder(specificRoot,true);
	console.log('generateChordExpansions(' + root + ')' + ' code:' + rootCode + ' pl:' + pitchChords.chords.length);
	var expandedChords = [];
	for (var i=0;i<pitchChords.chords.length;i++) {
		//console.log('i:' + i + ' pl:' + pitchChords.chords[i].toneOffsets.length)
		var expansion = {};
		expansion.chords = [];
		//for (j=0;j<pitchChords.chords[i].toneOffsets.length;j++) {
			j=0;
			//console.log(' j:' + j + ' pl:' + pitchChords.chords[i].toneOffsets[j].voicings.length)
			//var offsets = [];
			//for (k=0;k<pitchChords.chords[i].toneOffsets[j].voicings.length;k++) {
				k=0;
				//console.log('    k:' + k + ' pl:' + pitchChords.chords[i].toneOffsets[j].voicings[k].offsets.length)
				var voicing = {};
				pitchCodes = [];
				
				for (l=0;l<pitchChords.chords[i].toneOffsets[j].voicings[k].offsets.length;l++) {
					//console.log('       l:' + l);
					pitchCodes.push(rootCode + pitchChords.chords[i].toneOffsets[j].voicings[k].offsets[l]);
					//console.log('j:' + j + ' k:' + k + ' l:' + l + ' v-' + (rootCode + pitchChords.chords[i].toneOffsets[j].voicings[k].offsets[l]))
	
				}
				if (pitchCodes.length > 0) {
					voicing.name = pitchChords.chords[i].toneOffsets[j].voicings[k].offsets[l];
					var pitches = [];
					for (var m=0;m<pitchCodes.length;m++) {
						pitches.push(sharpFlat(pitchCodeFinder(pitchCodes[m],false),sharpFlatFlag)[0].toString().match(/([A-G][\#|b]?)(\d)?/)[1]);
					}
					voicing.pitches = pitches;
					expansion.chords.push(voicing);
				}
			//}
			//if (offsets.length > 0) {
				//expansion.chords.push(offsets);
			//}
		//}
		if (expansion.chords.length > 0) {
			expansion.chordType = pitchChords.chords[i].chordType;
			expandedChords.push(expansion)
		}
	}
	return expandedChords;
}

function generateKeyExpansions(keyOf, outputType) {
	var rootCode = pitchCodeFinder("A3",true);
	var minPitch = "A3";
	var minPitchCode = pitchCodeFinder(minPitch,true);
	var maxPitch = "G4";
	var sharpFlatFlag = "#";
	var maxPitchCode = pitchCodeFinder(maxPitch,true);
	var pitchesIn = [["A3"],["B3"],["C4"],["D4"],["E4"],["F4"],["G4"]]
	var singleLineOutput = '';
	var pitchesOnlyOutput = '';
	var intervalsOnlyOutput = '';
	var pitchesArray = [];
	for (var i=0.1;i<12;i+=0.1) {
		multiplier = Math.round(i * 10) / 10
		var pitchesOut = [];
		var codesOut = []
		for (var j=0;j<pitchesIn.length;j++) {
			var curPitch = pitchesIn[j];
			var invertPitchCode = pitchCodeFinder(curPitch[0]);
			var interval = (invertPitchCode - rootCode);
			curPitchCode = rootCode + (interval*Math.abs(multiplier));
			var newPitchCode = getPitchInRange(minPitchCode,maxPitchCode,curPitchCode);
			log('curPitchCode:' + curPitchCode + ' newPitchCode:' + newPitchCode, 'debug');
			codesOut.push(newPitchCode - rootCode)
			pitchesOut.push(sharpFlat(pitchCodeFinder(newPitchCode,false),sharpFlatFlag));
			
		}
		var loopCnt = 0;
		var looper = 0;
		var sortedPitchesOut = [];
		var sortedCodesOut = [];
		while (loopCnt < codesOut.length) {
			for (var index=0;index<100;index++) {
				for (var looper=0;looper<codesOut.length;looper++) {
					if (codesOut[looper]==index) {
						sortedCodesOut.push(codesOut[looper]);
						sortedPitchesOut.push(pitchesOut[looper][0]);
						loopCnt++;
					}
				}
			}
		}
		//var sortedIntervalsArray = [];
		//for (var index=1;index<sortedCodesOut.length;index++) {
		//	sortedIntervalsArray.push(sortedCodesOut[index]-sortedCodesOut[index-1]);
		//}
		//singleLineOutput += multiplier + '\t' + JSON.stringify(Array.from(new Set(sortedPitchesOut))) + '\t' + JSON.stringify(sortedIntervalsArray) + '\t' + JSON.stringify(Array.from(new Set(sortedCodesOut))) + '\n';
		//pitchesOnlyOutput += JSON.stringify(Array.from(new Set(sortedPitchesOut))) + '\t'+ multiplier + '\n';
		//intervalsOnlyOutput += JSON.stringify(sortedIntervalsArray) + '\t'+ multiplier + '\n';
		
		var pitches = {};
		pitches.multiplier = multiplier;
		pitches.array = Array.from(new Set(sortedPitchesOut));
		pitchesArray.push(pitches)
		
	}
	//console.log(singleLineOutput + '\n');
	//console.log(pitchesOnlyOutput + '\n');
	//console.log(intervalsOnlyOutput);
	if (typeof outputType == 'undefined' || outputType == 'retArray') {
		//console.log(JSON.stringify(pitchesArray));
		return pitchesArray;
	}
}

function sharpFlat(pitchCode, sharpOrFlat) {
	if (typeof pitchCode == 'undefined') return;
	var fS = sharpOrFlat;
	var tempPitch;
	var returnPitch = [];
	for (var i=0;i<pitchCode.length;i++) {
		if (sharpOrFlat == '#') {
			tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]#\d/);
			if (tempPitch != null) {
				returnPitch.push(tempPitch);
			}
		} else {
			tempPitch = pitchCode[i].match(/[A|B|C|D|E|F|G]b\d/);
			if (tempPitch != null) {
				returnPitch.push(tempPitch);
			}
		}
	}
	if (returnPitch.length == 0) {
		returnPitch.push(pitchCode);
	}
	log('pitchCode:' + pitchCode + ' sharpOrFlat:' + sharpOrFlat + ' tempPitch:' + tempPitch + ' returnPitch:' + returnPitch + ' returnPitchLength:' + returnPitch.length, 'debug')
	return returnPitch;
}

function pitchCodeFinder(pitch, getCode) {
	log('pitchCodeFinder(pitch:' + pitch + ' getCode:' + getCode,'debug');
	var pitches = pitchChords.pitches
	if (typeof pitch == 'undefined' || pitch.length < 2) return;
	if (typeof getCode == 'undefined' || getCode == true) {
		log('pitchCodeFinder(pitch:' + pitch + ', getCode:' + getCode + ' pitches.length:' + pitches.length,'debug');
		for (var pitchFinderCount=0;pitchFinderCount<pitches.length;pitchFinderCount++) {
			for (i=0;i<pitches[pitchFinderCount].length;i++) {
				if (pitch == pitches[pitchFinderCount][i]) {
					log('   found Pitch Code:' + pitchFinderCount + ' for pitch:' + pitch,'debug');
					return pitchFinderCount;
				}
				for (j=0;j<pitch.length;j++) {
					if (pitch[j] == pitches[pitchFinderCount][i]) {
						log('  found Pitch Code:' + pitchFinderCount + ' for pitch:' + pitch,'debug');
						return pitchFinderCount;
					}
				}
			}
		}
		log('***ERROR Pitch Code NOT FOUND:' + pitch,'error');
		return 0;
	} else {
		if (pitch < pitches.length) {
			log('   found Pitch:' + pitches[pitch] + ' for Code:' + pitch,'debug');
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

function generateAllScales() {
	var keys = [["A3"],["A#3"],["B3"],["C4"],["C#4"],["D4"],["D#4"],["E4"],["F4"],["F#4"],["G4"],["G#4"]];
	//var keys = [["E#4"]];
	var scalesExpanded = [];
	for (var i=0;i<keys.length;i++) {
		scalesExpanded.push(generateScalesForKey(keys[i],'#'));
	}
	//console.log(JSON.stringify(scalesExpanded));
	writeJSON(__dirname + '\\scalesOut.json', scalesExpanded);
}

function generateScalesForKey(keyOf,sharpFlatFlag) {
	var expandedScales = {};
	expandedScales.keys = keyOf.toString().match(/([A-G][\#|b]?)(\d)?/)[1];
	var rootCode = pitchCodeFinder(keyOf[0],true);
	console.log('generateScalesForKey:' + keyOf + ' rootCode:' + rootCode);
	expandedScales.scales = [];
	//get a scale from array
	for (var i=0;i<pitchChords.scales.length;i++) {
		//console.log('-i:' + i);
		var scale = {};
		scale.names = pitchChords.scales[i].scaleNames;
		scale.pitches = [];
		//get a distance
		//console.log('-i:' + i + ' d:' + pitchChords.scales[i].distances.length);
		for (var j=0;j<pitchChords.scales[i].distances.length;j++) {
			//console.log(' -j:' + j + ' d:' + pitchChords.scales[i].distances[j].length);
			var singleScale = [];
			singleScale.push(keyOf.toString().match(/([A-G][\#|b]?)(\d)?/)[1]);
			//get an element of a distance
			for (var k=0;k<pitchChords.scales[i].distances[j].length-1;k++) {
				//console.log('   Distances:' + pitchChords.scales[i].distances[j]);
				//console.log('       i:' + i + ' j:' + j + ' k:' + k + ' ' + (rootCode + pitchChords.scales[i].distances[j][k]));
				var newPitchCode = rootCode + pitchChords.scales[i].distances[j][k]
				var newPitch = sharpFlat(pitchCodeFinder(newPitchCode,false),sharpFlatFlag)[0].toString();
				//console.log('newPitch: '+ newPitch);
				
				newPitch = newPitch.match(/([A-G][\#|b]?)(\d)?/)[1];
				singleScale.push(newPitch);

			}
			scale.pitches.push(singleScale);
			//console.log('scale.pitches:' + JSON.stringify(scale.pitches));
		}
		expandedScales.scales.push(scale);
	}
	return expandedScales;
}
