/**
 * functie om properties aan kaarten toe te voegen,
 * waar cards.js niet in voorziet
 */
function addCardProperties() {
	console.log('[addCardProperties]');
	for (card of deck) {
		switch (card.suit) {
			case 'd':
				card.color = 'red';
				card.symbol = '&diams;';
				card.suitName = 'Diamonds';
				break;
			case 'h':
				card.color = 'red';
				card.symbol = '&hearts;'
				card.suitName = 'Hearts';
				break;
			case 's':
				card.color = 'black';
				card.symbol = '&spades;';
				card.suitName = 'Spades';
				break;
			case 'c':
				card.color = 'black';
				card.symbol = '&clubs;';
				card.suitName = 'Clubs';
				break;
			default:
				break;
		}

		switch (card.rank) {
			case 1:
				card.letter ='A';
				card.faceCard = false;
				card.longName ='Ace';
				break;
			case 11:
				card.letter = 'J';
				card.faceCard = true;
				card.longName = 'Jack';
				break;
			case 12:
				card.letter = 'Q';
				card.faceCard = true;
				card.longName = 'Queen';
				break;
			case 13:
				card.letter = 'K';
				card.faceCard = true;
				card.longName = 'King';
				break;
			default:
				card.faceCard = false;
				card.letter= card.rank;
				card.longName = card.rank;
				break;
		}
	}
} // einde addCardProperties

/**
 * Deck controleren op het aantal kaarten
 */
function checkDeck() { 
	console.log('[checkDeck]');
	if (deck.length < 7) {
		console.log('[checkDeck] Het worden er te weinig')
		moveCards(discardPile, deck);
		console.log('[checkDeck] Shuffle deck');
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
	console.log('[shuffle]');
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

/*
function countCards() {
	console.log('[countCards]');
	console.log('==> atBatStatus: ', atBatStatus);
	console.log('==> vAtBat: ' + vAtBat + ' | hAtBat: ' + hAtBat);
	console.log('==> turnVisitor: ' + turnVisitor + ' | turnHome: ' + turnHome);
	console.log('==> objHand: ' + objHand.length + ' | objPlay: ' + objPlay.length);
	console.log('==> objOtherHand: ' + objOtherHand.length + ' | objOtherPlay: ' + objOtherPlay.length);
}
*/



/**
 * opruimen en completeer Hands tot 6
 */
function cleanRefill() {
	console.log('[cleanRefill]');
	if (objPlay.length > 0) {
		moveCards(objPlay, discardPile);
		//await sleep(1000);
	}
	if (objOtherPlay.length > 0 ) {
		moveCards(objOtherPlay, discardPile);
		//await sleep(1000);
	}
	while (objHand.length != 6 ) { // aanvullen tot 6
		refillHand(objHand);
		//await sleep(1000);
	}
	while (objOtherHand.length != 6 ) { // aanvullen tot 6
		refillHand(objOtherHand);
		//await sleep(1000);
	}
	countCategories();
}

/**
 * functie om de Hand aan te vullen met 1 kaart van deck
 * @param {*} fillHand 
 */
function refillHand(fillHand) {
	console.log('[refillHand]');
	fillHand.addCard(deck.topCard());
	fillHand.render();
	deck.render();
}

/**
 * functie om een Hand met kaarten te verplaatsten.
 * hierin in blijkbaar niet voorzien in card.js
 * @param {*} from 
 * @param {*} to 
 */
function moveCards(from, to) {
	console.log('[moveCards]');
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
// zoals de playValidate-function was... :-) 
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
	console.log('[detEquals]');
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
	console.log('[detOptionEquals]');
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
 * Face, Companion en Denomination
 */
function countCategories() {
	console.log('[countCategories]');
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
	console.log('[moveRunners]');
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
			console.log('[moveRunners] moveRunners default');
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
	console.log('[moveOnHit]');
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
				baseRunners[b + bases] = baseRunners[b];
				baseRunners[b] = 0;
				

				/*
				$('#runner1B').hide();
				//$('#runner2B').hide();
				$('#runner3B').hide();
				moveAB1B("runnerAB");
				//move1B2B("runnerAB");
				//move1B2B("runner1B");
				move2B3B("runner2B");
				*/
			}
		}
	}
} //einde moveOnHit


/**
 * Verplaatsen honklopers
 * obv WALK
 */
function moveOnWalk() { 
	console.log('[moveOnWalk]');
	// EIGENLIJK DEZELFDE ALS moveOnHBP ... DUS UNIVERSEEL MAKEN
	// verschillende situaties honken bezetting met case afwerken
	// geeft mogelijkheid van een break en uitslag is uniek
	// variant verzinnen op gedwongen opschuiven of door hit (of deze toch apart afhandelen)
	if (baseRunners[1] != 0) {  // 1B bezet
		if (baseRunners[2] != 0) { // 1B 2B bezet
			if (baseRunners[3] != 0) { // 1B 2B 3B bezet
				baseRunners[3] = 0;
				if (vAtBat) { //visitor scoort...
					vRun[inning]++;
				} else { // home scoort
					hRun[inning]++;
				}
				baseRunners[3] = baseRunners[2];
				baseRunners[2] = 0; // 1B 2B bezet
			}
			baseRunners[3] = baseRunners[2];
			baseRunners[2] = 0; // 1B 2B bezet
		}
		baseRunners[2] = baseRunners[1]; // 1B bezet
		baseRunners[1] = 0;
	}
	// baseRunners[0] = 0; laten staan ... anders is er geen AB meer, die eigenlijk bij new AB hoort
	baseRunners[1] = baseRunners[0]; // 0B (en alle anderen)
}

/**
 * verplaatsen honklopers
 * obv HBP (als WALK)
 */
function moveOnHBP() {
	console.log('[moveOnHBP] Inside moveOnHBP === moveOnWalk');
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
	console.log('[moveOnSac] moveOnSac(' + sac + ')');	
			
	switch (true) {
		case ((baseRunners[1] != 0 && baseRunners[2] == 0 && baseRunners[3] == 0)
			|| (baseRunners[1] != 0 && baseRunners[2] == 0 && baseRunners[3] != 0)): // 1B of 1B & 3B
			switch (sac) {
				case 'sacDP': // facecard same suit
				baseRunners[1] = 0; // 1B: OUT

				baseRunners[0] = 0; // AB: OUT
				numOuts += 2;
				break;
			case 'sacBORA': // facecard other suit
				baseRunners[2] = baseRunners[1]; // 1B => 2B	
				baseRunners[1] = 0;

				baseRunners[0] = 0; // AB: OUT
				numOuts += 1;
				break;
			case 'sacBSRA': // #-card (any)
				baseRunners[2] = baseRunners[1]; // 1B => 2B	
				baseRunners[1] = 0;

				baseRunners[1] = baseRunners[0]; // AB => 1B
				baseRunners[0] = 0;
				break;
			default:
				break;
			}			
			break;
		case (baseRunners[1] != 0 && baseRunners[2] != 0 && baseRunners[3] == 0) : // 1B && 2B
			switch (sac) {
				case 'sacDP': // facecard same suit
					baseRunners[2] = 0; // 2B: OUT

					baseRunners[2] = baseRunners[1]; // 1B => 2B
					baseRunners[1] = 0;

					baseRunners[0] = 0; // AB: OUT
					numOuts += 2;
					break;
				case 'sacBORA': // facecard other suit
					baseRunners[3] = baseRunners[2]; // 2B => 3B
					baseRunners[2] = 0;

					baseRunners[2] = baseRunners[1]; // 1B => 2B
					baseRunners[1] = 0;					

					baseRunners[0] = 0; // AB: OUT
					numOuts += 1;
					break;
				case 'sacBSRA': // #-card (any)
					baseRunners[3] = baseRunners[2]; // 2B => 3B
					baseRunners[2] = 0;					

					baseRunners[2] = baseRunners[1]; // 1B => 2B
					baseRunners[1] = 0;					

					baseRunners[1] = baseRunners[0]; // AB => 1B
					baseRunners[0] = 0;					
					break;
				default:
					break;
			}
			break;
		case (baseRunners[1] == 0 && baseRunners[2] != 0 && baseRunners[3] == 0) : // 2B
			switch (sac) {
				case 'sacDP': // facecard same suit
					baseRunners[2] = 0; // 2B: OUT

					baseRunners[0] = 0; // AB: OUT
					numOuts += 2;
					break;
				case 'sacBORA': // facecard other suit
					baseRunners[3] = baseRunners[2]; // 2B => 3B
					baseRunners[2] = 0;

					baseRunners[0] = 0; // AB: OUT
					numOuts += 1;
					break;
				case 'sacBSRA': // #-card (any)
					baseRunners[3] = baseRunners[2]; // 2B => 3B
					baseRunners[2] = 0;

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
	console.log('[playError]');
	// Error-card in OFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& objOtherHand[i].color === objPlay.topCard().color) {
			hasComp = true;
			compCard = i;
		}
	}
	return [hasComp, compCard];
}

/**
 * Bepalen obv DEFENSE-hand of FOUL-catch kan worden toegepast
 * en uitvoering
 */
function playCatchFoul() {
	console.log('[playCatchFoul]');
	// CatchFoul-card in DEFFENSE-HAND en toepassen ??
	for (let i = 0; i < objOtherHand.length; i++) {
		if (objOtherHand[i].rank === objPlay.topCard().rank
			&& objOtherHand[i].color === objPlay.topCard().color) {
			hasComp = true;
			compCard = i;
		}
	}
	/* if (hasComp == true) {
		if (confirm('Catch Foul')) {
			// BATTER = OUT!
			console.log('[playCatchFoul] FOUL caught - OUT');
			isCatchFoul = true;
			objOtherPlay.addCard(objOtherHand[compCard]);
			objOtherHand.render();
			objOtherPlay.render();

			moveCards(objPlay, discardPile); // cleanup playing hands !!
			moveCards(objOtherPlay, discardPile); // en die andere ook
			//refillHand(objOtherHand);
			//refillHand(objHand);
		} else {
			isCatchFoul = false;
		} 
	}*/
}


/**
 * functie om het resultaat van elke kaart in hand te bepalen, zou deze gespeeld worden
 * @param {*} hand 
 */
function checkOptions(hand) {
	console.log('[checkOptions]');
	let outcome = '';
	let option = '';
	let rating = [];
	let ratingNew = [];
	let outcomeNew = [];
	let outcomeTextNew = [];
	ratingNew =[]; // hier stond eerst let voor...nu naar boven de loop
	let optionResultNew =[];

	checkOptionsFlag = false; // vlag om te voorkomen dat het steeds in playCard wordt uitgevoerd
	// maar die zal ook weer ergens aangezet moeten worden...

	// voor de huidige status en speler de kaarten langslopen
	// dezelfde controles uitvoeren op de kaart
	// en het resultaat bepalen

	console.log('[checkOptions] atBatstatus = ', atBatStatus);
	console.log('[checkOptions] turnHome: ' + turnHome + ' // playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor)
	
	for (let i = 0; i < hand.length; i++) {
		detOptionEquals(hand[i]); // ook hier uitvoeren voor elke kaart. nodig voor beslisboom
		let indComp ='';
		indFly ='';
		//let rating = []; // hier stond ie eerst / nu boven loop 

		// de nieuwe functie om te valideren
		let [outcomeVal, outcomeTextVal, ratingVal, optionResultVal] = validateCard(hand[i]);
		outcomeNew[i] = outcomeVal;
		outcomeTextNew[i] = outcomeTextVal; 
		ratingNew[i] = ratingVal;
		optionResultNew[i] = optionResultVal

		// de bovenste kaart van tegenspeler checken op companion-card
		if (objOtherPlay.length > 0) {
			if ((hand[i].rank === objOtherPlay.topCard().rank)
				&& (hand[i].suit != objOtherPlay.topCard().suit) 
				&& (hand[i].color === objOtherPlay.topCard().color) ) {
					indComp = '[c]';
				}
			}

		let symbolRank = '';
		symbolRank = hand[i].symbol + hand[i].letter;

		option = option + ' ' + symbolRank + ' ' + indComp + ' => (' + ratingNew[i] + ') ' + indFly + ' ' + outcomeNew[i] + '&#013';
		if (playAI && turnVisitor && showCards == false) {
			sendOption("");
		} else {
			sendOption(option);
		}
	}
	return ratingNew;
} // end checkOptions



/**
 * AI Player functie
 * 
 */
function playerAI () {
	console.log('[playerAI] playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor);
	// check for 2 facecards
	if ((playAI === true) && (vAtBat === false) && (atBatStatus === 'pitch')) {
		console.log('[playerAI]: Check facecards for AI');
		let numFaceCards = 0
		for (let i = 0; i < objHand.length; i++) {
			if (objHand[i].faceCard) {
				numFaceCards++
			}
		}
		console.log('[playerAI]: numFaceCards = ',numFaceCards);
		if (numFaceCards >= 2){
			newballAI();
		}
	};

	// bepalen van de AI-speelwaarde voor elke kaart
	let ratingAI = checkOptions(objHand);
	console.log('[playerAI] ', ratingAI);	
	let maxRatingAI = 0;
	let maxRatingAIId = 0;
	for (let i = 0; i < objHand.length; i++) {
		console.log('[playerAI] ', i + ': ' + objHand[i].shortName + ' => : ' + ratingAI[i] );
		if (ratingAI[i] > maxRatingAI) {
			maxRatingAI = ratingAI[i];
			maxRatingAIId = i;
		}
	}		
	console.log('[playerAI] maxRatingAI = ', maxRatingAI);
	console.log('[playerAI] maxRatingAIId = ', maxRatingAIId);
	let thinking = 0;
	thinking = 2000 + Math.random() * 2000;
	console.log('[playerAI] AI thinking for atBatStatus: ', atBatStatus);
	//sendMessage('AI is thinking');
	//await sleep(thinking);
	playAICard(objHand[maxRatingAIId]);
	checkPlayAIFlag = false; // flag uit zetten (aan in checkAtBat)
	detEquals();
	[outcome, outcomeText, rating, optionResult] = validateCard(objPlay.topCard());
	executePlay(outcome);
}

/**
 * AI functie om checkOption-playerAI kaart te spelen
 * @param {*} aiCard 
 */
function playAICard(aiCard){
	console.log ('[playAICard] AI plays: ', aiCard);
	objPlay.addCard(aiCard);
	objPlay.render();
	objHand.render();
	deck.render();
}
/**
 * AI functie voor newballs bij 2 face-cards in 
 */
function newballAI() {
	console.log('[newballAI] AI switch 2 facecards')
	
	newBallFlag = true;
	atBatStatus = 'newball';
	displayStatus(atBatStatus);
	//turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
	sendMessage('New Balls request &#013 Two facecards');

	numFaceCardsAI = 0;
	for (let i = 0; i < objHand.length; i++) {
		if(objHand[i].faceCard) {
			console.log('[newballAI]: play face-card')
			numFaceCardsAI++
			playAICard(objHand[i]);
		}
	
		console.log('[newballAI]: numFaceCardsAI: ', numFaceCardsAI);	
		if (numFaceCardsAI === 2) {
			moveCards(objPlay, discardPile);
			refillHand(objHand);
			refillHand(objHand);
			// uit de loop indien er 2 facecards zijn gelegd
			newBallFlag = false;
			atBatStatus = 'pitch'; // new pitch
			displayStatus(atBatStatus);
			sendMessage('Play Ball!');
			break;
		}
	}		
} // einde newballAI