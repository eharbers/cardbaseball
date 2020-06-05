/**
 * functie om properties aan kaarten toe te voegen,
 * waar cards.js niet in voorziet
 */
function addCardProperties() {
	for (card of deck) {
		switch (card.suit) {
			case 'd':
				card.color = 'red';
				card.symbol = '&diams;';
				break;
			case 'h':
				card.color = 'red';
				card.symbol = '&hearts;'
				break;
			case 's':
				card.color = 'black';
				card.symbol = '&spades;';
				break;
			case 'c':
				card.color = 'black';
				card.symbol = '&clubs;';
				break;
			default:
				break;
		}

		switch (card.rank) {
			case 1:
				card.letter ='A';
				card.faceCard = false;
				break;
			case 11:
				card.letter = 'J';
				card.faceCard = true;
				break;
			case 12:
				card.letter = 'Q';
				card.faceCard = true;
				break;
			case 13:
				card.letter = 'K';
				card.faceCard = true;
				break;
			default:
				card.faceCard = false;
				card.letter= card.rank;
				break;
		}
	}
} // einde addCardProperties

function createScoreBoard(maxScoreInnings) {
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
    tbody += '<tr>\n<td>V</td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>B:</td><td>0</td>\n'
    // row 2
    tbody += '<tr>\n<td>H</td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>S:</td><td>0</td>\n'
    // row 3
    tbody += '<tr>\n<td></td>';
    for (let i=1; i <= maxScoreInnings; i++) {
        tbody += '<td></td>';
    }
    tbody += '</td><td></td><td></td><td></td><td></td><td>||</td><td>O:</td><td>0</td>\n'

    tbody += '</tr>\n</table>'
    document.getElementById('varTable').innerHTML = tbody;
}

/**
 * Deck controleren op het aantal kaarten
 */
function checkDeck() { // TODO hier gaat nog iets fout...maar inmiddels beter
	if (deck.length < 7) {
		console.log('Het worden er te weinig')
		moveCards(discardPile, deck);
		console.log('Shuffle deck');
		shuffle(deck);
	}
}

/**
 * shuffle van het deck kaarten
 * eigenlijk een kopie van die in cards.js
 * waarom die niet aan te roepen is, is me niet duidelijk...
 * @param {*} deck 
 */
function shuffle(deck) {
	//Fisher yates shuffle
	var i = deck.length;
	if (i == 0) return;
	while (--i) {
		var j = Math.floor(Math.random() * (i + 1));
		var tempi = deck[i];
		var tempj = deck[j];
		deck[i] = tempj;
		deck[j] = tempi;
	}
	deck.render();
}


function countCards() {
	console.log('==> atBatStatus: ', atBatStatus);
	console.log('==> vAtBat: ' + vAtBat + ' | hAtBat: ' + hAtBat);
	console.log('==> turnVisitor: ' + turnVisitor + ' | turnHome: ' + turnHome);
	console.log('==> objHand: ' + objHand.length + ' | objPlay: ' + objPlay.length);
	console.log('==> objOtherHand: ' + objOtherHand.length + ' | objOtherPlay: ' + objOtherPlay.length);
}

function cleanRefill() {
	if (objPlay.length > 0) {
		moveCards(objPlay, discardPile);
	}
	if (objOtherPlay.length > 0 ) {
		moveCards(objOtherPlay, discardPile);
	}
	while (objHand.length != 6 ) {
		refillHand(objHand);
	}
	while (objOtherHand.length != 6 ) {
		refillHand(objOtherHand);
	}

}

/**
 * functie om de Hand aan te vullen met een kaart van deck
 * @param {*} fillHand 
 */
function refillHand(fillHand) {
	fillHand.addCard(deck.topCard());
	fillHand.render();
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
	to.render();
	from.render();	
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
		if (objPlay.topCard().color === objOtherPlay.topCard().color) {
			eqColor = true;
		}
	}
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
		if (hand.color === objOtherPlay.topCard().color) {
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
		if (visitorHand[i].faceCard) {
			vFace++
		}
		for (let j = 0; j < homeHand.length; j++) {
			if (visitorHand[i].rank === homeHand[j].rank && !visitorHand[i].faceCard) {
				vDenomination++
				vColor = visitorHand[i].color;
				hColor = homeHand[j].color;
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
		if (homeHand[i].faceCard) {
			hFace++
		}
		for (let j = 0; j < visitorHand.length; j++) {
			if (homeHand[i].rank === visitorHand[j].rank && !homeHand[i].faceCard) {
				hDenomination++
				hColor = homeHand[i].color;
				vColor = visitorHand[j].color;
				if (hColor === vColor) {
					hCompanion++;
				}
			}
		}
	}
}

/**
 * Bepalen van type resultaat en hoeveelheid honken
 * obv resultaat play
 * @param {*} play 
 */
function moveRunners(play) { // TODO walk = true bij 4-wijd...
	//console.log('inside moveRunners');
	//console.log('play:', play);

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
			moveOnSac('sacDP');
			break;
		case 'sacBORA':
			moveOnSac('sacBORA');
			break;
		case 'sacBSRA':
			moveOnSac('sacBSRA');
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
async function moveOnHit(bases) {
	for (var b = 3; b >= 0; b--) {
		if (baseRunners[b] == 1) {
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
				$('#runner1B').hide();
				$('#runner2B').hide();
				$('#runner3B').hide();
				await moveAB1B("runnerAB");
				await move1B2B("runnerAB");
				//move2B3B("runner1B");
			}
		}
	}
}

/**
 * Verplaatsen honklopes
 * obv WALK
 */
function moveOnWalk() { 
	// EIGENLIJK DEZELFDE ALS moveOnHBP ... DUS UNIVERSEEL MAKEN
	// verschillende situaties honken bezetting met case afwerken
	// geeft mogelijkheid van een break en uitslag is uniek
	// variant verzinnen op gedwongen opschuiven of door hit (of deze toch apart afhandelen)
	if (baseRunners[1] == 1) {  // 1B bezet
		if (baseRunners[2] == 1) { // 1B 2B bezet
			if (baseRunners[3 ] == 1) { // 1B 2B 3B bezet
				baseRunners[3] = 0;
				if (vAtBat) { //visitor scoort...
					vRun[inning]++;
				} else { // home scoort
					hRun[inning]++;
				}
				baseRunners[2] = 0; // 1B 2B bezet
				baseRunners[3] = 1;
			}
			baseRunners[2] = 0; // 2B bezet
			baseRunners[3] = 1;
		}
		baseRunners[1] = 0; // 1B bezet
		baseRunners[2] = 1;
	}
	// baseRunners[0] = 0; laten staan ... anders is er geen AB meer, die eigenlijk bij new AB hoort
	baseRunners[1] = 1; // 0B (en alle anderen)
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
 * verplaatsen honklopers
 * obv SAC
 * @param {*} sac 
 */
function moveOnSac(sac) {
	// hier eerst de uitzonderingen uitsluiten
	// en de kaart terugschuiven
	// met messageboard-message
	/* if ((baseRunners[1] == 0 && baseRunners[2] == 0 && baseRunners[3] == 0)
		|| (baseRunners[1] == 0 && baseRunners[2] == 1 && baseRunners[3] == 1)
		|| (baseRunners[1] == 1 && baseRunners[2] == 1 && baseRunners[3] == 1)
		|| (baseRunners[1] == 0 && baseRunners[2] == 0 && baseRunners[3] == 1)) {
			console.log('No SAC situation AB out');
			sendMessage('No SAC situation Batter OUT');
			// kaart teruggeven aan spelershand (check naar speel moment ipv hier // AI geen keuze)
			// of AB => OUT ... of toch SQUEEZE toestaan ??
			numOuts += 1;
		} */
	console.log('moveOnSac(' + sac + ')');	
			
	switch (true) {
		case ((baseRunners[1] == 1 && baseRunners[2] == 0 && baseRunners[3] == 0)
			|| (baseRunners[1] == 1 && baseRunners[2] == 0 && baseRunners[3] == 1)): // 1B of 1B & 3B
			switch (sac) {
				case 'sacDP': // facecard same suit
				baseRunners[1] = 0; // 1B: OUT

				baseRunners[0] = 0; // AB: OUT
				numOuts += 2;
				break;
			case 'sacBORA': // facecard other suit
				baseRunners[1] = 0;
				baseRunners[2] = 1; // 1B => 2B

				baseRunners[0] = 0; // AB: OUT
				numOuts += 1;
				break;
			case 'sacBSRA': // #-card (any)
				baseRunners[1] = 0;
				baseRunners[2] = 1; // 1B => 2B

				baseRunners[0] = 0;
				baseRunners[1] = 1; // AB => 1B
				break;
			default:
				break;
			}			
			break;
		case (baseRunners[1] == 1 && baseRunners[2] == 1 && baseRunners[3] == 0) : // 1B && 2B
			switch (sac) {
				case 'sacDP': // facecard same suit
					baseRunners[2] = 0; // 2B: OUT

					baseRunners[1] = 0;
					baseRunners[2] = 1; // 1B => 2B

					baseRunners[0] = 0; // AB: OUT
					numOuts += 2;
					break;
				case 'sacBORA': // facecard other suit
					baseRunners[2] = 0;
					baseRunners[3] = 1; // 2B => 3B

					baseRunners[1] = 0;
					baseRunners[2] = 1; // 1B => 2B

					baseRunners[0] = 0; // AB: OUT
					numOuts += 1;
					break;
				case 'sacBSRA': // #-card (any)
					baseRunners[2] = 0;
					baseRunners[3] = 1; // 2B => 3B

					baseRunners[1] = 0;
					baseRunners[2] = 1; // 1B => 2B

					baseRunners[0] = 0;
					baseRunners[1] = 1; // AB => 1B
					break;
				default:
					break;
			}
			break;
		case (baseRunners[1] == 0 && baseRunners[2] == 1 && baseRunners[3] == 0) : // 2B
			switch (sac) {
				case 'sacDP': // facecard same suit
					baseRunners[2] = 0; // 2B: OUT

					baseRunners[0] = 0; // AB: OUT
					numOuts += 2;
					break;
				case 'sacBORA': // facecard other suit
					baseRunners[2] = 0;
					baseRunners[3] = 1; // 2B => 3B

					baseRunners[0] = 0; // AB: OUT
					numOuts += 1;
					break;
				case 'sacBSRA': // #-card (any)
					baseRunners[2] = 0;
					baseRunners[3] = 1; // 2B => 3B

					baseRunners[0] = 0;
					baseRunners[1] = 1; // AB => 1B
					break;
				default:
					break;
			}
			break;
		default:
			break;
	} // end cases met situaties
} // end moveOnSac

/**
 * Bepalen obv OFFENSE-hand of ERROR gespeeld kan worden
 * en uitvoering
 */
function playError() {
	// Error-card in OFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& objOtherHand[i].color === objPlay.topCard().color) {
			hasComp = true;
			compCard = i;
		}
	}

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
}

/**
 * Bepalen obv DEFENSE-hand of FOUL-catch kan worden toegepast
 * en uitvoering
 */
function playCatchFoul() {
	// CatchFoul-card in DEFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& objOtherHand[i].color === objPlay.topCard().color) {
			hasComp = true;
			compCard = i;
		}
	}
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
}

/**
 * Renderen van de honklopers
 */
function renderRunners() {
	console.log('renderRunner', baseRunners)
	var topRow = document.getElementById("bases").rows[0].cells
	var bottomRow = document.getElementById("bases").rows[4].cells

	if (baseRunners[3] == 1) {
		bottomRow[0].innerHTML = "3B";
	} else {
		bottomRow[0].innerHTML = "O";
	}

	if (baseRunners[2] == 1) {
		topRow[0].innerHTML = "2B";
	} else {
		topRow[0].innerHTML = "O";
	}

	if (baseRunners[1] == 1) {
		topRow[5].innerHTML = "1B";
	} else {
		topRow[5].innerHTML = "O";
	}

	if (baseRunners[0] == 1) {
		bottomRow[5].innerHTML = "AB";
	} else {
		bottomRow[5].innerHTML = "O";
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
		vRunBoard[inning].innerHTML = vRun[i];
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
		hRunBoard[inning].innerHTML = hRun[i];
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
}

/**
 * Plaatsen van een message op het messagebord
 * @param {*} message 
 */
function sendMessage(message) {
	document.getElementById("messageboard").innerHTML = message;
}

/**
 * functie om het resultaat van elke kaart in hand te bepalen, zou deze gespeeld worden
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

	console.log('checkOptions atBatstatus = ', atBatStatus);
	console.log('turnHome: ' + turnHome + ' // playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor)
	
	for (let i = 0; i < hand.length; i++) {
		detOptionEquals(hand[i]); // ook hier uitvoeren voor elke kaart. nodig voor beslisboom
		let indComp ='';
		let indFly ='';
		//let rating = []; /// hier stond ie eerst / nu boven loop 

			// de nieuwe functie om te valideren
		let [outcomeNew, ratingNew, optionResultNew] = validateCard(hand[i]);
		console.log('=====================================>>>>> O',[outcomeNew, ratingNew, optionResultNew]);


		switch (atBatStatus) {
			case 'pitch':
				if (hand[i].faceCard) {
					outcome = 'BALL';
					rating[i] = 1;
				} else {
					outcome = '?swing?';
					rating[i] = 2;
				}
				break;
			case 'swing':
				if (hand[i].faceCard) {
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
				if (hand[i].faceCard) {
					outcome = 'SAC';
					rating[i] = 1;
					break;
				} else {
					if (isLongFly) {
						indFly ='[F]';
					}
					outcome = '?fielding?';
					rating[i] = 2;
					break;
				}
			case 'fielding':
				outcome = '';
				let optionResult = Math.abs(hand[i].rank - objOtherPlay.topCard().rank);
				if (objOtherPlay.topCard().faceCard) { // connect = SAC
					if (hand[i].faceCard) {
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
				} else if (hand[i].faceCard) { // connect is #1-10						
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
		} // end switch options on atBatStatus

		if (objOtherPlay.length > 0) {// de bovenste kaart van tegenspeler checken op companion-card
			if ((hand[i].rank === objOtherPlay.topCard().rank)
				&& (hand[i].suit != objOtherPlay.topCard().suit) 
				&& (hand[i].color === objOtherPlay.topCard().color) ) {
					indComp = '[c]';
				}
			}

		let symbolRank = '';
		symbolRank = hand[i].symbol + hand[i].letter;

		option = option + ' ' + symbolRank + ' ' + indComp + ' => (' + rating[i] + ') ' + indFly + ' ' + outcome + '&#013';
		sendOption(option);
	}
	return rating
} // end checkOptions



/**
 * AI Player functie
 * 
 */
function playerAI () {
	let ratingAI = checkOptions(objHand);
	console.log('playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor);
	let maxRatingAI = 0;
	let maxRatingAIId = 0;
	for (let i = 0; i < objHand.length; i++) {
		console.log(i + ': ' + ratingAI[i] + ' => ' + objHand[i].shortName)
		if (ratingAI[i] > maxRatingAI) {
			maxRatingAI = ratingAI[i];
			maxRatingAIId = i;
		}
	}		
	console.log('maxRatingAI = ', maxRatingAI);
	console.log('maxRatingAIId = ', maxRatingAIId);
	playAICard(objHand[maxRatingAIId]);
	checkPlayAIFlag = false; // flag uit zetten (aan in checkAtBat)
	playValidate();
}

/**
 * AI functie om checkOption-playerAI kaart te spelen
 * @param {*} aiCard 
 */
function playAICard(aiCard){
	let thinking = 0;
	thinking = 2000 + Math.random() * 2000
	console.log('AI thinking for atBatStatus: ', atBatStatus);
	// await sleep(thinking); async weggehaald 
	console.log ('AI plays: ', aiCard);
	objPlay.addCard(aiCard);
	objPlay.render();
	objHand.render();
	deck.render();
}

/**
 * Testen aantal FaceCards tbv NewBall
 * in ObjHand ( de huidige OFFENSE)
 * @param {*} hand 
 */
function checkNumFaceCards(hand) { // misschien moet dit toon NB-knop worden
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
	console.log('check Reliever');
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
 * EINDE WEDSTRIJD
 */
function gameOver() {
	console.log('GAME OVER');
	sendMessage('GAME OVER');
}



/*
#animBases {
	top: 150px;
	left: 530px;
	width: 250px;
	height: 250px;
	position: relative;
	background: rgb(255, 94, 0);
  }
*/

function createDiamond() {
	$('#animBases').css("top","350px");
	$('#animBases').css("left","0px");
	$('#animBases').css("width","200px");
	$('#animBases').css("height","200px");
	$('#animBases').css("position","relative");
	$('#animBases').css("background","rgb(255, 94, 0)");

}

// animated baserunners
function moveAnimRunners() {
	// $('#runnerAB').hide();
	$('#runner1B').hide();
	$('#runner2B').hide();
	$('#runner3B').hide();
	
	moveAB1B();
	move1B2B();
	move2B3B();
	move3BHB();
}

function moveAB1B(runner) {
  var elem = document.getElementById(runner);   
  var xposAB = 150;
  var yposAB = 150;
  var id = setInterval(frame, 5);
  function frame() {
    if (xposAB == 0) {
      clearInterval(id);
    } else {
      xposAB--; 
      elem.style.top = xposAB + 'px';  
    }
  }
}

function move1B2B(runner) {
  var elem = document.getElementById(runner);  
  var xpos1B = 150; 
  var ypos1B = 0;
  var id = setInterval(frame, 5);
  function frame() {
    if (xpos1B == 0) {
      clearInterval(id);
    } else {
      xpos1B--; 
      elem.style.left = xpos1B + 'px'; 
    }
  }
}

function move2B3B(runner) {
  var elem = document.getElementById(runner);   
  var xpos2B = 0;
  var ypos2B = 0;
  var id = setInterval(frame, 5);
  function frame() {
    if (ypos2B == 150) {
      clearInterval(id);
    } else {
      ypos2B++; 
      elem.style.top = ypos2B + 'px'; 
    }
  }
}

function move3BHB(runner) {
  var elem = document.getElementById(runner);  
  var xpos3B = 0;
  var ypos3B = 150;
  var id = setInterval(frame, 5);
  function frame() {
    if (xpos3B == 150) {
      clearInterval(id);
    } else {
      xpos3B++; 
      elem.style.left = xpos3B + 'px'; 
    }
  }
}
