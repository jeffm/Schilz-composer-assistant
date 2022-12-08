var fs = require('fs');
var Book;
var projectPath;
var projectPathWindows;
Book = 1

//var section = 'Chapter_3';
//var section = 'Chapter_4';
//var section = 'Chapter_5_Con';
//var section = 'Chapter_5_Exp';
//var section = 'Chapter_7';
//var section = 'Chapter_7';

//projectPath = 'C:/Schilz-composer-assistant/Projects/Book 1 Theory of Rhythm/' + section + '/';
//projectPathWindows = 'C:\\\\Schilz-composer-assistant\\\\Projects\\\\Book 1 Theory of Rhythm\\\\' + section + '\\\\';

//Book 3

Book = 3
var section = 'Chapter_1';
projectPath = 'C:/Schilz-composer-assistant/Projects/Book 3 Geometrical Projections/' + section + '/';
projectPathWindows = 'C:\\\\Schilz-composer-assistant\\\\Projects\\\\Book 3 Geometrical Projections\\\\' + section + '\\\\';

//Book 5




var rhythms;
	
var batText = '';
var museOutText = '';
if (Book == 1) {
	if (section != 'Chapter_7') {
		try {
			rhythms = openInputFile('c:/Schilz-composer-assistant/Projects/ExampleBuilder/' + section + ' projectList.json');
		} catch(err) {
			console.log(err);
			return;
		}
			console.log('Opened:' + (rhythms.length-1) + ' projects to create');
			//console.log(JSON.stringify(rhythms));
	}
	if (section == 'Chapter_7') {
		batText = build_1_7_ControlFile(projectPath,projectPathWindows);
	} else {
		for (var m=0;m<rhythms.length;m++) {
			batText += build_1_ControlFile(rhythms[m],projectPath,projectPathWindows);
		}
	}
} else if (Book == 3) {
	if (section == 'Chapter_1') {
		batText = build_3_1_ControlFile(projectPath,projectPathWindows);
	}
}

writeBAT('c:/Schilz-composer-assistant/Projects/ExampleBuilder/' + section + 'buildProjectList.bat', batText);

function ensureExists(path, mask) {
    return fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') return true; // Ignore the error if the folder already exists
            else return false; // Something else went wrong
        } else return true
    });
}

function build_3_1_ControlFile(projectPath,projectPathWindows) {
	
	console.log('\n\n\nProject:' + projectPath + '\n\n\n');
	project = 'Projection';
		
	var jsonoutput;
	var useMidiTrack;
	jsonoutput = 
	{
		"name": 'to be replaced',
		"copyright": "Copyright 2022 Jeffrey D. Mershon",
		"timeSignature": "4/4",
		"averageVelocity": 50,
		"tracks": [
			{
				"name": "Projection 1",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C3"],["D3"],["E3"],["F3"],["G3"],["A3"],["B3"]],
				"pitchMultiplier": 1,
				"keyOf": "C Major",
				"pitchRoot": "C3",
			},
			{
				"name": "Projection -1",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C4"],["D4"],["E4"],["F4"],["G4"],["A4"],["B4"]],
				"pitchMultiplier": -1,
				"keyOf": "C Major",
				"pitchRoot": "C4",
			},
			{
				"name": "Projection 2",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C3"],["D3"],["E3"],["F3"],["G3"],["A3"],["B3"]],
				"pitchMultiplier": 2,
				"keyOf": "C Major",
				"pitchRoot": "C3",
			},
			{
				"name": "Projection -2",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C5"],["D5"],["E5"],["F5"],["G5"],["A5"],["B5"]],
				"pitchMultiplier": -2,
				"keyOf": "C Major",
				"pitchRoot": "C5",
			},
			{
				"name": "Projection 3",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C3"],["D3"],["E3"],["F3"],["G3"],["A3"],["B3"]],
				"pitchMultiplier": 3,
				"keyOf": "C Major",
				"pitchRoot": "C3",
			},
			{
				"name": "Projection -3",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C6"],["D6"],["E6"],["F6"],["G6"],["A6"],["B6"]],
				"pitchMultiplier": -3,
				"keyOf": "C Major",
				"pitchRoot": "C6",
			},
			{
				"name": "Projection 4",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C3"],["D3"],["E3"],["F3"],["G3"],["A3"],["B3"]],
				"pitchMultiplier": 4,
				"keyOf": "C Major",
				"pitchRoot": "C3",
			},
			{
				"name": "Projection -4",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C7"],["D7"],["E7"],["F7"],["G7"],["A7"],["B7"]],
				"pitchMultiplier": -4,
				"keyOf": "C Major",
				"pitchRoot": "C7",
			},
			{
				"name": "Projection 5",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C3"],["D3"],["E3"],["F3"],["G3"],["A3"],["B3"]],
				"pitchMultiplier": 5,
				"keyOf": "C Major",
				"pitchRoot": "C3",
			},
			{
				"name": "Projection -5",
				"type": "beat",
				"period": 1,
				"endAt": 7,
				"pitches": [["C8"],["D8"],["E8"],["F8"],["G8"],["A8"],["B8"]],
				"pitchMultiplier": -5,
				"keyOf": "C Major",
				"pitchRoot": "C8",
			},
			{
				"name": "Projections 1 - 5 Positive and Negative",
				"type": "concatenate",
				"sources": [
					{
						"source": 0,
						"addText": "Projection 1"
					},
					{
						"source": 1,
						"addText": "Projection -1"
					},
					{
						"source": 2,
						"addText": "Projection 2"
					},
					{
						"source": 3,
						"addText": "Projection -2"
					},
					{
						"source": 4,
						"addText": "Projection 3"
					},
					{
						"source": 5,
						"addText": "Projection -3"
					},
					{
						"source": 6,
						"addText": "Projection 4"
					},
					{
						"source": 7,
						"addText": "Projection -4"
					},
					{
						"source": 8,
						"addText": "Projection 5"
					},
					{
						"source": 9,
						"addText": "Projection -5"
					}
				]
			},
			{
				"name": "Projections 1 - 5 Positive and Negative Min-Max",
				"type": "concatenate",
				"sources": [
					{
						"source": 0,
						"addText": "Projection 1 - refit"
					},
					{
						"source": 1,
						"addText": "Projection -1 - refit"
					},
					{
						"source": 2,
						"addText": "Projection 2 - refit"
					},
					{
						"source": 3,
						"addText": "Projection -2 - refit"
					},
					{
						"source": 4,
						"addText": "Projection 3 - refit"
					},
					{
						"source": 5,
						"addText": "Projection -3 - refit"
					},
					{
						"source": 6,
						"addText": "Projection 4 - refit"
					},
					{
						"source": 7,
						"addText": "Projection -4 - refit"
					},
					{
						"source": 8,
						"addText": "Projection 5 - refit"
					},
					{
						"source": 9,
						"addText": "Projection -5 - refit"
					}
				],
				"pitchMultiplier": 1,
				"refitToMinPitch": "C4",
				"refitToMaxPitch": "C5",
				"pitchRoot" : "C2"
			},
			{
				"name": "Projections 1 - 5 Positive and Negative Min-Max",
				"type": "concatenate",
				"sources": [
					{
						"source": 10
					},
					{
						"source": 11
					}
				],
				"midiChannel": 0,
				"beatUnit": 4,
				"tempo":90
			}
		]
	}
	//refitToMinPitch
	//refitToMaxPitch
	useMidiTrack = 2;
	var returnString = '';
	//var projections = [1,-1,2,-2,3,-3,4,-4,5,-5,7,-7,7,-7,8,-8,9,-9,10,-10,11,-11,12,-12]
	//for (var i=0;i<projections.length;i++) {
		//console.log(JSON.stringify(jsonoutput,null,4));
		jsonoutput.tempo = 80;
		jsonoutput.name = project;
		//jsonoutput.tracks[0].pitchMultiplier = projections[i];
		var dir = ensureExists(projectPath + jsonoutput.name, 0o744);
		returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + jsonoutput.name + '\\\\\" -i \"' + jsonoutput.name + '_input.json\" -m \"' + jsonoutput.name + '.mid\"' + ' -j \"' + jsonoutput.name + '.json\"' + ' -c \"' + jsonoutput.name + '.html\"' + ' -v info\n';
		writeJSON(projectPath + jsonoutput.name + '/' + jsonoutput.name + '_input.json', jsonoutput);

		returnString += doubleToSingleSlash('del \"' + projectPathWindows + jsonoutput.name + '\\\\' + jsonoutput.name + '_input.json\"' + '\n');
	//}
	return returnString;
}
function build_1_7_ControlFile(projectPath,projectPathWindows) {

	console.log('\n\n\nProject:' + projectPath + '\n\n\n');
	//var dir = ensureExists(projectPath + project, 0o744);	
	var jsonoutput = [
		{
			"name": "Split and Auto-Create Target Tracks Using useNoteCount",
			"copyright": "Copyright 2022 Jeffrey D. Mershon",
			"timeSignature": "4/4",
			"averageVelocity":50,
			"tracks": [
				{
					"type": "beat",
					"period": 3,
					"endAt": 12
				},{
					"type": "beat",
					"period": 2,
					"endAt": 12
				},{
					"type": "rhythm",
					"sources": [
						{
							"source": 0
						},
						{
							"source": 1
						}
					],
					"pitches": [["C4"],["E4"]]
				},{
					"type": "split",
					"source": 2,
					"createTargets":2,
					"useNoteCount":true
				}
			]
		},
		{
			"name": "Split to Existing Target Tracks Using useNoteCount",
			"copyright": "Copyright 2022 Jeffrey D. Mershon",
			"timeSignature": "4/4",
			"averageVelocity":50,
			"tracks": [
				{
					"type": "beat",
					"period": 3,
					"endAt": 12
				},{
					"type": "beat",
					"period": 2,
					"endAt": 12
				},{
					"type": "rhythm",
					"sources": [
						{
							"source": 0
						},
						{
							"source": 1
						}
					],
					"pitches": [["C4"],["E4"]]
				},{
					"type": "split",
					"source": 2,
					"targets":[4,5],
					"useNoteCount":true
				},
				{
					"type": "none"
				},{
					"type": "none"
				}
			]
		},
		{
			"name": "Split and Auto-Create Target Tracks Using useNoteDurationFrom",
			"copyright": "Copyright 2022 Jeffrey D. Mershon",
			"timeSignature": "4/4",
			"averageVelocity":50,
			"tracks": [
				{
					"type": "beat",
					"period": 3,
					"endAt": 12
				},{
					"type": "beat",
					"period": 2,
					"endAt": 12
				},{
					"type": "rhythm",
					"sources": [
						{
							"source": 0
						},
						{
							"source": 1
						}
					],
					"pitches": [["C4"],["E4"]]
				},{
					"type": "split",
					"source": 2,
					"createTargets":3,
					"useNoteDurationFrom":2
				}
			]
		},
		{
			"name": "Split and Auto-Create 3 Target Tracks Using targetCounts",
			"copyright": "Copyright 2022 Jeffrey D. Mershon",
			"timeSignature": "4/4",
			"averageVelocity":50,
			"tracks": [
				{
					"type": "beat",
					"period": 3,
					"endAt": 12
				},{
					"type": "beat",
					"period": 2,
					"endAt": 12
				},{
					"type": "rhythm",
					"sources": [
						{
							"source": 0
						},
						{
							"source": 1
						}
					],
					"pitches": [["C4"],["E4"]]
				},{
					"type": "split",
					"source": 2,
					"createTargets":3,
					"targetCounts":[2,3,1]
				}
			]
		}
	]

	var returnString = '';
	for (var i=0;i<jsonoutput.length;i++) {
		//console.log(JSON.stringify(jsonoutput,null,4));

		jsonoutput[i].tempo = 80;
		returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + '\" -i \"' + jsonoutput[i].name  + '_' + jsonoutput[i].tempo + '_input.json\" -m \"' + jsonoutput[i].name  + '_' + jsonoutput[i].tempo + '.mid\"' + ' -j \"' + jsonoutput[i].name  + '_' + jsonoutput[i].tempo + '.json\"' + ' -c \"' + jsonoutput[i].name  + '_' + jsonoutput[i].tempo + '.html\"' + '\n';
		writeJSON(projectPath + jsonoutput[i].name  + '_' + jsonoutput[i].tempo + '_input.json', jsonoutput[i]);
		returnString += doubleToSingleSlash('del \"' + projectPathWindows + jsonoutput[i].name + '_' + jsonoutput[i].tempo + '_input.json\"' + '\n');
	}
	return returnString;
}


function build_1_ControlFile(control,projectPath,projectPathWindows) {
	var project = control.period1.toString() + '_' + control.period2.toString() + '_' + control.beatUnit + '_' + control.timeSignature.replace('/','-');
	console.log('\n\n\nProject:' + projectPath + project + '\n\n\n');
	var dir = ensureExists(projectPath + project, 0o744);
	var periods = [];
	periods.push(control.period1);
	periods.push(control.period2);
	periods.push(control.period3);
	var LCM = computePolyLCM(periods);
	var jsonoutput;
	var useMidiTrack;
	if ( section == 'Chapter_3') {
	//Use for chapter 3
		jsonoutput = {
		"name": project,
		"copyright": "Copyright 2022 Jeffrey D. Mershon",
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
				"midiChannel": 0,
				"computeLCM": true,
				"beatUnit":control.beatUnit,
				"pitches": [["C4"],["E4"]],
				"tempo":90
			}
		]
	};
	useMidiTrack = 2;
	} else if ( section == 'Chapter_4') {
	
	//Use for chapter 4
	var jsonoutput = {
	"name": project,
	"copyright": "Copyright 2022 Jeffrey D. Mershon",
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
			"midiChannel": 0,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"pitches": [["C4"],["E4"]],
			"tempo":90
		}
		]
	};
	useMidiTrack = 3;
	} else if ( section == 'Chapter_5_Con') { 

//Use for 5_Con
	var jsonoutput = {
	"name": project,
	"copyright": "Copyright 2022 Jeffrey D. Mershon",
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
			"name": "beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"endAt": (control.period1 * control.period2)
		},{
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": (control.period1 * control.period2)
		},{
			"name": "Fractional interference rhythm combining " + control.period1.toString() + ' and ' + control.period2.toString(),
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
            ]
		},{
			"name": "Interference rhythm combining " + control.period1 + " and " + control.period2,
			"type": "rhythm",
			"sources": [
                {
                    "source": 3
                },
                {
                    "source": 4
                }
            ],
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"tempo":90
		},{
			"name": "Interference rhythm appending tracks 5 and 7",
			"type": "concatenate",
			"sources": [
                {
                    "source": 5
                },
                {
                    "source": 7
                }
            ],
			"midiChannel": 0,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"pitches": [["C4"],["E4"]],
			"tempo":90
		}
		]
	};
	useMidiTrack = 7;
	} else if ( section == 'Chapter_5_Exp') { 

	//Use for 5_Exp
	var jsonoutput = {
	"name": project,
	"copyright": "Copyright 2022 Jeffrey D. Mershon",
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
			"name": "beat of " + control.period1.toString(),
			"type": "beat",
			"period": control.period1,
			"endAt": (control.period1 * control.period2)
		},{
			"name": "beat of " + control.period2.toString(),
			"type": "beat",
			"period": control.period2,
			"endAt": (control.period1 * control.period2)
		},{
			"name": "Fractional interference rhythm combining " + control.period1.toString() + ' and ' + control.period2.toString(),
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
            ]
		},{
			"name": "Interference rhythm combining " + control.period1 + " and " + control.period2,
			"type": "rhythm",
			"sources": [
                {
                    "source": 3
                },
                {
                    "source": 4
                }
            ],
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"tempo":90
		},{
			"name": "Interference rhythm appending tracks 7 and 5",
			"type": "concatenate",
			"sources": [
                {
                    "source": 7
                },
                {
                    "source": 5
                }
            ],
			"midiChannel": 0,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"pitches": [["C4"],["E4"]],
			"tempo":90
		}
		]
	};
	useMidiTrack = 7;
	} else if ( section == 'Chapter_7') { 	
	//Use for chapter 7
	var jsonoutput = {
	"name": project,
	"copyright": "Copyright 2022 Jeffrey D. Mershon",
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
			"midiChannel": 0,
			"computeLCM": true,
			"beatUnit":control.beatUnit,
			"pitches": [["C4"],["E4"]],
			"tempo":90
		}
		]
	};
	useMidiTrack = 3
}
	var returnString = '';
	//console.log(JSON.stringify(jsonoutput,null,4));

	jsonoutput.tracks[useMidiTrack].tempo = 80;
	returnString += 'node ' + '\"c:\\Schilz-composer-assistant\\schilz.js\" -g -p \"' +  projectPathWindows + project + '\\\\\" -i \"' + project  + '_' + jsonoutput.tracks[useMidiTrack].tempo + '_input.json\" -m \"' + project  + '_' + jsonoutput.tracks[useMidiTrack].tempo + '.mid\"' + ' -j \"' + project  + '_' + jsonoutput.tracks[useMidiTrack].tempo + '.json\"' + ' -c \"' + project  + '_' +  jsonoutput.tracks[useMidiTrack].tempo + '.html\"' + '\n';
	writeJSON(projectPath + project + '/' + project  + '_' + jsonoutput.tracks[useMidiTrack].tempo + '_input.json', jsonoutput);
	returnString += doubleToSingleSlash('del \"' + projectPathWindows + project  + '\\\\' + project + '_' + jsonoutput.tracks[useMidiTrack].tempo + '_input.json\"' + '\n');

	return returnString;
}

function doubleToSingleSlash(aString) {
	return aString.replaceAll('\\\\','\\');
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