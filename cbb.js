
//Tell the library which element to use for the table
cards.init({ table: '#card-table' });
let playAI = false;
let maxInnings = 9; // max aantal te spelen voordat endOfGame wordt bepaald in checkInning
// This allows to use up and down arrows on the input, but doesn't allow keyboard input.
$("[type='number']").keypress(function (evt) {
    evt.preventDefault();
});

let showCards = true; // met toggleCards-button bedienen

//Create a new deck of cards
deck = new cards.Deck();
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 150;
deck.y -= -40;



//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all);
addCardProperties(); // extra properties
//No animation here, just get the deck onto the table.
deck.render({ immediate: true });

// discardPile voor gespeelde kaarten.
// deze moeten later weer worden toegevoegd aan deck
discardPile = new cards.Deck({ faceUp: false });
discardPile.x -= 150;
discardPile.y -= 80;

//Now lets create a couple of hands, one face down (now up), one face up.
visitorHand = new cards.Hand({ faceUp: true, y: 60 });
homeHand = new cards.Hand({ faceUp: true, y: 440 });

visitorPlay = new cards.Hand({ faceUp: true, y: 200 });
homePlay = new cards.Hand({ faceUp: true, y: 300 });

// TODO bepalen wie er begint door een kaart te trekken. de hoogste kaart bepaalt start field of atBat 
let turnHome = true; // in dev & test begint Lower met pitchen/veld
$("#home").css("background-color", "red");
$("#home").val('pitch');
let turnVisitor = false;
$("#visitor").css("background-color", "green");

let objHand = homeHand; // het zetten van de eerste speler,
let objPlay = homePlay; // omdat er nog geen functie voor de ad random selectie is
let objOtherHand = visitorHand // die ander moet ook herkend worden
let objOtherPlay = visitorPlay // en deze andere ook
let atBatStatus = '';

// voor de initiatie van de baseballgame
let numStrikes = 0;
let numBalls = 0;
let numOuts = 0;
let halfInning = 0;
let inning = 0;

// voor de bepaling van wie er aan de beurt is om een kaart te klikken
let vAtBat = true;
let hAtBat = false;

// voor de initiatie van de honklopers
let numBases = 0; // aantal honken op geslagen bal (of walk...)
let baseRunners = [];
for (i = 0; i <= 3; i++) {
	baseRunners[i] = 0;
}

let play = '';
renderRunners();

// voor de bepaling van de plays in playValidate
let eqRank = false;
let eqColor = false;
let eqSuit = false;
let isFace = false;

// voor de bepaling van Error en CatchFoul in playValidate
let hasComp = false;
let isError = false;
let isCatchFoul = false;
let isLongFly = false;

// voor de telling van de categories in playValidate per Hand
let vFace = 0;
let vCompanion = 0;
let vDenomination = 0;

let hFace = 0;
let hCompanion = 0;
let hDenomination = 0;

// voor de initiatie van het scoreboard
let vRun = [];
vRun.push(0) // nulde element moet gevuld worden. verder halve-innings-gewijs updaten
let hRun = [];
hRun.push(0) // nulde element moet gevuld worden. verder halve-innings-gewijs updaten

let vHits = 0;
let vErrors = 0;
let hHits = 0;
let hErrors = 0;

let checkOptionsFlag = true; // flag aan en uit om 1x door checkOptions per beurt/card te gaan
let checkFaceCardsFlag = true; // flag om check tot 1x te beperken per beurt/card
let checkPlayAIFlag = false; // flag om de beurt van AI onder controle te houden

// NB knop
let newBallFlag = false;
$('#hNB').hide();
$('#vNB').hide();

// RP knop
let hitsInning = 0; // minimum 2 Hits in inning voor relief pithers inzet
let hReliever = false; // max 1 per game
let vReliever = false; // max 1 per game
let checkRelieverFlag = true; // mag er gecheckt worden
$('#hRP').hide();
$('#vRP').hide();


// endOfGame indicator
let endOfGame = false;


$('#aiDeal').click(function () {
	playAI = true;
	document.getElementById("playAI").innerHTML = 'AI';
	//console.log('AI = ' + playAI);
	sendMessage('AI = ' + playAI);
	$('#deal').click();
})

$('#toggleCards').click(function () {
	if (showCards) {
		showCards = false;
		visitorHand.faceUp = false;
		visitorHand.render();
		$('#toggleCards').text("Show Cards")
	} else {
		showCards = true;
		visitorHand.faceUp = true;
		visitorHand.render();
		$('#toggleCards').text("Hide Cards")
	}
})

// activeren van het spel met de DEAL button (of Play Ball)
$('#deal').click(function () {
	//Deck has a built in method to deal to hands.
	maxInnings = document.getElementById('iMaxInnings').value;
	console.log('Max Innings: ', maxInnings);
	$('#deal').hide();
	$('#aiDeal').hide();
	$('#lblMaxInnings').hide();
	$('#iMaxInnings').hide();

	createScoreBoard(maxInnings);
	createDiamond();

	deck.deal(6, [visitorHand, homeHand], 50, function () {
		//This is a callback function, called when the dealing
		//is done.
		// om de initiatie van het spel op te starten en uit te voeren
		sendMessage("PLAY BALL !!")
		atBatStatus = 'pitch';
		//halfInning = 1;
		//inning = Math.floor(halfInning / 2);
		inning = 1;
		vRun.push(0); // de top first wordt gevuld met 0. geeft de actieve slagbeurt aan
		updateScoreboard();
		baseRunners[0] = 1;
		renderRunners();
		countCategories();
		checkOptionsFlag = true;
	});
})


// afhandelen van het klikken op home NB-button voor new balls
$('#hNB').click(function () {
	//console.log('hNB-clicked');
	newBallFlag = true;
	//console.log('newBallFlag = true');
	atBatStatus = 'newball';
	turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
	sendMessage('New Balls request &#013 Two facecards');
})

// afhandelen van het klikken op visitor NB-button voor new balls
$('#vNB').click(function () {
	//console.log('vNB-clicked');
	newBallFlag = true;
	//console.log('newBallFlag = true');
	atBatStatus = 'newball';
	turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
	sendMessage('New Balls request &#013 Two facecards');
})

// afhandelen van het klikken op home RP-button voor Relief Pitcher
$('#hRP').click(function () {
	//console.log('hRP-clicked');	
	sendMessage('Relief Pitcher');
	hReliever = true; // de reliever is ingezet
	refillHand(objHand);
	refillHand(objHand);
})

// afhandelen van het klikken op visitor RP-button voor Relief Pitcher
$('#vRP').click(function () {
	//console.log('hRP-clicked');	
	sendMessage('Relief Pitcher');
	vReliever = true; // de reliever is ingezet
	refillHand(objHand);
	refillHand(objHand);
})

// dit stukje code zorgt voor de game-loop
// vergelijk met sitepoint website of dat beter is

window.requestAnimationFrame(playBall);

// einde gameloop

function playBall() {
	//slagbeurt 
	//console.log('playBall atBatStatus: ', atBatStatus);
	if (checkOptionsFlag == true) { checkOptions(objHand) }; // uit playCard ; meteen AI-speler
	
	playCard();	// deze moet blijkbaar hier uit...vanwege atBatStatus result	
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
} // einde playBall

/**
 * functie om kaart te klikken uit de hand die aan de beurt is.
 */
function playCard() { // kan dat ook op een 'naam' van het object-manier??
	// nu ontstaat er volgens mij een tweede object...
	// wellicht terugkopieren?
	// if (checkOptionsFlag == true) { checkOptions(objHand) }; //verhuisd naar playBall

	if ((checkFaceCardsFlag == true) && (atBatStatus == 'pitch')) { checkNumFaceCards(objHand) };

	if ((checkRelieverFlag == true) && hitsInning >= 2) { // controle of RP mag worden ingezet
		if (vAtBat === true && hReliever == false ) {
			checkReliever();
		} else if ( hAtBat === true && vReliever === false) {
			checkReliever();
		}		
	}

	// bepalen of de AI-player aan de beurt is om een kaart te spelen
	if (playAI && turnVisitor && checkPlayAIFlag) {
		console.log('playerAI will think and play');
		playerAI();
	}

	// wellicht dit de Human ge-else-d kan worden...
	// ff los van het uit- en inschakel probleem rond de click-functie

	// bepalen welke kaart door de HUMAN-player wordt geclickt om te spelen
	objHand.click(function (card) {
		document.getElementById("messageboard").innerHTML = "";
		console.log('Human plays: ', card);
		let playable = false
		for (i = 0; i < objHand.length; i++) { // om te testen of de geklikte card van de play-Hand is
			if (card === objHand[i]) {
				playable = true;
			};
		} // end test voor playable

		if (playable === true) { //valid card-player 
			objPlay.addCard(card);
			objPlay.render();
			objHand.render();
			deck.render();
			
			//playValidate(); // oude versie


			// de nieuwe versie(s)
			detEquals(); //voordat de functie wordt aangeroepen
			[outcome, outcomeText, rating, optionResult] = validateCard(card);
			//console.log('=====================================>>>> vCard ' + [outcome, outcomeText, rating, optionResult]);
			executePlay(outcome);

		} else {
			let msgBeurt = "WACHTEN !";
			if (turnHome) {
				$("#visitor").val(msgBeurt);
			} else {
				$("#home").val(msgBeurt);
			}
		}
	}); // end click objHand (of objOtherHand) 
} // end playCard



/**
 * controleren van de slagbeurt (pitch2pitch)
 */
function checkAtBat() {
	console.log('Inside checkAtBat');
	checkOptionsFlag = true; // vlag terugzetten zodat deze volgende keer met playCard kan worden uitgevoerd
	if (playAI) { checkPlayAIFlag = true;} // aan zetten voor de volgende AI-play
	checkFaceCardsFlag = true // vlag terugzetten
	if (numStrikes === 3) {
		//console.log('strik-out');
		sendMessage('STRIKE-OUT');
		numOuts++
		newBatter();
	}

	if (numBalls === 4) {
		//console.log('walk');
		sendMessage('WALK');
		moveRunners('walk');
		newBatter();
	}
}

/**
 * controlen van de  inning
 */
function checkInning() {
	console.log('Inside checkInning');
	if (inning <= maxInnings) {
		if (numOuts === 3) {
			sendMessage('3-OUTS Change fields')
			console.log('3-OUTS Change fields');
			if (vAtBat) {
				vAtBat = false;
				hAtBat = true;
				hRun[inning] = 0;
				hitsInning = 0;
			} else {
				hAtBat = false;
				vAtBat = true;
				inning++;
				vRun[inning] = 0;
				hitsInning = 0;
			}
			for (i = 0; i <= 3; i++) {
				baseRunners[i] = 0;
			}
			numOuts = 0;
			newBatter();
			if (objHand.length > 6 || objOtherHand.length > 6) {
				atBatStatus = 'decrease'
				sendMessage('decrease to 6 cards');
				// ??? moet dat wisselen van die spelers ???
				turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
			}
			$('#hNB').hide(); // NB-knoppen verwijderen
			$('#vNB').hide();
			$('#hRP').hide(); // RP knoppen verwijderen
			$('#vRP').hide();			
		}
	} else {
		endOfGame = true;
		// gameOver(); in playCard wordt op endOfGame gecheckt en doorgestuurd naar gameOver
	}
} // einde checkInning

/**
 * Nieuwe slagman
 */
function newBatter() {
	console.log('New Batter');
	sendMessage('New Batter');
	atBatStatus = 'pitch';
	if (vAtBat) {
		turnHome = true;
		turnVisitor = false;
	} else {
		turnVisitor = true;
		turnHome = false;
	}
	displayStatus(atBatStatus);
	numBalls = 0;
	numStrikes = 0;
	updateScoreboard();
	baseRunners[0] = 1;
	renderRunners();
	return
}

/**
 * obv atBatStatus de uit te voeren play bepalen
 */
async function playValidate() {
	console.log('inside playValidate');
	console.log('playValidate atBatStatus: ', atBatStatus);
	console.log('playAI: ' + playAI + ' and turnVisitor: ' + turnVisitor);
	// feitelijke controle op de kaart die als laatste aan homePlay of visitorPlay is toegevoegd
	// dit gaat dan met topCard() gebeuren

	checkDeck(); //staat ie hier beter??
	await sleep(2000);

	// bepaal de overeenkomstigheden (equals)
	detEquals();

	countCards();

	switch (atBatStatus) {
		case 'newball':
			sendMessage('New Balls request &#013 Two facecards');
			if (objPlay.length == 2) {

				// testen of beide kaarten faceCards zijn
				let numNewBallFaceCards = 0;
				for (let i=0; i < objPlay.length; i++) {
					if (objPlay[i].faceCard) { 
						numNewBallFaceCards ++
					}
				}

				// afhankelijk van uitkomst test
				// de faceCards naar Pile en twee nieuwe van Deck
				// of terug naar Hand
				if (numNewBallFaceCards == 2) {
					//console.log('atBatStatus: newball');
					moveCards(objPlay, discardPile);
					refillHand(objHand);
					await sleep(2000);
					refillHand(objHand);
					await sleep(2000);
					atBatStatus = 'pitch'; // new pitch
					displayStatus(atBatStatus);
					sendMessage('Play Ball!');
				} else {
					sendMessage('2 Face-cards needed for New Balls');
					moveCards(objPlay, objHand);
					await sleep(2000);
				}					
			} 
			break;
		case 'decrease':
			//console.log('decrease cards');
			sendMessage('decrease to 6 cards');
			let handLength = objOtherHand.length;
			switch (true) {
				case (handLength > 6):
					moveCards(objOtherHand, discardPile);
					break;
				case (handLength === 6):
					atBatStatus = 'pitch';
					sendMessage('Play Ball!');
					displayStatus(atBatStatus);
					break;
			}
			break;
		// de pitch
		case 'pitch':
			console.log('atBatStatus: ', atBatStatus);
			if (objPlay.topCard().faceCard) { // een plaatje => ball
				numBalls += 1;
				sendMessage('BALL ' + numBalls); // onnozel als je geen 4-wijd wil gooien...
				updateScoreboard() // naar scoreboard
				cleanRefill();
				await sleep(2000);
				atBatStatus = 'pitch'; // new pitch
			} else {
				atBatStatus = 'swing'; // kaarten laten liggen
				changePlayer(); // dan pas van speler wisselen
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		// de swing
		case 'swing':
			console.log('atBatStatus: ', atBatStatus);
			if (objPlay.topCard().faceCard) { // plaatje => foul
				if (numStrikes < 2) { // <2 => strike
					numStrikes += 1;
					sendMessage('FOUL - STRIKE ' + numStrikes);
					updateScoreboard();

					// CatchFoul-card in DEFFENSE-HAND en toepassen ??
					hasComp = false;
					isCatchFoul = false;
					playCatchFoul(); // zo ja,  dan ben je OUT !!
					cleanRefill();
					await sleep(2000);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
				} else {
					sendMessage('2-strike FOUL'); // 2-strike foul
					cleanRefill();
					await sleep(2000);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
				}
			} else if (eqSuit === false) { // HBP of strike
				// de pitch >=9; de swing is gelijke rank en gelijke kleur (het is al niet meer dezelfde suit)
				if ((objOtherPlay.topCard().rank >= 9) && (eqRank === true) && (eqColor === true)) {
					console.log('Hit by Pitch');
					sendMessage('Hit by Pitch');
					moveRunners('hbp');
					cleanRefill();
					await sleep(2000);
					numBalls = 0; //new batter
					numStrikes = 0;//new batter
					updateScoreboard();
					atBatStatus = 'pitch'; // new batter
					changePlayer();
					break;
				} else {
					numStrikes += 1;
					sendMessage('STRIKE ' + numStrikes);
					updateScoreboard();
					cleanRefill();
					await sleep(2000);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
					break;
				}
			} else if (objPlay.topCard().rank < objOtherPlay.topCard().rank) { // lager dan pitch => ball
				numBalls += 1;
				sendMessage('BALL ' + numBalls)
				updateScoreboard();
				cleanRefill();
				await sleep(2000);
				atBatStatus = 'pitch'; // new pitch
				changePlayer();
				
			} else { // dezelfde suit geen plaatje en hoger dan pitch
				console.log('connecting with the pitch');
				atBatStatus = 'connect';
				displayStatus(atBatStatus);
				// go-to pick card to place hit
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		// de connect
		case 'connect': // een kaart kiezen : hoe geslagen
			console.log('atBatStatus: ', atBatStatus);
			// a card is picked to place hit
			if (objPlay.topCard().rank === 9 || objPlay.topCard().rank === 10) {
				isLongFly = true;
			}

			// if card is face card check for valid situation
			if (objPlay.topCard().faceCard
				&& ((baseRunners[1] == 0 && baseRunners[2] == 0 && baseRunners[3] == 0)
				|| (baseRunners[1] == 0 && baseRunners[2] == 1 && baseRunners[3] == 1)
				|| (baseRunners[1] == 1 && baseRunners[2] == 1 && baseRunners[3] == 1)
				|| (baseRunners[1] == 0 && baseRunners[2] == 0 && baseRunners[3] == 1))) {
				console.log('No SAC situation');
				sendMessage('No SAC situation');
				// kaart teruggeven aan spelershand (check naar speel moment ipv hier // AI geen keuze)
				//TODO indien AI alleen faceCards heeft gaat ie in de loop => 3B ook bunt (squeeze) en 0B bunt-hit
				objHand.addCard(objPlay.topCard());
				objHand.render();
				objPlay.render();
				await sleep(2000);
				atBatStatus = 'connect';
				break;
			}
			atBatStatus = 'fielding';
			changePlayer();
			break;
		case 'fielding': // een kaart kiezen : hoe verwerkt
			console.log('atBatStatus: ', atBatStatus);

			// Error-card in OFFENSE-HAND en toepassen ??
			hasComp = false;
			isError = false;
			playError();

			atBatStatus = 'result';
			displayStatus(atBatStatus);
			console.log('playValidate inside atBatStatus fielding');
			await sleep(2000);
			playValidate(); // deze moet hier, om de click-card te omzeilen
			break;
		// result
		case 'result': // berekening van het resultaat van de connect vs fielding
			console.log('inside RESULT');
			console.log('atBatStatus: ', atBatStatus);
			let result = Math.abs(objPlay.topCard().rank - objOtherPlay.topCard().rank);
			console.log('result ', result);

			// verwerking van bijzondere connect-kaart of bijzondere connect-fielding-combi

			// sacrifice alleen met 1 of 2 of 1 en 2 bezet.of 1 en 3; bases loaded en alleen loper op 3 kan niet
			// dus iets met baseRunners[i] doen en zo... 
			if (objOtherPlay.topCard().faceCard) { // sacrifice
				//TODO kan niet met bases loaded of alleen loper op 3 !! => afvangen van tevoren??
				console.log('sacrifice attempt')
				// plaatje van dezelfde suit
				if ((objPlay.topCard().faceCard) && (eqSuit === true)) {
					console.log('SAC: double play');
					sendMessage('SAC: double play');
					moveRunners('sacDP');
					// batter is out and runner out... de verste loper
					//break;
				} else if (objPlay.topCard().faceCard && (eqSuit === false)) {
					console.log('SAC: B:out R:adv');
					sendMessage('SAC: B:out R:adv');
					moveRunners('sacBORA');
					// batter out and runner(s) advance ... kan niet met bases loaded, maar wel 1 en 3
					//break;
				} else if (!objPlay.topCard().faceCard) {
					console.log('SAC: B:safe R:adv');
					sendMessage('SAC: B:safe R:adv');
					moveRunners('sacBSRA');
					// batter is safe and runner(s) advance
					//break;
				}
				cleanRefill();
				await sleep(2000);
				atBatStatus = 'pitch' // nieuwe slagman
				baseRunners[0] = 1;
				renderRunners();
				numStrikes = 0; // hoort dit bij checkAtBAt??
				numBalls = 0; // of hoort dat op deze plek???????
				displayStatus(atBatStatus);
				result = -1; // anders wordt de berekening gemaakt...
				console.log('result (SAC):', result);
			} else { // einde sacrifice
				if (eqSuit) { // dezelfde suit
					result = result * 1;
					console.log('result * 1:', result);
				} else if (eqColor) { // dezelfde kleur
					result = result * 2;
					console.log('result * 2: ', result);
				} else {
					result = result * 3; // andere kleur
					console.log('result * 3: ', result);
				}
				console.log('Eind result: ', result);
			}


			switch (true) { // result met kernwoord naar moverunners sturen ipv numBases
				case (result > 9):
					sendMessage('HOME RUN');
					vAtBat ? vHits++ : hHits++;
					hitsInning++;
					moveRunners('homerun');
					break;
				case (result > 7):
					if (!isError) {
						sendMessage('TRIPLE');
						vAtBat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('triple');
					} else {
						sendMessage('TRIPLE + ERROR !');
						vABat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('homerun');
					}
					break;
				case (result > 5):
					if (!isError) {
						sendMessage('DOUBLE');
						vAtBat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('double');
					} else {
						sendMessage('DOUBLE + ERROR !');
						vAtBat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('triple');
					}
					break;
				case (result > 3):
					if (!isError) {
						sendMessage('SINGLE');
						vAtBat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('single');
					} else {
						sendMessage('SINGLE + ERROR !');
						vAtBat ? vHits++ : hHits++;
						hitsInning++;
						moveRunners('double');
					}
					break;
				case (result >= 0):
					if (!isError) {
						if (isLongFly) {
							sendMessage('FLY OUT');
							isLongFly = false;
						} else {
							sendMessage('GROUND OUT');
						} 
						console.log('no runner to move (yes)');
						numOuts += 1; // en daar hoort ook een check voor 3 out bij
						updateScoreboard(); // naar game-loop ??
					} else {
						sendMessage('On Base by ERROR !');
						moveRunners('single');
					}
					break;
				default:
					console.log('RESULT default');
					break;
			} // de geslagen bal is verwerkt
			// de honklopers zijn verplaatst
			// het scoreboard is bijgewerkt
			// kaarten opruimen
			cleanRefill();
			await sleep(2000);
			atBatStatus = 'pitch' // nieuwe slagman
			baseRunners[0] = 1;
			renderRunners();
			numStrikes = 0; // hoort dit bij checkAtBAt??
			numBalls = 0; // of hoort dat op deze plek???????
			displayStatus(atBatStatus);
			break;
		default:
			console.log('playValidate default');
			endOfGame = true; // gameOver :-)
			break;
	}
	console.log('outside playValidate-case countCards')
	countCards();
	// check met strikes, balls, outs & innings
	// die staat nu in de game-loop
	checkAtBat();
	/* if (numOuts === 3) { // anders gaat de AI te snel voor het leegmaken van het speelveld
		await sleep(2000)
	} */
	checkInning();
	updateScoreboard(); // naar game-loop ??
} // einde playValidate


/**
 * van speelbeurt wisselen
 * en aansturing indicator
 * met atBatStatus
 */
async function changePlayer() {

	if (turnHome) {
		turnVisitor = true;
		$("#visitor").css("background-color", "red");
		$("#visitor").val(atBatStatus);
		turnHome = false;
		$("#home").css("background-color", "green");
		$("#home").val("");
		objHand = visitorHand;
		objPlay = visitorPlay;
		objOtherHand = homeHand;
		objOtherPlay = homePlay;
		console.log('Change player from turnHome to turnVisitor');
		await sleep(2000);
	} else {
		turnHome = true;
		$("#home").css("background-color", "red");
		$("#home").val(atBatStatus);
		turnVisitor = false;
		$("#visitor").css("background-color", "green");
		$("#visitor").val("");
		objHand = homeHand;
		objPlay = homePlay;
		objOtherHand = visitorHand;
		objOtherPlay = visitorPlay;
		console.log('Change player from turnVisitor to turnHome');
		await sleep(2000);
	}
}

/**
 * valideren van de kaart 
 * @param {*} card 
 */
function validateCard(card) {
	let optionResult = 0 ; //mogelijk straks weer weghalen
	let outcomeText = '';
	//console.log('============================ inside validateCard', card);
	//console.log('============================ objOtherPlayCard   ', objOtherPlay.topCard());

	// check Deck op aantal kaarten
	checkDeck();

	switch (atBatStatus) {
		case 'pitch':
			if (card.faceCard) {
				outcome = 'BALL';
				rating = 1;
			} else {
				outcome = 'swing';
				rating = 2;
			}
			break;
		case 'swing':
			if (card.faceCard) {
				if (numStrikes < 2) {
					outcome = 'FOUL - STRIKE';
					rating = 1; // facecard bewaren ipv number-card??
					break;
				} else {
					outcome = '2-strike FOUL';
					rating = 3;
					break;
				}
			} else if (!eqSuit) {
				if ((objOtherPlay.topCard().rank >= 9) && (eqRank === true) && (eqColor === true)) {
					outcome = 'HBP';
					rating = 5;
					break;
				} else {
					outcome = 'STRIKE';
					rating = 2; // number-card eerder dan facecard S<2 ??
					break;
				}
			} else if (card.rank < objOtherPlay.topCard().rank) {
				outcome = 'BALL';
				rating = 4;
				break;
			} else {
				outcome = 'connect';
				rating = 6;
				break;
			}
		case 'connect':
			if (card.faceCard) {
				outcome = 'SAC';
				rating = 1;
				break;
			} else {
				if (isLongFly) {
					indFly ='[F]';
				}
				outcome = 'fielding';
				rating = 2;
				break;
			}
		case 'fielding':
			// die optionResult had eigenlijk een 'let' er voor staan
			optionResult = Math.abs(card.rank - objOtherPlay.topCard().rank);
			if (objOtherPlay.topCard().faceCard) { // connect = SAC
				if (card.faceCard) {
					if (eqSuit) {
						outcome = 'SAC DOUBLE PLAY';
						rating = 3;
						break;
					} else {
						outcome = 'SAC B:out R:adv';
						rating = 2;
						break;
					}
				} else {
					outcome = 'SAC B:safe R:adv';
					rating = 1;
					break;
				}
			} else if (card.faceCard) {  // connect is #1-10 and fielding faceCard					
				outcome = 'HOMERUN';
				rating = 1;
				break;
			} else { // connect is #1-10 and fielding is #1-10
				// berekening van eindresultaat obv biede #1-10 kaarten
				outcomeText = ': ' + outcome + optionResult;
				if (eqSuit) { // dezelfde suit
					optionResult = optionResult * 1;
					outcomeText = outcomeText + ' * 1 = ' + optionResult // + ' <=> eqSuit';
				} else if (eqColor) { // dezelfde kleur
					optionResult = optionResult * 2;
					outcomeText = outcomeText + ' * 2 = ' + optionResult // + ' <=> eqColor';
				} else {
					optionResult = optionResult * 3; // andere kleur
					outcomeText = outcomeText + ' * 3 = ' + optionResult  //+ ' <=> NOT eqSuit or eqColor';
				}

				switch (true) {
					case (optionResult > 9):
						outcome = 'HOMERUN' // + outcome;
						rating = 1;
						break;
					case (optionResult > 7):
						outcome = 'TRIPLE' // + outcome;
						rating = 2;
						break;
					case (optionResult > 5):
						outcome = 'DOUBLE' // + outcome;
						rating = 3;
						break;
					case (optionResult > 3):
						outcome = 'SINGLE' // + outcome;
						rating = 4;
						break;
					case (optionResult >= 0):
						outcome = 'OUT' // + outcome;
						rating = 5;
						break;
					default:
						outcome = '#NA#';
						rating = 0;
						break;
				}
			}
			break;
		default:
			outcome = '#NA#';
			rating = 0;
			break;
	} // end switch options on atBatStatus
	return [outcome, outcomeText, rating, optionResult];
}

/**
 * uitvoeren van de UITKOMST van validateCard
 * @param {*} outcome 
 */
async function executePlay(outcome) { // gebaseerd op de UITKOMST van validateCard 
	console.log('==============================>>>>> inside executePlay with outcome: ', outcome);
	switch (outcome) {
		case ('swing') :
			atBatStatus = 'swing';
			changePlayer();
			displayStatus(atBatStatus)
			// kaarten laten liggen
			break;
		case ('connect') :
			atBatStatus = 'connect';
			displayStatus(atBatStatus);
			break;
		case ('fielding') :
			atBatStatus = 'fielding';
			changePlayer();
			displayStatus(atBatStatus);
			break;
		case ('BALL') : // pitch of swing
			numBalls += 1;
			sendMessage ('BALL ' + numBalls);
			updateScoreboard();
			cleanRefill();
			await sleep(2000);
			if (atBatStatus == 'swing') {
				atBatStatus = 'pitch';
				changePlayer();
			}
			break;
		case ('STRIKE') :
			numStrikes += 1;
			sendMessage ('STRIKE ' + numStrikes);
			updateScoreboard();
			cleanRefill();
			await sleep(2000);
			atBatStatus = 'pitch';
			changePlayer();
			break;
		case ('HBP') :
			sendMessage ('Hit by Pitch');
			moveRunners('hbp');
			numBalls = 0 ;
			numStrikes = 0 ;
			updateScoreboard();
			cleanRefill();
			await sleep(2000);
			newBatter();
			break;
		case ('FOUL - STRIKE') :
			numStrikes += 1;
			sendMessage ('FOUL - STRIKE ' + numStrikes);
			updateScoreboard();
			hasComp = false;
			isCatchFoul = false;
			playCatchFoul();
			cleanRefill();
			await sleep(2000);
			atBatStatus = 'pitch';
			changePlayer();
			break;
		case ('2-strike FOUL') :
			sendMessage ('2-strike FOUL');
			hasComp = false; // deze drie stonden er eerst niet...
			isCatchFoul = false;
			playCatchFoul(); // en nu wel
			cleanRefill();
			await sleep(2000);
			atBatStatus ='pitch';
			changePlayer()
			break;
		case ('SAC') :
			sendMessage ('SAC attempt') ;
			atBatStatus = 'fielding';
			changePlayer()
			break;
		case ('SAC DOUBLE PLAY') :
			sendMessage ('SAC DOUBLE PLAY') ;
			moveRunners('sacDP');
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case ('SAC B:out R:adv') :
			sendMessage ('SAC B:out R:adv') ;
			moveRunners('sacBORA');
			cleanRefill()
			await sleep(2000);
			break;
		case ('SAC B:safe R:adv') :
			sendMessage ('SAC B:safe R:adv') ;
			moveRunners('sacBSRA');
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case ('HOMERUN') :
			sendMessage ('HOMERUN');
			moveRunners ('homerun');
			addHitsInning();
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case ('TRIPLE') :
			sendMessage ('TRIPLE');
			moveRunners ('triple');
			addHitsInning();
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case ('DOUBLE') :
			sendMessage ('DOUBLE');
			moveRunners ('double');
			addHitsInning();
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case ('SINGLE') :
			sendMessage ('SINGLE');
			moveRunners ('single');
			addHitsInning();
			cleanRefill()
			await sleep(2000);
			newBatter();
			break;
		case('OUT') :
			numOuts += 1;
			sendMessage('OUT');
			updateScoreboard();
			cleanRefill();
			await sleep(2000);
			newBatter();
			break;
		default:
			break;
	}
	checkAtBat();
	checkInning()
	updateScoreboard();
}

function addHitsInning() {
	vAtBat ? vHits++ : hHits++;
	hitsInning++;
}