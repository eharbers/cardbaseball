/**
 * Deck controleren op het aantal kaarten
 */
async function checkDeck() { // TODO hier gaat nog iets fout...maar inmiddels beter
	console.log('Inside checkDeck: ', deck.length);
	if (deck.length < 7) {
		console.log('Het worden er te weinig')
		moveCards(discardPile, deck)
		await sleep(2000); // helpt dit bij pile2deck
	}
}

/**
 * functie om de Hand aan te vullen met een kaart van deck
 * @param {*} objHand 
 */
function refillHand(objHand) {
	objHand.addCard(deck.topCard());
	objHand.render();
	deck.render();
	countCategories();
}

/**
 * functie om een Hand met kaarten te verplaatsten.
 * hierin in blijkbaar niet voorzien in card.js
 * @param {*} from 
 * @param {*} to 
 */
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
/**
 * Sleep-functie voorafgegaan door async-functie
 * @param {*} ms 
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * kleur van de kaart bepalen
 * @param {*} kaart 
 */
function cardColor(kaart) { // blijkbaar geen eigenschap van de kaart
	if (kaart.suit === 'd' || kaart.suit === 'h') {
		var color = 'red';
	} else {
		var color = 'black';
	}
	return color;
}

/**
 * checks op de topCards van elke speler
 * voor beslisboom
 */
function detEquals() {
	eqRank = false;
	eqSuit = false;
	eqColor = false;
	if (objOtherPlay.length > 0) {
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

/**
 * checks op de topCards van elke speler
 * voor beslisboom van checkOptions
 * @param {*} hand 
 */
function detOptionEquals(hand) {
	// checks op de topCards van elke speler
	eqRank = false;
	eqSuit = false;
	eqColor = false;
	if (objOtherPlay.length > 0) {
		if (hand.rank === objOtherPlay.topCard().rank) {
			eqRank = true;
		}
		if (hand.suit === objOtherPlay.topCard().suit) {
			eqSuit = true;
		}
		if (cardColor(hand) === cardColor(objOtherPlay.topCard())) {
			eqColor = true;
		}
	}
}

/**
 * Tellen van categorien
 * Face, COmpanion en Denomination
 */
function countCategories() {
	//TODO Denom wordt verkeerd geteld, maar is volgens mij niet erg...
	// het gaat erom dat ik weet dat ze bestaan...denk ik
	// voor visitorHand
	vFace = 0;
	vCompanion = 0;
	vDenomination = 0;
	for (let i = 0; i < visitorHand.length; i++) {
		if (visitorHand[i].rank >= 11) {
			vFace++
		}
		for (let j = 0; j < homeHand.length; j++) {
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
	for (let i = 0; i < homeHand.length; i++) {
		if (homeHand[i].rank >= 11) {
			hFace++
		}
		for (let j = 0; j < visitorHand.length; j++) {
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
	console.log('visitorHand: Face: ', vFace, ' Denom: ', vDenomination, ' Comp: ', vCompanion);
	console.log('   homeHand: Face: ', hFace, ' Denom: ', hDenomination, ' Comp: ', hCompanion);
}

/**
 * Bepalen van type resultaat en hoeveelheid honken
 * obv resultaat play
 * @param {*} play 
 */
function moveRunners(play) { // TODO walk = true bij 4-wijd...
	console.log('inside moveRunners');
	console.log('play:', play);
	//sendMessage(play); // uitgezet vanwege overschrijven playValidate-result

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
		case 'sacDP':
			break;
		case 'sacBORA':
			break;
		case 'sacBSRA':
			break;
		default:
			console.log('moveRunners default');
			break;
	}
	renderRunners();
}

/**
 * Verplaatsen honklopers
 * obv aantal honken uit honkslag
 * @param {*} bases 
 */
function moveOnHit(bases) {
	for (var b = 3; b >= 0; b--) {
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
				baseRunners[b + bases] = 1;
			}
		}
	}
}

/**
 * Verplaatsen honklopes
 * obv WALK
 */
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

/**
 * verplaatsen honklopers
 * obv HBP (als WALK)
 */
function moveOnHBP() {
	console.log('Inside moveOnHBP');
	console.log('Hetzelfde als moveOnWalk');
	moveOnWalk(); // vandaar dat we die gewoon aanroepen
}

/**
 * Bepalen obv OFFENSE-hand of ERROR gespeeld kan worden
 * en uitvoering
 */
function playError() {
	// Error-card in OFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& cardColor(objOtherHand[i]) === cardColor(objPlay.topCard())) {
			hasComp = true;
			compCard = i;
		}
	}
	console.log('hasComp= ', hasComp);

	if (hasComp == true) {
		if (confirm('Error')) {
			isError = true;
			vAtBat ? hErrors++ : vErrors++; // error counter op scoreboard
			objOtherPlay.addCard(objOtherHand[compCard]);
			objOtherHand.render();
			objOtherPlay.render();
		} else {
			isError = false;
		}
	}
	console.log('isError= ', isError);
}

/**
 * Bepalen obv DEFENSE-hand of FOUL-catch kan worden toegepast
 * en uitvoering
 */
function playCatchFoul() {
	// CacthFoul-card in DEFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& cardColor(objOtherHand[i]) === cardColor(objPlay.topCard())) {
			hasComp = true;
			compCard = i;
		}
	}
	console.log('hasComp= ', hasComp);

	if (hasComp == true) {
		if (confirm('Catch Foul')) {
			isCatchFoul = true;
			objOtherPlay.addCard(objOtherHand[compCard]);
			objOtherHand.render();
			objOtherPlay.render();

			moveCards(objPlay, discardPile); // cleanup playing hands !!
			moveCards(objOtherPlay, discardPile); // en die andere ook
			//refillHand(objOtherHand);
			//refillHand(objHand);

			// BATTER = OUT!
			console.log('FOUL caught - OUT');
			sendMessage('FOUL caught - OUT');
			numStrikes = 0;
			numBalls = 0;
			numOuts++

			// checkInning toepassen
			checkInning();
			atBatStatus = 'pitch'; // new pitch
		} else {
			isCatchFoul = false;
		}
	}
	console.log('isCatchFoul= ', isCatchFoul);
}

/**
 * Renederen van de honklopers
 */
function renderRunners() {
	var topRow = document.getElementById("bases").rows[0].cells
	var bottomRow = document.getElementById("bases").rows[4].cells

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
		topRow[4].innerHTML = "1B";
	} else {
		topRow[4].innerHTML = "O";
	}

	if (baseRunners[0] != 0) {
		bottomRow[4].innerHTML = "AB";
	} else {
		bottomRow[4].innerHTML = "O";
	}
}



/**
 * Display the current atBatStatus at current player
 * @param {*} atBatStatus 
 */
function displayStatus (atBatStatus) {
	if (turnHome) {
		$("#home").val(atBatStatus);
	} else {
		$("#visitor").val(atBatStatus);
	}
} 


/**
 * verversen van de gegevens op het scoreboard
 */
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

/**
 * Plaatsen van een message op het messagebord
 * @param {*} message 
 */
async function sendMessage(message) {
	document.getElementById("messageboard").innerHTML = message;
	//await sleep(2000);
	//document.getElementById("messageboard").innerHTML = ""; // leegmaken op ander moment
}

/**
 * functie om het resultaat van elke kaart in hand te geven, zou deze gespeeld worden
 * @param {*} hand 
 */
function checkOptions(hand) {
	let outcome = '';
	let option = '';
	let rating = [];
	checkOptionsFlag = false; // vlag om te voorkomen dat het steeds in playCard wordt uitgevoerd
	// maar die zal ook weer ergens aangezet moeten worden...

	// voor de huidige status en speler de kaarten langslopen
	// dezelfde controles uitvoeren op de kaart
	// en het resultaat bepalen

	console.log('checkOptions voor status = ', atBatStatus);
	for (let i = 0; i < hand.length; i++) {
		detOptionEquals(hand[i]); // ook hier uitvoeren voor elke kaart. nodig voor beslisboom
		let indComp ='';
		//let rating = []; /// hier stond ie eerst / nu boven loop 

		switch (atBatStatus) {
			case 'pitch':
				if (hand[i].rank >= 11) {
					outcome = 'BALL';
					rating[i] = 1;
				} else {
					outcome = '?swing?';
					rating[i] = 2;
				}
				break;
			case 'swing':
				if (hand[i].rank >= 11) {
					if (numStrikes < 2) {
						outcome = 'FOUL - STRIKE';
						rating[i] = 1; // facecard bewaren ipv number-card??
						break;
					} else {
						outcome = '2-strike FOUL';
						rating[i] = 3;
						break;
					}
				} else if (!eqSuit) {
					if ((objOtherPlay.topCard().rank >= 9) && (eqRank === true) && (eqColor === true)) {
						outcome = 'HBP';
						rating[i] = 5;
						break;
					} else {
						outcome = 'STRIKE';
						rating[i] = 2; // number-card eerder dan facecard S<2 ??
						break;
					}
				} else if (hand[i].rank < objOtherPlay.topCard().rank) {
					outcome = 'BALL';
					rating[i] = 4;
					break;
				} else {
					outcome = '?connect?';
					rating[i] = 6;
					break;
				}
			case 'connect':
				if (hand[i].rank >= 11) {
					outcome = 'SAC';
					rating[i] = 1;
					break;
				} else {
					outcome = '?fielding?';
					rating[i] = 2;
					break;
				}
			case 'fielding':
				outcome = '';
				let optionResult = Math.abs(hand[i].rank - objOtherPlay.topCard().rank);
				if (objOtherPlay.topCard().rank >= 11) { // connect = SAC
					if (hand[i].rank >= 11) {
						if (eqSuit) {
							outcome = 'SAC DOUBLE PLAY';
							rating[i] = 3;
							break;
						} else {
							outcome = 'SAC B:out R:adv';
							rating[i] = 2;
							break;
						}
					} else {
						outcome = 'SAC B:safe R:adv';
						rating[i] = 1;
						break;
					}
				} else if (hand[i].rank >= 11) { // connect is #1-10						
					outcome = 'HOMERUN';
					rating[i] = 1;
					break;
				} else {
					// berekening van eindresultaat obv biede #1-10 kaarten
					outcome = ': ' + outcome + optionResult;
					if (eqSuit) { // dezelfde suit
						optionResult = optionResult * 1;
						outcome = outcome + ' * 1 = ' + optionResult // + ' <=> eqSuit';
					} else if (eqColor) { // dezelfde kleur
						optionResult = optionResult * 2;
						outcome = outcome + ' * 2 = ' + optionResult // + ' <=> eqColor';
					} else {
						optionResult = optionResult * 3; // andere kleur
						outcome = outcome + ' * 3 = ' + optionResult  //+ ' <=> NOT eqSuit or eqColor';
					}

					switch (true) {
						case (optionResult > 9):
							outcome = 'HOMERUN' + outcome;
							rating[i] = 1;
							break;
						case (optionResult > 7):
							outcome = 'TRIPLE' + outcome;
							rating[i] = 2;
							break;
						case (optionResult > 5):
							outcome = 'DOUBLE' + outcome;
							rating[i] = 3;
							break;
						case (optionResult > 3):
							outcome = 'SINGLE' + outcome;
							rating[i] = 4;
							break;
						case (optionResult >= 0):
							outcome = 'OUT' + outcome;
							rating[i] = 5;
							break;
						default:
							outcome = '#NA#';
							rating[i] = 0;
							break;
					}
				}
				break;
			default:
				outcome = '#NA#';
				rating[i] = 0;
				break;
		} // end switch atBatStatus

		if (objOtherPlay.length > 0) {
			if ((hand[i].rank == objOtherPlay.topCard().rank) 
				&& (hand[i].suit != objOtherPlay.topCard().suit)
				&& (cardColor(hand[i]) == cardColor(objOtherPlay.topCard())) ) {
					indComp = '[comp]';
				}
			}
		
		// add a symbol based on the suit
		let symbol ='';
		switch (hand[i].suit) {
			case 'd' :
				symbol = '&diams;'
				break;
			case 'h':
				symbol = '&hearts;';
				break;
			case 's':
				symbol = '&spades;';
				break;
			case 'c':
				symbol = '&clubs;';
				break;
			default:
				break;
		}

		// replace facecards #11-13 and Ace with letter
		let symbolRank = '';
		switch (hand[i].rank) {
			case 1:
				symbolRank = symbol +'A';
				break;
			case 11:
				symbolRank = symbol + 'J';
				break;
			case 12:
				symbolRank = symbol + 'Q';
				break;
			case 13:
				symbolRank = symbol + 'K';
				break;
			default:
				symbolRank = symbol + hand[i].rank;
				break;
		}
		//option = option + ' ' + hand[i].shortName + ' ' + indComp + ' => ' + outcome + '&#013';
		option = option + ' ' + symbolRank + ' ' + indComp + ' => (' + rating[i] + ') ' + outcome + '&#013';
		sendOption(option);
		// let tipCard = hand[i];
		// let tip = outcome;
		// fillToolTip(tipCard, tip);
	}
	if (playAI && turnVisitor) {
		console.log('playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor);
		let maxRating = 0;
		let maxRatingId = 0;
		for (let i = 0; i < hand.length; i++) {
			console.log(i + ': ' + rating[i] + ' => ' + hand[i])
			if (rating[i] > maxRating) {
				maxRating = rating[i];
				maxRatingId = i;
			}
		}		
		console.log('maxRating = ', maxRating);
		console.log('maxRatingId = ', maxRatingId);
		playerAI(hand[maxRatingId]);
	}
} // end checkOptions


async function playerAI(aiCard){
	let thinking = 0;
	thinking = 1000 + Math.random() * 2000
	await sleep(thinking);
	objPlay.addCard(aiCard);
	objPlay.render();
	objHand.render();
	deck.render();
	playValidate();
}


/**
 * Vullen van tooltip obv kaart in hand
 * @param {*} tipCard 
 * @param {*} tip 
 */
function fillToolTip(tipCard, tip) {
	// het idee is om obv hover the outcome te tonen
	// het vinden van de kaart in de html is het probleem
	// met css-property background-position zou dat mogeljk kunnen
	// te berekenen obv rij en kolom en afm card 69x94

	console.log('Inside fillToolTip');

	switch (tipCard.suit) {
		case 'c':
			console.log('clubs');
			break;
		case 'h':
			console.log('hearts');
			break;
		case 'd':
			console.log('diamonds');
			break;
		case 's':
			console.log('spades');
			break;
		default:
			console.log('#NA#');
			break;
	}
}


/**
 * Testen aantal FaceCards tbv NewBall
 * 
 * @param {*} hand 
 */
function checkNumFaceCards(hand) { // misschien moet dit toon NB-knop worden
	checkFaceCardsFlag = false;
	console.log('check op #FaceCards');

	let numFaceCards = 0
	for (let i = 0; i < hand.length; i++) {
		if (hand[i].rank >= 11) {
			numFaceCards++
		}
	}

	if (numFaceCards >= 2) {
		console.log('numFaceCards = ', numFaceCards);
		vAtBat ? $('#hNB').show() : $('#vNB').show();
	} else {
		vAtBat ? $('#hNB').hide() : $('#vNB').hide();
	}
} // end checkNumFaceCards

function checkReliever() {
	checkRelieverFlag = false;
	console.log('check Reliever');
	vAtBat ? $('#hRP').show() : $('vRP').show();
}



/**
 * uitkomst checkOption op scherm tonen
 * @param {*} option 
 */
async function sendOption(option) {
	document.getElementById("option").innerHTML = option;
	//await sleep(2000);
	//document.getElementById("messageboard").innerHTML = ""; // leegmaken op ander moment
}

/**
 * EINDE WEDSTRIJD
 */
function gameOver() {
	console.log('GAME OVER');
}