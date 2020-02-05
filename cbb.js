
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

function checkAtBat() {
	console.log('Inside checkAtBat');
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

async function checkDeck() { // TODO hier gaat nog iets fout...maar inmiddels beter
	console.log('Inside checkDeck: ',deck.length);
	if (deck.length < 7) {
		console.log('Het worden er te weinig')
		moveCards(discardPile, deck)
		await sleep(2000); // helpt dit bij pile2deck
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
}

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

function countCategories() { //TODO Denom wordt verkeerd geteld, maar is volgend my niet erg...
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
	if (baseRunners[1]=1) {
		if (baseRunners[2] = 1) {
			if (baseRunners[3]=1) {
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
	baseRunners[0] = 0;
	baseRunners[1] = 1;
}

function moveOnHBP() {
	console.log('Inside moveOnHBP');
	console.log('Hetzelfde als moveOnWalk');
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
	await sleep(2000);
	document.getElementById("messageboard").innerHTML = "";
}

function gameOver() {
	console.log('GAME OVER');
}

