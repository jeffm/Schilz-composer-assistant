var fs = require('fs');

//var rhythms = openInputFile('c:/Schilz-composer-assistant/Projects/ExampleBuilder/Figure 24 projectList.json');
var rhythms = openInputFile('c:/Schilz-composer-assistant/Projects/ExampleBuilder/Chapter_6 projectList.json');
var batText = '';
var museOutText = '';
for (var m=0;m<rhythms.length;m++) {
	batText += buildControlFile(rhythms[m]);
	museOutText += buildMuseFile(rhythms[m]);
}

writeBAT('c:/Schilz-composer-assistant/Projects/ExampleBuilder/Chapter_6buildProjectList.bat', batText);
writeMuse('c:/Schilz-composer-assistant/Projects/ExampleBuilder/Chapter_6museTasks.bat',museOutText);

function ensureExists(path, mask) {
    return fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') return true; // Ignore the error if the folder already exists
            else return false; // Something else went wrong
        } else return true
    });
}

function buildMuseFile(control) {
	var museBin = "\"c:\\Program Files\\MuseScore 3\\bin\\MuseScore3.exe\" -o ";
	var projectPath = 'C:/Schilz-composer-assistant/Projects/Book 1 Theory of Rhythm/Chapter_6/';
	projectPathWindows = 'C:\\\\Schilz-composer-assistant\\\\Projects\\\\Book 1 Theory of Rhythm\\\\Chapter_6\\\\';
	//var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.period3.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	var root = '\"' + projectPath + project + '/';
	museString = museBin + root + project +  '_40.mscz' + '\" ' + root + project +  '_40.mid\"\n';
	museString += museBin +  root + project +  '_40.mxl' + '\" ' + root + project +  '_40.mscz\"\n';
	museString += museBin +  root + project +  '_40.mp3' + '\" ' + root + project +  '_40.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_40.pdf' + '\" ' + root + project +  '_40.mscz\"\n';
/*
	museString += museBin + root + project +  '_40_Fract.mscz' + '\" ' + root + project +  '_40_Fract.mid\"\n';
	museString += museBin +  root + project +  '_40_Fract.mxl' + '\" ' + root + project +  '_40_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_40_Fract.mp3' + '\" ' + root + project +  '_40_Fract.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_40_Fract.pdf' + '\" ' + root + project +  '_40_Fract.mscz\"\n';
	*/
	museString += museBin + root + project +  '_80.mscz' + '\" ' + root + project +  '_80.mid\"\n';
	museString += museBin +  root + project +  '_80.mxl' + '\" ' + root + project +  '_80.mscz\"\n';
	museString += museBin +  root + project +  '_80.mp3' + '\" ' + root + project +  '_80.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_80.pdf' + '\" ' + root + project +  '_80.mscz\"\n';
	/*
	museString += museBin + root + project +  '_80_Fract.mscz' + '\" ' + root + project +  '_80_Fract.mid\"\n';
	museString += museBin +  root + project +  '_80_Fract.mxl' + '\" ' + root + project +  '_80_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_80_Fract.mp3' + '\" ' + root + project +  '_80_Fract.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_80_Fract.pdf' + '\" ' + root + project +  '_80_Fract.mscz\"\n';
	*/
	museString += museBin + root + project +  '_120.mscz' + '\" ' + root + project +  '_120.mid\"\n';
	museString += museBin +  root + project +  '_120.mxl' + '\" ' + root + project +  '_120.mscz\"\n';
	museString += museBin +  root + project +  '_120.mp3' + '\" ' + root + project +  '_120.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_120.pdf' + '\" ' + root + project +  '_120.mscz\"\n';
	/*
	museString += museBin + root + project +  '_120_Fract.mscz' + '\" ' + root + project +  '_120_Fract.mid\"\n';
	museString += museBin +  root + project +  '_120_Fract.mxl' + '\" ' + root + project +  '_120_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_120_Fract.mp3' + '\" ' + root + project +  '_120_Fract.mscz\" -b \"64\" \n';
	museString += museBin +  root + project +  '_120_Fract.pdf' + '\" ' + root + project +  '_120_Fract.mscz\"\n';
	*/
	return museString;
}

function buildControlFile(control) {
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.period3.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	var projectPath = 'C:/Schilz-composer-assistant/Projects/Book 1 Theory of Rhythm/Chapter_6/';
	projectPathWindows = 'C:\\\\Schilz-composer-assistant\\\\Projects\\\\Book 1 Theory of Rhythm\\\\Chapter_6\\\\';
	console.log(project);
	var dir = ensureExists(projectPath + project, 0o744);
	var periods = [];
	periods.push(control.period1);
	periods.push(control.period2);
	periods.push(control.period3);
	var LCM = computePolyLCM(periods);
	/*
	var fractjsonout = {
	"name": project,
	"timeSignature": control.timeSignature,
	"averageVelocity":50,
	"tracks": [
		{
			"name": "beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"endAt": (control.period1 * control.period2) + control.period1
		},{
			"name": "Fractional beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": control.period1 * control.period2
		},{
			"name": "Fractional beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": control.period1 * control.period2,
			"offsetFrom":0,
			"offsetAmount": 1
		},{
			"name": "Interference rhythm combining " + control.period1.toString() + ' and ' + control.period2.toString(),
			"type": "rhythm",
			"sources": [
                {
                    "source": 0
                },
                {
                    "source": 1
                },
                {
                    "source": 2
                }
            ],
			"includeInScore": true,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"defaultPitch": "C4",
			"tempo":90
		}
		]
	};

	var jsonoutput = {
	"name": project,
	"timeSignature": control.timeSignature,
	"averageVelocity":50,
	"tracks": [
		{
			"name": "Beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"endAt": control.period1 * control.period2
		},{
			"id":1,
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": control.period1 * control.period2
		},{
			"id":2,
			"name": "Interference rhythm combining " + control.period1.toString() + ' and ' + control.period2.toString(),
			"type": "rhythm",
			"sources": [
                {
                    "source": 0
                },
                {
                    "source": 1
                }
            ],
			"includeInScore": true,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"defaultPitch": "C4",
			"tempo":90
		}
		]
	};
	*/
	var jsonoutput = {
	"name": project,
	"timeSignature": control.timeSignature,
	"averageVelocity":50,
	"tracks": [
		{
			"name": "Beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"endAt": LCM
		},{
			"id":1,
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": LCM
		},{
			"id":2,
			"name": "beat of " + control.period3.toString(),
			"type": "beat",
			"period": control.period3,
			"endAt": LCM
		},{
			"id":3,
			"name": "Interference rhythm combining " + control.period1.toString() + ', ' + control.period2.toString() + ' and ' + control.period3.toString(),
			"type": "rhythm",
			"sources": [
                {
                    "source": 0
                },
                {
                    "source": 1
                },
                {
                    "source": 2
                }
            ],
			"includeInScore": true,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"defaultPitch": "C4",
			"tempo":90
		}
		]
	};
	var returnString = '';
	//console.log(JSON.stringify(jsonoutput,null,4));
	jsonoutput.tracks[3].tempo = 40;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[3].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[3].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json', jsonoutput);
	//fract version
	/*
	fractjsonout.tracks[2].tempo = 40;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json\' -j \'' + project + '_' + fractjsonout.tracks[2].tempo + '_Fract_output.json\' -m \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract.mid\' -c \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json', fractjsonout);
	//console.log(jsonoutput.tracks[2].tempo + ' ' + jsonoutput.tracks[2].beatUnit);
	*/
	jsonoutput.tracks[3].tempo = 80;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[3].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[3].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json', jsonoutput);
	/*
	//fract version
	fractjsonout.tracks[2].tempo = 80;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json\' -j \'' + project + '_' + fractjsonout.tracks[2].tempo + '_Fract_output.json\' -m \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract.mid\' -c \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json', fractjsonout);
	*/
	jsonoutput.tracks[3].tempo = 120;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[3].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[3].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[3].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[3].tempo + '_input.json', jsonoutput);
	/*
	//fract version
	fractjsonout.tracks[2].tempo = 120;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json\' -j \'' + project + '_' + fractjsonout.tracks[2].tempo + '_Fract_output.json\' -m \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract.mid\' -c \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json', fractjsonout);
	*/
	return returnString;
}


function openInputFile (inpath) {
	if (inpath != '') {
		console.log('Opening input file:' + inpath);
		try {
			return JSON.parse(fs.readFileSync(inpath, 'utf8'));
		} catch (err) {
		   console.error(err);
		   return null;
		}
	}
}

function writeJSON(JSONoutpath, jsonoutput) {
	console.log('JSONoutpath:' + JSONoutpath);
	if (typeof JSONoutpath != 'undefined' && JSONoutpath != '') {
		try {
			var outFile = fs.openSync(JSONoutpath,'w');
			fs.writeSync(outFile,JSON.stringify(jsonoutput,null,4));
		} catch (err) {
		   console.error(err);
		}
	}
}

function writeBAT(BAToutpath, BAToutput) {
	console.log('BAToutpath:' + BAToutpath);
	if (typeof BAToutpath != 'undefined' && BAToutpath != '') {
		try {
			var outFile = fs.openSync(BAToutpath,'w');
			fs.writeSync(outFile,BAToutput);
		} catch (err) {
		   console.error(err);
		}
	}
}

function writeMuse(museOutPath, museText) {
	console.log('museOutPath:' + museOutPath);
	if (typeof museOutPath != 'undefined' && museOutPath != '') {
		try {
			var outFile = fs.openSync(museOutPath,'w');
			fs.writeSync(outFile,museText);
		} catch (err) {
		   console.error(err);
		}
	}
}

function computePolyLCM(periods) {
	console.log('computePolyLCM(trackToBuild)');
	//if (typeof rhythms.tracks[trackToBuild].sources == 'undefined') return;
	var pairs = [];
	var pairLCM = [];
	var LCMs = [];
	//console.log('sources length:' + rhythms.tracks[trackToBuild].sources.length,'debug');
	//we need to compute the LCM of each pair within a list of sources.
	//first--figure out the pairs.
	for (var increment=1;increment<periods.length;increment++) {
		for (var source=0;source<periods.length;source++) {
			if ((source + increment) < periods.length) {
				var temp = [];
					//console.log('period:' + rhythms.tracks[source].period);
				temp.push(periods[source]);
				temp.push(periods[source+increment]);
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
	return pairLCM[0];
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

function computeLCM(n1, n2) {
	var hcf = 1;
	for (var i = 1; i <= n1 && i <= n2; i++) {
			if( n1 % i == 0 && n2 % i == 0) {
			hcf = i;
			}
		}
		return (n1 * n2) / hcf
}