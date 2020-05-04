async function checkDeck() { // TODO hier gaat nog iets fout...maar inmiddels beter
	console.log('Inside checkDeck: ',deck.length);
	if (deck.length < 7) {
		console.log('Het worden er te weinig')
		moveCards(discardPile, deck)
		await sleep(2000); // helpt dit bij pile2deck
	}
}

// functie om de Hand aan te vullen met een kaart van deck
function refillHand(objHand) {
	objHand.addCard(deck.topCard());
	objHand.render();
	deck.render();
	countCategories();
}

// functie om een Hand met kaarten te verplaatsten
// hierin in blijkbaar niet voorzien in card.js
function moveCards(from, to) {
	for (let i = 0; i < from.length; i++) {
		to.addCard(from[i]);
		i--; // de from stapel-length wordt steeds kleiner ...
	}
	from.render();
	to.render();
}


// sitepoint sleep function met async ...await
// https://www.sitepoint.com/delay-sleep-pause-wait/
// de functie die een slaapmoment moet hebben wordt vooraf gegaan met async
// zoals de playValidate-function
// in de functie wordt het slaapmoment aangeroepen met await sleep(ms)
// zie de movecards aanroepen
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function cardColor(kaart) { // blijkbaar geen eigenschap van de kaart
	if (kaart.suit === 'd' || kaart.suit === 'h') {
		var color = 'red';
	} else {
		var color = 'black';
	}
	return color;
}

function detEquals() {
	// checks op de topCards van elke speler
	eqRank = false;
	eqSuit = false;
	eqColor = false;
	if (objOtherPlay.length >0) {
		if (objPlay.topCard().rank === objOtherPlay.topCard().rank) {
			eqRank = true;
		}
		if (objPlay.topCard().suit === objOtherPlay.topCard().suit) {
			eqSuit = true;
		}
		if (cardColor(objPlay.topCard()) === cardColor(objOtherPlay.topCard())) {
			eqColor = true;
		}
	}
	console.log('eqRank: ', eqRank); 
	console.log('eqSuit: ', eqSuit);
	console.log('eqColor: ', eqColor);
}

function countCategories() { 
	//TODO Denom wordt verkeerd geteld, maar is volgens mij niet erg...
	// het gaat erom dat ik weet dat ze bestaan...denk ik
	// voor visitorHand
	vFace = 0;
	vCompanion = 0;
	vDenomination= 0;
	for (let i=0; i < visitorHand.length; i++) {
		if (visitorHand[i].rank >= 11) {
			vFace++
		}
		for (let j=0; j < homeHand.length; j++) {
			if (visitorHand[i].rank === homeHand[j].rank && visitorHand[i].rank < 11) {
				vDenomination++
				vColor = cardColor(visitorHand[i]);
				hColor = cardColor(homeHand[j]);
				if (vColor === hColor) {
					vCompanion++;
				}
			}			
		}
	}
	// voor homeHand
	hFace = 0;
	hCompanion = 0;
	hDenomination = 0;
	for (let i=0; i < homeHand.length; i++) {
		if (homeHand[i].rank >= 11) {
			hFace++
		}
		for (let j=0; j < visitorHand.length; j++) {
			if (homeHand[i].rank === visitorHand[j].rank && homeHand[i].rank < 11) {
				hDenomination++
				hColor = cardColor(homeHand[i]);
				vColor = cardColor(visitorHand[j])
				if (hColor === vColor) {
					hCompanion++;
				}
			}			
		}
	}
	console.log('visitorHand: Face: ', vFace,' Denom: ', vDenomination,' Comp: ', vCompanion);
	console.log('   homeHand: Face: ', hFace,' Denom: ', hDenomination,' Comp: ', hCompanion);
}

function moveRunners(play) { // TODO walk = true bij 4-wijd...
	console.log('inside moveRunners');
	console.log('play:', play);
	sendMessage(play);
	// lopers tegelijkertijd en honk-voor-honk laten lopen.
	// bijv voorste loper die twee honken loopt, eerst het eerstvolgende 
	// en alle andere ook het eerstvolgende
	// dan pas het volgende (tweede) honk...
	// elke run meteen scoren => updateScoreboard
	switch (play) {
		case 'homerun':
			numBases = 4;
			moveOnHit(numBases);
			break;
		case 'triple':
			numBases = 3;
			moveOnHit(numBases);
			break;
		case 'double':
			numBases = 2;
			moveOnHit(numBases);
			break;
		case 'single':
			numBases = 1;
			moveOnHit(numBases);
			break;
		case 'walk':
			moveOnWalk();
			break;
		case 'hbp':
			moveOnHBP();
			break;
		default:
			console.log('moveRunners default');
			break;
	}	
	renderRunners();
}

function moveOnHit(bases) {
	for (var b=3; b>=0; b--) {
		if (baseRunners[b] != 0) {
			if (b + bases >= 4) {
				baseRunners[b] = 0;
				if (vAtBat) { //visitor scoort...
					vRun[inning]++;
				} else { // home scoort
					hRun[inning]++;
				}
			} else {
				baseRunners[b] = 0;
				baseRunners[b+ bases] = 1;
			}
		}
	}
}

function moveOnWalk() { //TODO dat loopt nog niet helemaal lekker
	// EIGENLIJK DEZELFDE ALS moveOnHBP ... DUS UNIVERSEEL MAKEN
	// verschillende situaties honken bezetting met case afwerken
	// geeft mogelijkheid van een break en uitslag is uniek
	// variant verzinnen op gedwongen opschuiven of door hit (of deze toch apart afhandelen)
	if (baseRunners[1] == 1) {
		if (baseRunners[2] == 1) {
			if (baseRunners[3] == 1) {
				baseRunners[3] = 0;
				if (vAtBat) { //visitor scoort...
					vRun[inning]++;
				} else { // home scoort
					hRun[inning]++;
				}
				baseRunners[2] = 0;
				baseRunners[3] = 1;
			} 
			baseRunners[2] = 0;
			baseRunners[3] = 1;
		}
		baseRunners[1] = 0;
		baseRunners[2] = 1;
	}
	// baseRunners[0] = 0; laten staan ... anders is er geen AB meer
	baseRunners[1] = 1;
}

function moveOnHBP() {
	console.log('Inside moveOnHBP');
	console.log('Hetzelfde als moveOnWalk');
	moveOnWalk(); // vandaar dat we die gewoon aanroepen
}

function playError() {
	// Error-card in OFFENSE-HAND en toepassen ??
	let hasComp = false;
	for (let i=0; i<objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& cardColor(objOtherHand[i])===cardColor(objPlay.topCard())) {
			hasComp = true;
		}				
	}
	console.log('hasComp= ',hasComp);

	let isError = false;
	if (hasComp == true) {
		if (confirm('Error')) {
			isError = true;
		} else {
			isError = false;
		}
	}
	console.log('isError= ',isError);
}
 

function renderRunners() {
	var topRow = document.getElementById("bases").rows[0].cells
	var bottomRow = document.getElementById("bases").rows[2].cells

	if (baseRunners[3] != 0) {
		bottomRow[0].innerHTML = "3B";
	} else {
		bottomRow[0].innerHTML = "O";
	}

	if (baseRunners[2] != 0) {
		topRow[0].innerHTML = "2B";
	} else {
		topRow[0].innerHTML = "O";
	}

	if (baseRunners[1] != 0) {
		topRow[2].innerHTML = "1B";
	} else {
		topRow[2].innerHTML = "O";
	}

	if (baseRunners[0] != 0) {
		bottomRow[2].innerHTML ="AB";
	} else {
		bottomRow[2].innerHTML = "O";
	}
}



function updateScoreboard() { // een-op-een van solitaire overgenomen
	// update inning in cell rij 3 kolom 2
	var inn = document.getElementById("scoreboard").rows[3].cells;
	inn[2].innerHTML = inning;
	// update balls in cell rij 3 kolom 5
	var ball = document.getElementById("scoreboard").rows[3].cells;
	ball[5].innerHTML = numBalls;
	// update strikes in cell rij 3 kolom 8
	var strike = document.getElementById("scoreboard").rows[3].cells;
	strike[8].innerHTML = numStrikes;
	// update outs in cell rij 3 kolom 11
	var out = document.getElementById("scoreboard").rows[3].cells;
	out[11].innerHTML = numOuts;

	var vTotalRun = 0;
	var hTotalRun = 0;
	// update VISITOR score
	for (i = 1; i < vRun.length; i++) { //starten bij index 1)
		var vRunBoard = document.getElementById("scoreboard").rows[1].cells;
		vRunBoard[inning].innerHTML = vRun[i];
		vTotalRun = vTotalRun + vRun[i];
		vRunBoard[11].innerHTML = vTotalRun;
	}
	// update hits in cell rij 1 kolom 12
	var vHit = document.getElementById("scoreboard").rows[1].cells;
	vHit[12].innerHTML = vHits;
	// update errors in cell rij 1 kolom 13
	var vError = document.getElementById("scoreboard").rows[1].cells;
	vError[13].innerHTML = vErrors;

	// update HOME score
	for (i = 1; i < hRun.length; i++) { // starten bij index 1)
		var hRunBoard = document.getElementById("scoreboard").rows[2].cells;
		hRunBoard[inning].innerHTML = hRun[i];
		hTotalRun = hTotalRun + hRun[i];
		hRunBoard[11].innerHTML = hTotalRun;
	}
	// update hits in cell rij 2 kolom 12
	var hHit = document.getElementById("scoreboard").rows[2].cells;
	hHit[12].innerHTML = hHits;
	// update errors in cell rij 2 kolom 13
	var hError = document.getElementById("scoreboard").rows[2].cells;
	hError[13].innerHTML = hErrors;
}


async function sendMessage(message) {
	document.getElementById("messageboard").innerHTML = message;
	//await sleep(2000);
	//document.getElementById("messageboard").innerHTML = ""; // leegmaken op ander moment
}

function gameOver() {
	console.log('GAME OVER');
}