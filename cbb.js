
//Tell the library which element to use for the table
cards.init({ table: '#card-table' });
let playAI = false;
let showCards = true; // met toggleCards-button bedienen

//Create a new deck of cards
deck = new cards.Deck();
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 150;
deck.y -= -40;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all);
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
var turnHome = true; // in dev & test begint Lower met pitchen/veld
$("#home").css("background-color", "red");
$("#home").val('pitch');
var turnVisitor = false;
$("#visitor").css("background-color", "green");

var objHand = homeHand; // het zetten van de eerste speler,
var objPlay = homePlay; // omdat er nog geen functie voor de ad random selectie is
var objOtherHand = visitorHand // die ander moet ook herkend worden
var objOtherPlay = visitorPlay // en deze andere ook
var atBatStatus = '';

// voor de initiatie van de baseballgame
var numStrikes = 0;
var numBalls = 0;
var numOuts = 0;
var halfInning = 0;
var inning = 0;

// voor de bepaling van wie er aan de beurt is om een kaart te klikken
var vAtBat = true;
var hAtBat = false;

// voor de initiatie van de honklopers
var numBases = 0; // aantal honken op geslagen bal (of walk...)
var baseRunners = [];
for (i = 0; i <= 3; i++) {
	baseRunners[i] = 0;
}
var play = '';
renderRunners();

// voor de bepaling van de plays in playValidate
var eqRank = false;
var eqColor = false;
var eqSuit = false;
var isFace = false;

// voor de bepaling van Error en CacthFoul in playValidate
let hasComp = false;
let isError = false;
let isCatchFoul = false;

// voor de telling van de categories in playValidate per Hand
var vFace = 0;
var vCompanion = 0;
var vDenomination = 0;

var hFace = 0;
var hCompanion = 0;
var hDenomination = 0;

// voor de initiatie van het scoreboard
var vRun = [];
vRun.push(0) // nulde element moet gevuld worden. verder halve-innings-gewijs updaten
var hRun = [];
hRun.push(0) // nulde element moet gevuld worden. verder halve-innings-gewijs updaten

var vHits = 0;
var vErrors = 0;
var hHits = 0;
var hErrors = 0;

var hitsInning = 0; // minimum 2 Hits in inning voor relief pithers inzet
var hReliever = false; // max 1 per game
var vReliever = false; // max 1 per game
var checkRelieverFlag = true; // mag er gecheckt worden

var checkOptionsFlag = true;
var checkFaceCardsFlag = true;

// NB knop
let newBallFlag = false;
$('#hNB').hide();
$('#vNB').hide();
// RP knop
$('#hRP').hide();
$('#vRP').hide();


// endOfGame indicator
var endOfGame = false;


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
	//console.log('deal clicked');
	//sendMessage('deal clicked');
	//console.log('AI = ' + playAI);
	//sendMessage('AI = ' + playAI);
	//Deck has a built in method to deal to hands.
	$('#deal').hide();
	$('#aiDeal').hide();
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
	sendMessage('New Balls request');
})

// afhandelen van het klikken op visitor NB-button voor new balls
$('#vNB').click(function () {
	//console.log('vNB-clicked');
	newBallFlag = true;
	//console.log('newBallFlag = true');
	atBatStatus = 'newball';
	turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
	sendMessage('New Balls request');
})

// afhandelen van het klikken op home RP-button voor Relief Pitcher
$('#hRP').click(function () {
	//console.log('hRP-clicked');	
	sendMessage('Relief Pitcher');
	hReliever = true; // de reliever is ingezet
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
	playCard();	// deze moet blijkbaar hier uit...vanwege atBatStatus result	
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
}
// einde playBall

/**
 * functie om kaart te klikken uit de hand die aan de beurt is.
 */
function playCard() { // kan dat ook op een 'naam' van het object-manier??
	// nu ontstaat er volgens mij een tweede object...
	// wellicht terugkopieren?
	if (checkOptionsFlag == true) { checkOptions(objHand) };
	if ((checkFaceCardsFlag == true) && (atBatStatus == 'pitch')) { checkNumFaceCards(objHand) };

	if ((checkRelieverFlag == true) && hitsInning >= 2) {
		if (vAtBat === true && hReliever == false ) {
			checkReliever();
		} else if ( hAtBat === true && vReliever === false) {
			checkReliever();
		}		
	}


	objHand.click(function (card) { // click op HAND die aan de beurt is, heeft effect
		document.getElementById("messageboard").innerHTML = "";
		var playable = false
		for (i = 0; i < objHand.length; i++) { // om te testen of de geklikte card van de play-Hand is
			if (card === objHand[i]) {
				playable = true;
				//console.log('playable:', playable);
			};
		} // end test voor playable
		if (playable === true) { //valid card/player 
			//console.log('turnHome: ', turnHome, 'turnVisitor: ', turnVisitor);
			objPlay.addCard(card);
			objPlay.render();
			objHand.render();
			deck.render();
			playValidate();
		} else {
			//console.log('playable:', playable);
			//console.log('Op beurt wachten');
			var msgBeurt = "WACHTEN !";
			if (turnHome) {
				$("#visitor").val(msgBeurt);
			} else {
				$("#home").val(msgBeurt);
			}
		}
	}); // end click objHand (of objOtherHand)
	//checkDeck();
} // end playCard



/**
 * controleren van de slagbeurt
 */
function checkAtBat() {
	console.log('Inside checkAtBat');
	checkOptionsFlag = true; // vlag terugzetten zodat deze volgende keer met playCard kan worden uitgevoerd
	checkFaceCardsFlag = true // vlag terugzetten
	if (numStrikes === 3) {
		//console.log('strik-out');
		sendMessage('STRIKE-OUT');
		numStrikes = 0;
		numBalls = 0;
		numOuts++
	}

	if (numBalls === 4) {
		//console.log('walk');
		sendMessage('WALK');
		moveRunners('walk');
		numStrikes = 0;
		numBalls = 0;
	}
}

/**
 * controlen van de  inning
 */
function checkInning() {
	console.log('Inside checkInning');
	if (numOuts === 3) {
		sendMessage('3-OUTS Change fields')
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
		baseRunners[0] = 1;
		renderRunners();
		numOuts = 0;
		changePlayer();
		if (objHand.length >6 || objOtherHand.length > 6) {
			atBatStatus = 'decrease'
			sendMessage('decrease to 6 cards');
			turnHome ? $("#home").val(atBatStatus) : $("#visitor").val(atBatStatus);
		}
		atBatStatus = 'pitch';
	}
}

/**
 * obv atBatStatus de uit te voeren play bepalen
 */
async function playValidate() {
	console.log('inside playValidate');
	// feitelijke controle op de kaart die als laatste aan homePlay of visitorPlay is toegevoegd
	// dit gaat dan met topCard() gebeuren

	checkDeck(); //staat ie hier beter??

	// bepaal de overeenkomstigheden (equals)
	detEquals();

	switch (atBatStatus) {
		case 'newball':
			sendMessage('New Balls request');
			if (objPlay.length == 2) {

				// testen of beide kaarten faceCards zijn
				let numNewBallFaceCards = 0;
				for (let i=0; i < objPlay.length; i++) {
					if (objPlay[i].rank >= 11) { 
						numNewBallFaceCards ++
					}
				}

				// afhankelijk van uitkomst test
				// de faceCards naar Pile en twee nieuwe van Deck
				// of terug naar Hand
				if (numNewBallFaceCards == 2) {
					//console.log('atBatStatus: newball');
					await sleep(2000);
					moveCards(objPlay, discardPile);
					refillHand(objHand);
					await sleep(1000);
					refillHand(objHand);
					atBatStatus = 'pitch'; // new pitch
					displayStatus(atBatStatus);
					sendMessage('Play Ball!');
				} else {
					sendMessage('2 Face-cards needed for New Balls');
					await sleep(1000)
					moveCards(objPlay, objHand);
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
				case (handLength = 6):
					atBatStatus = 'pitch';
					sendMessage('Play Ball!');
					displayStatus(atBatStatus);
					break;
			}
			break;
		// de pitch
		case 'pitch':
			console.log('atBatStatus: ', 'pitch');
			if (objPlay.topCard().rank >= 11) { // een plaatje => ball
				numBalls += 1;
				sendMessage('BALL ' + numBalls); // onnozel als je geen 4-wijd wil gooien...
				updateScoreboard() // naar scoreboard
				await sleep(2000);
				moveCards(objPlay, discardPile); // cleanup playing hands !!
				refillHand(objHand); // speelhand aanvullen
				atBatStatus = 'pitch'; // new pitch
			} else {
				atBatStatus = 'swing'; // kaarten laten liggen
				changePlayer(); // dan pas van speler wisselen
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		// de swing
		case 'swing':
			console.log('atBatStatus: ', 'swing');
			if (objPlay.topCard().rank >= 11) { // plaatje => foul
				if (numStrikes < 2) { // <2 => strike
					numStrikes += 1;
					sendMessage('FOUL - STRIKE ' + numStrikes);
					updateScoreboard();
					await sleep(2000);

					// CatchFoul-card in DEFFENSE-HAND en toepassen ??
					hasComp = false;
					isCatchFoul = false;
					playCatchFoul(); // zo ja,  dan ben je OUT !!

					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook
					refillHand(objOtherHand);
					refillHand(objHand);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
				} else {
					sendMessage('2-strike FOUL'); // 2-strike foul
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook
					refillHand(objOtherHand);
					refillHand(objHand);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
				}
			} else if (eqSuit === false) { // HBP of strike
				// de pitch >=9; de swing is gelijke rank en gelijke kleur (het is al niet meer dezelfde suit)
				if ((objOtherPlay.topCard().rank >= 9) && (eqRank === true) && (eqColor === true)) {
					console.log('Hit by Pitch');
					sendMessage('Hit by Pitch');
					moveRunners('hbp');
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook !!
					refillHand(objOtherHand);
					refillHand(objHand);
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
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook !!
					refillHand(objOtherHand);
					refillHand(objHand);
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
					break;
				}
			} else if (objPlay.topCard().rank < objOtherPlay.topCard().rank) { // lager dan pitch => ball
				numBalls += 1;
				sendMessage('BALL ' + numBalls)
				updateScoreboard();
				await sleep(2000);
				moveCards(objPlay, discardPile); // cleanup playing hands !!
				moveCards(objOtherPlay, discardPile); // en die andere ook
				refillHand(objOtherHand); 
				refillHand(objHand);
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
			atBatStatus = 'fielding';
			changePlayer();
			break;
		case 'fielding': // een kaart kiezen : hoe verwerkt
			console.log('atBatStatus: ', atBatStatus);
			await sleep(2000);

			// Error-card in OFFENSE-HAND en toepassen ??
			hasComp = false;
			isError = false;
			playError();

			atBatStatus = 'result';
			displayStatus(atBatStatus);
			playValidate(); // deze moet hier, om de click-card te omzeilen
			break;
		// result
		case 'result': // berekening van het resultaat van de connect vs fielding
			console.log('inside RESULT');
			console.log('atBatStatus: ', atBatStatus);
			var result = Math.abs(objPlay.topCard().rank - objOtherPlay.topCard().rank);
			console.log('result is now:', result);
			console.log('objPlay color: ', cardColor(objPlay.topCard()))
			console.log('objOtherPlay color: ', cardColor(objOtherPlay.topCard()))

			// verwerking van bijzondere connect-kaart of bijzondere connect-fielding-combi

			// sacrifice alleen met 1 of 2 of 1 en 2 bezet.of 1 en 3; bases loaded en alleen loper op 3 kan niet
			// dus iets met baseRunners[i] doen en zo... 
			if (objOtherPlay.topCard().rank >= 11) { // sacrifice
				//TODO kan niet met bases loaded of alleen loper op 3 !! => afvangen van tevoren??
				console.log('sacrifice attempt')
				// plaatje van dezelfde suit
				if ((objPlay.topCard().rank >= 11) && (eqSuit === true)) {
					console.log('SAC: double play');
					sendMessage('SAC: double play');
					moveRunners('sacDP');
					// batter is out and runner out... de verste loper
					break;
				} else if (objPlay.topCard().rank >= 11 && (eqSuit === false)) {
					console.log('SAC: B:out R:adv');
					sendMessage('SAC: B:out R:adv');
					moveRunners('sacBORA');
					// batter out and runner(s) advance ... kan niet met bases loaded, maar wel 1 en 3
					break;
				} else if (objPlay.topCard().rank < 11) {
					console.log('SAC: B:safe R:adv');
					sendMessage('SAC: B:safe R:adv');
					moveRunners('sacBSRA');
					// batter is safe and runner(s) advance
					break;
				}
				console.log('start sleep(2000)');
				await sleep(2000);
				moveCards(objPlay, discardPile);
				moveCards(objOtherPlay, discardPile);
				atBatStatus = 'pitch' // nieuwe slagman
				baseRunners[0] = 1;
				renderRunners();
				numStrikes = 0; // hoort dit bij checkAtBAt??
				numBalls = 0; // of hoort dat op deze plek???????
				displayStatus(atBatStatus);
			} // einde sacrifice

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
						sendMessage('OUT');
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
			console.log('start sleep(2000)');
			await sleep(2000);
			moveCards(objPlay, discardPile);
			moveCards(objOtherPlay, discardPile);
			refillHand(objOtherHand);
			refillHand(objOtherHand);
			if (isError) {
				refillHand(objOtherHand);
			}
			refillHand(objHand);
			refillHand(objHand);
			if (isCatchFoul) {
				refillHand(objHand);
			}
			atBatStatus = 'pitch' // nieuwe slagman
			baseRunners[0] = 1;
			renderRunners();
			numStrikes = 0; // hoort dit bij checkAtBAt??
			numBalls = 0; // of hoort dat op deze plek???????
			displayStatus(atBatStatus);
			break;
		default:
			console.log('playValidate default');
			endOfGame = true;
			break;
	}
	// check met strikes, balls, outs & innings
	// die staat nu in de game-loop
	checkAtBat();
	checkInning();
	updateScoreboard(); // naar game-loop ??
} // einde playValidate

/**
 * New Balls voor pitcher tegen inlevering van 2 faceCards
 */
function newBall() {
	console.log('inside newBall');
} //einde click functie


/**
 * van speelbeurt wisselen
 * en aansturing indicator
 * met atBatStatus
 */
function changePlayer() {

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
	}
}

