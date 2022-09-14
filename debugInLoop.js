const { exec } = require('child_process');

setInterval(spawn,5000);

function spawn() {
	exec("C:\\Schilz-composer-assistant\\DebugInLoop.bat", (err, stdout, stderr) => {
	  console.log(stdout);
	  console.error(stderr);
	  if (err) {
		console.error(err);
	  }
	});
}

