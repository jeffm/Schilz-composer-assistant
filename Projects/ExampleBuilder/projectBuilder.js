var fs = require('fs');

var rhythms = openInputFile('c:/rhythmGenerator/projectList.json');

var batText = '';
var museOutText = '';
for (var m=0;m<rhythms.length;m++) {
	batText += buildControlFile(rhythms[m]);
	museOutText += buildMuseFile(rhythms[m]);
}

//writeBAT('c:/rhythmGenerator/Projects/buildProjectList.bat', batText);
writeMuse('c:/rhythmGenerator/Projects/museTasks.bat',museOutText);

//buildControlFile(rhythms[0]);

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
	
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	var root = 'z:/Projects/' + project + '/';
	museString = museBin + root + project +  '_40.mscz' + ' ' + root + project +  '_40.mid\n';
	museString += museBin +  root + project +  '_40.mxl' + ' ' + root + project +  '_40.mscz\n';
	museString += museBin +  root + project +  '_40.mp3' + ' ' + root + project +  '_40.mscz\n';
	museString += museBin +  root + project +  '_40.pdf' + ' ' + root + project +  '_40.mscz\n';

	museString += museBin + root + project +  '_80.mscz' + ' ' + root + project +  '_80.mid\n';
	museString += museBin +  root + project +  '_80.mxl' + ' ' + root + project +  '_80.mscz\n';
	museString += museBin +  root + project +  '_80.mp3' + ' ' + root + project +  '_80.mscz\n';
	museString += museBin +  root + project +  '_80.pdf' + ' ' + root + project +  '_80.mscz\n';
	
	museString += museBin + root + project +  '_120.mscz' + ' ' + root + project +  '_120.mid\n';
	museString += museBin +  root + project +  '_120.mxl' + ' ' + root + project +  '_120.mscz\n';
	museString += museBin +  root + project +  '_120.mp3' + ' ' + root + project +  '_120.mscz\n';
	museString += museBin +  root + project +  '_120.pdf' + ' ' + root + project +  '_120.mscz\n';
	return museString;
}

function buildControlFile(control) {
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	console.log(project);
	var dir = ensureExists('c:/rhythmGenerator/Projects/' + project, 0o744);
	
	var fractjsonout = {
	"name": project,
	"timeSignature": control.timeSignature,
	"averageVelocity":50,
	"tracks": [
		{
			"id":0,
			"name": "beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"toIndex": (control.period1 * control.period2) + control.period1,
			"result": [],
			"info": []
		},{
			"id":1,
			"name": "Fractional beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"toIndex": control.period1 * control.period2,
			"result": [],
			"info": []
		},{
			"id":2,
			"name": "Fractional beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"toIndex": control.period1 * control.period2,
			"offsetFrom":0,
			"offsetAmount": 1,
			"result": [],
			"info": []
		},{
			"id":3,
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
			"tempo":90,
			"result": [],
			"info":[]
		}
		]
	};
	
	var jsonoutput = {
	"name": project,
	"timeSignature": control.timeSignature,
	"averageVelocity":50,
	"tracks": [
		{
			"id":0,
			"name": "Beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"toIndex": control.period1 * control.period2,
			"result": [],
			"info": []
		},{
			"id":1,
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"toIndex": control.period1 * control.period2,
			"result": [],
			"info": []
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
			"tempo":90,
			"result": [],
			"info":[]
		}
		]
	};
	var returnString = '';
	//console.log(JSON.stringify(jsonoutput,null,4));
	jsonoutput.periodicities[2].tempo = 40;
	returnString += 'node ' + '\"c:\\rhythmGenerator\\generateSchillingerRhythm.js\" -g -p \'' +  'C:\\rhythmGenerator\\Projects\\' + project + '\\\' -i \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.periodicities[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_chart.html\'' + '\n';
	//console.log(jsonoutput.periodicities[2].tempo + ' ' + jsonoutput.periodicities[2].beatUnit);
	writeJSON('c:/rhythmGenerator/Projects/' + project + '/' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json', jsonoutput);
	jsonoutput.periodicities[2].tempo = 80;
	returnString += 'node ' + '\"c:\\rhythmGenerator\\generateSchillingerRhythm.js\" -g -p \'' +  'C:\\rhythmGenerator\\Projects\\' + project + '\\\' -i \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.periodicities[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_chart.html\'' + '\n';
	//console.log(jsonoutput.periodicities.tempo + ' ' + jsonoutput.periodicities.beatUnit);
	writeJSON('c:/rhythmGenerator/Projects/' + project + '/' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json', jsonoutput);
	jsonoutput.periodicities[2].tempo = 120;
	returnString += 'node ' + '\"c:\\rhythmGenerator\\generateSchillingerRhythm.js\" -g -p \'' +  'C:\\rhythmGenerator\\Projects\\' + project + '\\\' -i \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json\' -j \'' + project + '_' + jsonoutput.periodicities[2].tempo + '_output.json\' -m \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '.mid\' -c \'' + project  + '_' + jsonoutput.periodicities[2].tempo + '_chart.html\'' + '\n';
	//console.log(jsonoutput.periodicities.tempo + ' ' + jsonoutput.periodicities.beatUnit);
	writeJSON('c:/rhythmGenerator/Projects/' + project + '/' + project  + '_' + jsonoutput.periodicities[2].tempo + '_input.json', jsonoutput);
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