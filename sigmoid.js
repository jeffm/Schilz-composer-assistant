//sigmoid function
var resultJSON;
var stepSize = 5;
var startValue = 0;
var endValue = 57;
var startIndex = 0
var endIndex = 1250;
var bend = -0.02
//bend=100 -> straight line
//bend=.001 - .1 -> exponential curve with increasing flatness
//bend<1 ->curve is ~ same as positive version, but rotated around the horizontal axis (i.e. backwards).
var shape = "exponential"; //exponential, sigmoid, hump


if (shape=="exponential") {
	if (bend<0) {
		bend = bend-1;
	}
	var forward;
	if (startValue > endValue) {
		min = endValue;
		max = startValue;
		forward = false; 
	} else {
		max = endValue;
		min = startValue;
		forward = true;
	}

	resultJSON = exponential(bend,min,max,startIndex,endIndex,stepSize);
	if (!forward) {
		resultJSON = reverseSig(resultJSON);
	}
} else if (shape == "sigmoid") {
	if (bend<0) {
		bend = bend-1;
	}
	var forward;
	if (startValue > endValue) {
		min = endValue;
		max = startValue;
		forward = false; 
	} else {
		max = endValue;
		min = startValue;
		forward = true;
	}

	var ccString = "";
	var valDiff = max-min;
	var cut = Math.round(valDiff/2);
	var halfMax = max-cut;
	var idxDiff = endIndex-startIndex;
	var halfIDX = Math.round(idxDiff/2);
	var resultJSON;

	resultJSON = exponential(bend,min,halfMax,startIndex,halfIDX,stepSize);

	var resultJSONSize = resultJSON.length;
	var halfWaySig = resultJSON[resultJSON.length-1].sig;
	//console.log(halfWaySig + ' ' + halfIDX);
	if (resultJSON[resultJSON.length-1].index < halfIDX) {
		resultJSON.push({"sig": halfWaySig, "index":halfIDX});
	}
	for (var i=resultJSONSize-2;i>=0;i--) {
		var newEvent = {}
		newEvent.index = halfIDX + (halfIDX-resultJSON[i].index);
		newEvent.sig = max - resultJSON[i].sig;
		//console.log('newEventSig:' + halfWaySig + ' ' + resultJSON[i].sig);
		resultJSON.push(newEvent);
	}
	if (!forward) {
		resultJSON = reverseSig(resultJSON);
	}
} else if (shape == "hump") {
	if (bend<0) {
		bend = bend-1;
	}
	var forward;
	if (startValue > endValue) {
		min = endValue;
		max = startValue;
		forward = false; 
	} else {
		max = endValue;
		min = startValue;
		forward = true;
	}
	console.log('forward:' + forward);
	var valDiff = max-min;
	var cut = Math.round(valDiff/2);
	var halfMax = max-cut;
	var idxDiff = endIndex-startIndex;
	var halfIDX = Math.round(idxDiff/2);
	resultJSON = exponential(bend,min,max,startIndex,halfIDX,stepSize);
	if (!forward) {
		console.log('hump backwards!');
		resultJSON = reverseSig(resultJSON);
	}
	var resultJSONSize = resultJSON.length;
	var halfWaySig = resultJSON[resultJSON.length-1].sig;
	//console.log(halfWaySig + ' ' + halfIDX);
	if (resultJSON[resultJSON.length-1].index < halfIDX) {
		resultJSON.push({"sig": halfWaySig, "index":halfIDX});
	}
	for (var i=resultJSONSize-2;i>=0;i--) {
		var newEvent = {}
		newEvent.index = halfIDX + (halfIDX-resultJSON[i].index);
		newEvent.sig = resultJSON[i].sig;
		//console.log('newEventSig:' + halfWaySig + ' ' + resultJSON[i].sig);
		resultJSON.push(newEvent);
	}

}

console.log(JSON.stringify(resultJSON));
var ccString = "";
for (var i=0;i<resultJSON.length;i++) {
	ccString += ";" + resultJSON[i].sig;
}
console.log(ccString);

function exponential(bend,min,max,startIndex,endIndex, stepSize) {
	console.log('exponential:' + bend + '\t' + min + '\t' + max + '\t' + startIndex + '\t' + endIndex + '\t' + stepSize);
	var cc = [];
	var oldSig = -999;
	var curIndex = startIndex;
	var steps = (max-min)
	var indexIncrement = (endIndex-startIndex)/steps;
	var t=min;
	for (var i=0;i<=steps;i++) {
		var sig = Math.round(((bend*t) / (bend-t+1))*max);
		console.log("i:" + i + "\tt:" + t + "\tsig:" + sig + "\toldSig:" + oldSig + "\tcurIndex:" + curIndex + "\tmax:" + max);
		if (sig-oldSig >= stepSize) {
			cc.push({"sig":sig, "index": Math.round(curIndex)});
			oldSig = sig;
		}
		t+=1/steps;
		curIndex+=indexIncrement
	}
	return cc;
}

function reverseSig(anArray) {
	var newArray = [];
	reverseIndex = anArray.length-1;
	for (i=0;i<anArray.length;i++) {
		newArray.push({"index":anArray[i].index,"sig":anArray[reverseIndex].sig});
		reverseIndex--;
	}
	return newArray;
}
