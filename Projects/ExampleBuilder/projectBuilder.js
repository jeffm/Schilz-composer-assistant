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
	museString += museBin +  root + project +  '_40.mp3' + '\" ' + root + project +  '_40.mscz\"\n';
	museString += museBin +  root + project +  '_40.pdf' + '\" ' + root + project +  '_40.mscz\"\n';
/*
	museString += museBin + root + project +  '_40_Fract.mscz' + '\" ' + root + project +  '_40_Fract.mid\"\n';
	museString += museBin +  root + project +  '_40_Fract.mxl' + '\" ' + root + project +  '_40_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_40_Fract.mp3' + '\" ' + root + project +  '_40_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_40_Fract.pdf' + '\" ' + root + project +  '_40_Fract.mscz\"\n';
	*/
	museString += museBin + root + project +  '_80.mscz' + '\" ' + root + project +  '_80.mid\"\n';
	museString += museBin +  root + project +  '_80.mxl' + '\" ' + root + project +  '_80.mscz\"\n';
	museString += museBin +  root + project +  '_80.mp3' + '\" ' + root + project +  '_80.mscz\"\n';
	museString += museBin +  root + project +  '_80.pdf' + '\" ' + root + project +  '_80.mscz\"\n';
	/*
	museString += museBin + root + project +  '_80_Fract.mscz' + '\" ' + root + project +  '_80_Fract.mid\"\n';
	museString += museBin +  root + project +  '_80_Fract.mxl' + '\" ' + root + project +  '_80_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_80_Fract.mp3' + '\" ' + root + project +  '_80_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_80_Fract.pdf' + '\" ' + root + project +  '_80_Fract.mscz\"\n';
	*/
	museString += museBin + root + project +  '_120.mscz' + '\" ' + root + project +  '_120.mid\"\n';
	museString += museBin +  root + project +  '_120.mxl' + '\" ' + root + project +  '_120.mscz\"\n';
	museString += museBin +  root + project +  '_120.mp3' + '\" ' + root + project +  '_120.mscz\"\n';
	museString += museBin +  root + project +  '_120.pdf' + '\" ' + root + project +  '_120.mscz\"\n';
	/*
	museString += museBin + root + project +  '_120_Fract.mscz' + '\" ' + root + project +  '_120_Fract.mid\"\n';
	museString += museBin +  root + project +  '_120_Fract.mxl' + '\" ' + root + project +  '_120_Fract.mscz\"\n';
	museString += museBin +  root + project +  '_120_Fract.mp3' + '\" ' + root + project +  '_120_Fract.mscz\"\n';
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
			"endAt": control.period1 * control.period2
		},{
			"id":1,
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": control.period1 * control.period2
		},{
			"id":2,
			"name": "beat of " + control.period3.toString(),
			"type": "beat",
			"period": control.period3,
			"endAt": control.period1 * control.period3
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
	jsonoutput.tracks[2].tempo = 40;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json', jsonoutput);
	//fract version
	/*
	fractjsonout.tracks[2].tempo = 40;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json\' -j \'' + project + '_' + fractjsonout.tracks[2].tempo + '_Fract_output.json\' -m \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract.mid\' -c \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json', fractjsonout);
	//console.log(jsonoutput.tracks[2].tempo + ' ' + jsonoutput.tracks[2].beatUnit);
	*/
	jsonoutput.tracks[2].tempo = 80;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json', jsonoutput);
	/*
	//fract version
	fractjsonout.tracks[2].tempo = 80;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json\' -j \'' + project + '_' + fractjsonout.tracks[2].tempo + '_Fract_output.json\' -m \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract.mid\' -c \'' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + fractjsonout.tracks[2].tempo + '_Fract_input.json', fractjsonout);
	*/
	jsonoutput.tracks[2].tempo = 120;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.tracks[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.tracks[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.tracks[2].tempo + '_chart.html\'' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[2].tempo + '_input.json', jsonoutput);
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