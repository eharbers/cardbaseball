
//Tell the library which element to use for the table
cards.init({ table: '#card-table' });

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
var atBatStatus = 'pitch';

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
var baseRunners =[];
for (i=0; i<=3; i++) {
	baseRunners[i] = 0;
}
var play = '';
renderRunners();

// voor de bepaling van de plays in playValidate
var eqRank = false;
var eqColor = false;
var eqSuit = false;
var isFace = false;

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

var checkOptionsFlag = true;

var endOfGame = false;

// activeren van het spel met de DEAL button (of Play Ball)
$('#deal').click(function () {
	//Deck has a built in method to deal to hands.
	$('#deal').hide();
	deck.deal(6, [visitorHand, homeHand], 50, function () {
		//This is a callback function, called when the dealing
		//is done.
		sendMessage("PLAY BALL !!")
		//halfInning = 1;
		//inning = Math.floor(halfInning / 2);
		inning = 1;
		vRun.push(0); // de bottom first wordt gevuld met 0. geeft de actieve slagbeurt aan
		updateScoreboard();
		baseRunners[0] = 1;
		renderRunners();
		countCategories();
	});
})

// dit stukje code zorgt voor de game-loop
// vergelijk met sitepoint website of dat beter is
window.requestAnimationFrame(playBall);

function playBall() {
	//slagbeurt 
	console.log('playBall atBatStatus: ', atBatStatus);
	playCard();	// deze moet blijkbaar hier uit...vanwege atBatStatus result	
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
}
// einde game-loop

// functie om kaart te klikken uit de hand die aan de beurt is.
function playCard() { // kan dat ook op een 'naam' van het object-manier??
	// nu ontstaat er volgens mij een tweede object...
	// wellicht terugkopieren?
	if (checkOptionsFlag == true) {checkOptions(objHand)};
	objHand.click(function (card) { // click op HAND die aan de beurt is, heeft effect
		var playable = false
		for (i=0 ; i < objHand.length; i++) {
			if ( card === objHand[i]) {
				playable = true;
				console.log('playable:', playable);
			};
		} // end for
		if (playable === true) { //valid card/player 	
			console.log('turnHome: ', turnHome, 'turnVisitor: ', turnVisitor);
			objPlay.addCard(card);
			objPlay.render();
			objHand.render();
			deck.render();
			playValidate();
		} else {
			console.log('playable:', playable);
			console.log('Op beurt wachten');
			var msgBeurt = "WACHTEN !";
			if (turnHome) {
				$("#visitor").val(msgBeurt);
			} else {
				$("#home").val(msgBeurt);
			}
		}
	}); // end click objHand
	//checkDeck();
}

// functie om het resultaat van elke kaar in hand te geven, zou deze gespeeld worden
function checkOptions(hand) {
	checkOptionsFlag = false; // vlag om te voorkomen dat het steeds in playCard wordt uitgevoerd
	for (let i=0; i< hand.length; i++) {
		console.log(cardColor(hand[i]), hand[i].shortName);
	}
}

function checkAtBat() {
	console.log('Inside checkAtBat');
	checkOptionsFlag = true; // vlag terugzetten zodat deze volgende keer met playCard kan worden uitgevoerd

	if (numStrikes === 3) {
		console.log('strik-out');
		sendMessage('STRIKE-OUT');
		numStrikes=0;
		numBalls=0;
		numOuts++
	}

	if (numBalls === 4) {
		console.log('walk');
		sendMessage('WALK');
		moveRunners('walk');
		numStrikes=0;
		numBalls=0;
	}
}

function checkInning() {
	console.log('Inside checkInning');
	if (numOuts === 3 ) {
		sendMessage('3-OUTS Change fields')
		if (vAtBat) {
			vAtBat = false;
			hAtBat = true;
			hRun[inning]=0;
		} else {
			hAtBat = false;
			vAtBat = true;
			inning++;
			vRun[inning]=0;
		}
		for (i=0; i<=3; i++) {
			baseRunners[i] = 0;
		}
		baseRunners[0] = 1;
		renderRunners();
		numOuts= 0;
		changePlayer();
		atBatStatus = 'pitch';
	}
}

async function playValidate() {
	console.log('inside playValidate');
	// feitelijke controle op de kaart die als laatste aan homePlay of visitorPlay is toegevoegd
	// dit gaat dan met topCard() gebeuren
	// refillHand(objHand); // speelhand aanvullen....maar te vaak als ie hier staat
	checkDeck(); //staat ie hier beter??

	// bepaal de overeenkomstigheden (equals)
	detEquals();
	
	
	switch (atBatStatus) {
		// de pitch
		case 'pitch':
			console.log('atBatStatus: ', 'pitch');
			refillHand(objHand); // speelhand aanvullen
			if (objPlay.topCard().rank >= 11) { // een plaatje => ball
				numBalls += 1;
				sendMessage('BALL ' + numBalls); // onnozel als je geen 4-wijd wil gooien...
				updateScoreboard() // naar scoreboard
				await sleep(2000);
				moveCards(objPlay, discardPile); // cleanup playing hands !!
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
			refillHand(objHand);
			if (objPlay.topCard().rank >= 11) { // plaatje => foul
				if (numStrikes < 2) { // <2 => strike
					numStrikes += 1;
					sendMessage('FOUL - STRIKE ' + numStrikes);
					updateScoreboard();
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook
					atBatStatus = 'pitch'; // new pitch
					changePlayer();					
				} else {
					sendMessage('2-strike FOUL'); // 2-strike foul
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
				}
			} else if (eqSuit === false) { // HBP of strike
				// de pitch >=9; de swing is gelijke rank en gelijke kleur (het is al niet meer dezelfde suit)
				if((objOtherPlay.topCard().rank >=9) && (eqRank === true)  && (eqColor === true)) {
					console.log('Hit by Pitch');
					sendMessage('Hit by Pitch');
					moveOnHBP();
					await sleep(2000);
					moveCards(objPlay, discardPile);
					moveCards(objOtherPlay, discardPile);
					numBalls = 0; //new batter
					numStrikes = 0;//new batter
					updateScoreboard();
					atBatStatus= 'pitch'; // new batter
					changePlayer();
					break;
				} else {
					numStrikes += 1;
					sendMessage('STRIKE ' + numStrikes);
					updateScoreboard();
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook !!
					atBatStatus = 'pitch'; // new pitch
					changePlayer();
					break;
				}	
			} else if (objPlay.topCard().rank < objOtherPlay.topCard().rank) { // lager dan pitch => ball
				numBalls += 1;
				sendMessage('BALL' + numBalls)
				updateScoreboard();
				await sleep(2000);
				moveCards(objPlay, discardPile); // cleanup playing hands !!
				// en die andere ook
				moveCards(objOtherPlay, discardPile); // die is waarschijnlijk leeg...
				atBatStatus = 'pitch'; // new pitch
				changePlayer();
			} else { // dezelfde suit geen plaatje en hoger dan pitch
				console.log('connecting with the ball');
				atBatStatus = 'connect';
				if (turnHome) {
					$("#home").val(atBatStatus);
				} else {
					$("#visitor").val(atBatStatus);
				}
				// go-to pick card to place hit
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		// de connect
		case 'connect': // een kaart kiezen : hoe geslagen
			console.log('atBatStatus: ', atBatStatus);
			refillHand(objHand);
			// a card is picked to place hit
			atBatStatus = 'fielding';
			changePlayer();
			break;
		case 'fielding': // een kaart kiezen : hoe verwerkt
			console.log('atBatStatus: ', atBatStatus);
			refillHand(objHand);
			atBatStatus = 'result';
			if (turnHome) {
				$("#home").val(atBatStatus);
			} else {
				$("#visitor").val(atBatStatus);
			}
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
			if (objPlay.topCard().rank >=11) { // sacrifice
				//TODO kan niet met bases loaded of alleen loper op 3 !! => afvangen van tevoren??
				console.log('sacrifice attempt')
				// plaatje van dezelfde suit
				if ((objOtherPlay.topCard().rank >=11) && (eqSuit === true)) {
					console.log('hit into double play !!');
					sendMessage('hit into double play');
					// batter is out and runner out... de verste loper
					break;
				} else if (objOtherPlay.topCard().rank >= 11 && (eqSuit === false)) {
					console.log('sacrifice success !!');
					sendMessage('sacrifice success !!');
					// batter out and runner(s) advance ... kan niet met bases loaded, maar wel 1 en 3
					break;
				} else if (objOtherPlay.topCard().rank <11) {
					console.log('sacrifice super-succes');
					sendMessage('sacrifice super-succes');
					// batter is safe and runner(s) advance
					break;
				}
				//TODO het opruimen gaat niet lekker
				console.log('start sleep(2000)');
				await sleep(2000);
				moveCards(objPlay, discardPile);
				moveCards(objOtherPlay, discardPile);		
				atBatStatus = 'pitch' // nieuwe slagman
				baseRunners[0] = 1;
				renderRunners();
				numStrikes = 0; // hoort dit bij checkAtBAt??
				numBalls = 0; // of hoort dat op deze plek???????
				if (turnHome) {
					$("#home").val(atBatStatus);
				} else {
					$("#visitor").val(atBatStatus);
				}
			} // einde sacrifice

			if (eqColor === false) { // ongelijke kleur
				result = result * 3;
				console.log('result * 3:', result);
			} else if (eqSuit === true) { // dezelfde suit
				result = result * 1;
				console.log('result * 1: ', result);
			} else {
				result = result * 2; // andere suit en dezelfde kleur
				console.log('result * 2: ', result);
			}
			console.log('Eind result: ', result);
		


			switch (true) { // result met kernwoord naar moverunners sturen ipv numBases
				case (result > 9):
					sendMessage('HOME RUN');
					moveRunners('homerun');
					break;
				case (result > 7):
					sendMessage('TRIPLE');
					moveRunners('triple');
					break;
				case (result > 5):
					sendMessage('DOUBLE');
					moveRunners('double');
					break;
				case (result > 3):
					sendMessage('SINGLE');
					moveRunners('single');
					break;
				case (result >= 0):
					sendMessage('OUT');
					console.log('no runner to move (yes)');
					numOuts += 1; // en daar hoort ook een check voor 3 out bij
					updateScoreboard(); // naar game-loop ??
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
			atBatStatus = 'pitch' // nieuwe slagman
			baseRunners[0] = 1;
			renderRunners();
			numStrikes = 0; // hoort dit bij checkAtBAt??
			numBalls = 0; // of hoort dat op deze plek???????
			if (turnHome) {
				$("#home").val(atBatStatus);
			} else {
				$("#visitor").val(atBatStatus);
			}
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
} // einde playExecute

// beurt wisselen
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

