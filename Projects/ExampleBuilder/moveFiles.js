const fs = require("fs");
const path = require("path");

var rootFolder = 'C:/Schilz-composer-assistant/Projects/Book 1 Theory of Rhythm/Chapter_3';
var targetFolder = 'C:/Schilz-composer-assistant/Projects/Book 1 Theory of Rhythm/Chapter_4';

let files = [];

const getFilesRecursively = (directory) => {
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
		console.log('directory!:' + absolute)
		var newDir = absolute.replace('Chapter_3','Chapter_4');
		var dir = ensureExists(newDir, 0o744)
        getFilesRecursively(absolute);
    } else {
		if (file.indexOf("_Fract") > -1) {
			files.push(absolute);
		}
    }
  }
};

getFilesRecursively(rootFolder);
//console.log(JSON.stringify(files,null,4));

for (var i=0;i<files.length;i++) {
	var oldPath = files[i];
	var newPath = oldPath.replace('Chapter_3','Chapter_4');
	newPath = newPath.replace('_Fract','');
	
	try {
		//console.log('Ready to rename:' + oldPath + ' to ' + newPath);
		fs.renameSync(oldPath, newPath);
	} catch (err) {
		console.log('Could not rename:' + oldPath);
	}
}

function ensureExists(path, mask) {
    return fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') return true; // Ignore the error if the folder already exists
            else return false; // Something else went wrong
        } else return true
    });
}