function createScoreBoard(maxScoreInnings) {
	console.log('[createScoreBoard]');
	let tbody = '';

    tbody += '<table id="scoreboard">\n'
    // row 0
    tbody += '<tr>\n<th></th>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<th>' + i + '</th>'
    }
    tbody += '<th>X</th><th>R</th><th>H</th><th>E</th><th>||</th><th>I:</th><th>0</th>\n';
    tbody += '</tr>\n';
    // row 1
    tbody += '<tr>\n<td>VISIT</td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>B:</td><td>0</td>\n'
    // row 2
    tbody += '<tr>\n<td>HOME</td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>S:</td><td>0</td>\n'
    // row 3
    tbody += '<tr>\n<td>AB #</td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>O:</td><td>0</td>\n'

    tbody += '</tr>\n</table>'
    document.getElementById('varTable').innerHTML = tbody;
} // einde createScoreBoard

/**
 * Display the current atBatStatus at current player
 * @param {*} atBatStatus 
 */
function displayStatus (atBatStatus) {
	console.log('[displayStatus]', atBatStatus);
	if (turnHome) {
		$("#home").css("background-color", "red");
		$("#home").val(atBatStatus);
		$("#visitor").css("background-color", "green");
		$("#visitor").val("");
	} else {
		$("#visitor").css("background-color", "red");
		$("#visitor").val(atBatStatus);
		$("#home").css("background-color", "green");
		$("#home").val("");
	}
	updateHelp(atBatStatus);
}

/**
 * Testen aantal FaceCards tbv NewBall
 * in ObjHand ( de huidige OFFENSE)
 * @param {*} hand 
 */
function checkNumFaceCards(hand) { // misschien moet dit toon NB-knop worden
	console.log('[checkNumFaceCards]');
	checkFaceCardsFlag = false;

	let numFaceCards = 0
	for (let i = 0; i < hand.length; i++) {
		if (hand[i].faceCard) {
			numFaceCards++
		}
	}

	if (numFaceCards >= 2) {
		vAtBat ? $('#hNB').show() : $('#vNB').show();
	} else {
		vAtBat ? $('#hNB').hide() : $('#vNB').hide();		
	}
} // end checkNumFaceCards

/**
 * iets met de Reliever....
 */
function checkReliever() {
	checkRelieverFlag = false;
	console.log('[checkReliever]');
	vAtBat ? $('#hRP').show() : $('vRP').show();
}

/**
 * uitkomst checkOption op scherm tonen
 * @param {*} option 
 */
function sendOption(option) {
	document.getElementById("option").innerHTML = option;
}

/**
 * op basis van de atBatStatus bepalen welke Help-tekst moet worden getoond
 * @param {*} status 
 */
function updateHelp(status) {
	let helpText = ''
	switch (status) {
		case ('pitch') :
			helpText = '@pitch' + '&#013' + '&#013';
			helpText = helpText + ' # 1 - 10 => swing' + '&#013'
			helpText = helpText + ' face card => BALL' + '&#013'
			break;
		case ('swing') :
			helpText = '@swing' + '&#013' + '&#013';
			helpText = helpText + ' same suit:' + '&#013'
			helpText = helpText + ' > pitch => connect' + '&#013'
			helpText = helpText + ' < pitch => BALL' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' face card => FOUL' + '&#013'
			helpText = helpText + ' companion #9,#10 => HBP' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' other => STRIKE' + '&#013'
			break;
		case ('connect') :
			helpText = '@connect' + '&#013' + '&#013';
			helpText = helpText + ' connect - fielding' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' same suit  : x1' + '&#013'
			helpText = helpText + ' same color : x2' + '&#013'
			helpText = helpText + ' other color: x3' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' 0 - 2 => OUT' + '&#013'
			helpText = helpText + ' 3 - 4 => Single' + '&#013'
			helpText = helpText + ' 5 - 6 => Double' + '&#013'
			helpText = helpText + ' 7 - 8 => Triple' + '&#013'
			helpText = helpText + ' 0 - 2 => Home Run' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' face card => SAC' + '&#013'
			helpText = helpText + ' #9, #10 => Long Fly' + '&#013'
			break;
		case ('fielding'):
			helpText = '@fielding' + '&#013' + '&#013';
			helpText = helpText + ' connect - fielding' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' same suit  : x1' + '&#013'
			helpText = helpText + ' same color : x2' + '&#013'
			helpText = helpText + ' other color: x3' + '&#013'
			helpText = helpText + '&#013'
			helpText = helpText + ' 0 - 2 => OUT' + '&#013'
			helpText = helpText + ' 3 - 4 => Single' + '&#013'
			helpText = helpText + ' 5 - 6 => Double' + '&#013'
			helpText = helpText + ' 7 - 8 => Triple' + '&#013'
			helpText = helpText + ' 9 -  => Home Run' + '&#013'
			break;
		case ('newball') :
			helpText = '@newball';
			break;
		case ('SAC') :
			helpText = '@SAC';
			break;
		default:
			helpText = '@default';
			break;
	}

	document.getElementById("help").innerHTML = helpText;
} // einde updateHelp

/**
 * verversen van de gegevens op het scoreboard
 */
function updateScoreboard() { 
	console.log('[updateScoreboard]');
	// update inning in cell rij 0 kolom maxInnings + 7
	var inn = document.getElementById("scoreboard").rows[0].cells;
	inn[parseInt(maxInnings) + 7 ].innerHTML = inning;
	// update balls in cell rij 1 kolom maxInnings + 7
	var ball = document.getElementById("scoreboard").rows[1].cells;
	ball[parseInt(maxInnings) + 7 ].innerHTML = numBalls;
	// update strikes in cell rij 2 kolom maxInnings + 7
	var strike = document.getElementById("scoreboard").rows[2].cells;
	strike[parseInt(maxInnings) + 7 ].innerHTML = numStrikes;
	// update outs in cell rij 3 kolom maxInnings + 7
	var out = document.getElementById("scoreboard").rows[3].cells;
	out[parseInt(maxInnings) + 7 ].innerHTML = numOuts;

	var vTotalRun = 0;
	var hTotalRun = 0;
	// update VISITOR score in rij 1
	for (i = 1; i < vRun.length; i++) { //starten bij index 1)
		var vRunBoard = document.getElementById("scoreboard").rows[1].cells;
		vRunBoard[i].innerHTML = vRun[i];
		vTotalRun = vTotalRun + vRun[i];
		// rij 1 kolom maxInnings + 2
		vRunBoard[parseInt(maxInnings) + 2 ].innerHTML = vTotalRun;
	}
	// update hits in cell rij 1 kolom maxInnings + 3
	var vHit = document.getElementById("scoreboard").rows[1].cells;
	vHit[parseInt(maxInnings) + 3 ].innerHTML = vHits;
	// update errors in cell rij 1 kolom maxInnings + 4
	var vError = document.getElementById("scoreboard").rows[1].cells;
	vError[parseInt(maxInnings) + 4 ].innerHTML = vErrors;

	// update HOME score in rij 2
	for (i = 1; i < hRun.length; i++) { // starten bij index 1)
		var hRunBoard = document.getElementById("scoreboard").rows[2].cells;
		hRunBoard[i].innerHTML = hRun[i];
		hTotalRun = hTotalRun + hRun[i];
		// rij 2 kolom maxInnings + 2
		hRunBoard[parseInt(maxInnings) + 2].innerHTML = hTotalRun;
	}
	// update hits in cell rij 2 kolom maxInnings + 3
	var hHit = document.getElementById("scoreboard").rows[2].cells;
	hHit[parseInt(maxInnings) + 3 ].innerHTML = hHits;
	// update errors in cell rij 2 kolom maxInnings + 4
	var hError = document.getElementById("scoreboard").rows[2].cells;
	hError[parseInt(maxInnings) + 4 ].innerHTML = hErrors;

	// current batter
	if (vAtBat) {
		var currAB = document.getElementById("scoreboard").rows[3].cells;
		currAB[1].innerHTML = currentVisitorBatter;
	} else {
		var currAB = document.getElementById("scoreboard").rows[3].cells;
		currAB[1].innerHTML = currentHomeBatter;
	}
}

/**
 * Plaatsen van een message op het messagebord
 * @param {*} message 
 */
function sendMessage(message) {
	document.getElementById("messageboard").innerHTML = message;
}


/**
 * Renderen van de honklopers
 */
function renderRunners() {
	console.log('[renderRunner] renderRunners', baseRunners)
	var topRow = document.getElementById("bases").rows[0].cells
	var bottomRow = document.getElementById("bases").rows[4].cells

	if (baseRunners[3] != 0) {
		bottomRow[0].innerHTML = baseRunners[3];
	} else {
		bottomRow[0].innerHTML = "O";
	}

	if (baseRunners[2] != 0) {
		topRow[0].innerHTML = baseRunners[2];
	} else {
		topRow[0].innerHTML = "O";
	}

	if (baseRunners[1] != 0) {
		topRow[5].innerHTML = baseRunners[1];
	} else {
		topRow[5].innerHTML = "O";
	}

	if (baseRunners[0] != 0) {
		bottomRow[5].innerHTML = vAtBat ? vBatter[currentVisitorBatter] : hBatter[currentHomeBatter];
	} else {
		bottomRow[5].innerHTML = "O";
	} 
} //einde renderRunners
