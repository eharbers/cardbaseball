
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
upperhand = new cards.Hand({ faceUp: true, y: 60 });
lowerhand = new cards.Hand({ faceUp: true, y: 440 });

upperPlay = new cards.Hand({ faceUp: true, y: 200 });
lowerPlay = new cards.Hand({ faceUp: true, y: 300 });

// TODO bepalen wie er begint door een kaart te trekken. de hoogste kaart bepaalt start field of atBat 
var turnLower = true; // in dev & test begint Lower met pitchen/veld
$("#lower").css("background-color", "red");
var turnUpper = false;
$("#upper").css("background-color", "green");

var objHand = lowerhand; // het zetten van de eerste speler,
var objPlay = lowerPlay; // omdat er nog geen functie voor de ad random selectie is
var objOtherHand = upperhand // die ander moet ook herkend worden
var objOtherPlay = upperPlay // en deze andere ook
var atBatStatus = 'pitch';

var numStrikes = 0;
var numBalls = 0;
var numOuts = 0;
var inning = 0;
var vHits = 0; // wellicht niet een slimme keus
var vErrors = 0;
var hHits = 0;
var hErrors = 0;

var vRun = [];
vRun.push(0) // nulde element moet gevuld worden. verder innings-gewijs updaten
var hRun = [];
hRun.push(0) // nulde element moet gevuld worden. verder innings-gewijs updaten

var endOfGame = false;

// activeren van het spel met de DEAL button (of Play Ball)
$('#deal').click(function () {
	//Deck has a built in method to deal to hands.
	$('#deal').hide();
	deck.deal(6, [upperhand, lowerhand], 50, function () {
		//This is a callback function, called when the dealing
		//is done.
		sendMessage("PLAY BALL !!")
		inning++;
		vRun.push(0); // de bottom first wordt gevuld met 0. geeft de actieve slagbeurt aan
		updateScoreboard();
	});
})

// dit stukje code zorgt voor de game-loop
// vergelijk met sitepoint website of dat beter is
window.requestAnimationFrame(playBall);

function playBall() {
	//slagbeurt 
	console.log('playBall atBatStatus: ', atBatStatus);
	playCard(objHand, objPlay);	// deze moet blijkbaar hier uit...vanwege atBatStatus result	
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
}
// einde game-loop

// functie om kaart te klikken uit de hand die aan de beurt is.
function playCard(objHand, objPlay) { // kan dat ook op een 'naam' van het object-manier??
	// nu ontstaat er volgens mij een tweede object...
	// wellicht terugkopieren?
	objHand.click(function (card) {
		console.log('turnLower: ', turnLower, 'turnUpper: ', turnUpper);
		objPlay.addCard(card);
		objPlay.render();
		objHand.render();
		deck.render();
		playValidate();
	});
}


async function playValidate() {
	console.log('inside playValidate');
	// feitelijke controle op de kaart die als laatste aan lowerPlay of upperPlay is toegevoegd
	// dit gaat dan met topCard() gebeuren
	switch (atBatStatus) {
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
					changePlayer();
					atBatStatus = 'pitch'; // new pitch
				} else {
					sendMessage('2-strike FOUL'); // 2-strike foul
					await sleep(2000);
					moveCards(objPlay, discardPile); // cleanup playing hands !!
					moveCards(objOtherPlay, discardPile); // en die andere ook
					changePlayer();
					atBatStatus = 'pitch'; // new pitch
				}
			} else if (objPlay.topCard().suit != objOtherPlay.topCard().suit) { // suit ongelijk => strike
				numStrikes += 1;
				sendMessage('STRIKE ' + numStrikes);
				updateScoreboard();
				await sleep(2000);
				moveCards(objPlay, discardPile); // cleanup playing hands !!
				moveCards(objOtherPlay, discardPile); // en die andere ook !!
				atBatStatus = 'pitch'; // new pitch
				changePlayer();
			} else if (objPlay.topCard().rank < objOtherPlay.topCard().rank) { // lager dan pitch => ball
				numBalls += 1;
				sendMessage('BALL' + numBalls)
				updateScoreboard();
				console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
				// cleanup playing hands !!
				await sleep(2000);
				moveCards(objPlay, discardPile);
				// en die andere ook
				moveCards(objOtherPlay, discardPile); // die is waarschijnlijk leeg...
				atBatStatus = 'pitch'; // new pitch
				changePlayer();
			} else { // dezelfde suit geen plaatje en hoger dan pitch
				console.log('connecting with the ball');
				atBatStatus = 'connect';
				// go-to pick card to place hit
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		case 'connect':
			console.log('atBatStatus: ', atBatStatus);
			refillHand(objHand);
			// a card is picked to place hit
			atBatStatus = 'fielding';
			changePlayer();
			break;
		case 'fielding': // er zal een reactie van het veld moeten komen
			console.log('atBatStatus: ', atBatStatus);
			refillHand(objHand);
			atBatStatus = 'result';
			playValidate(); // deze moet hier, om de click-card te omzeilen
			break;
		case 'result': // berekening van het resultaat van de connect vs fielding
			console.log('inside RESULT');
			console.log('atBatStatus: ', atBatStatus);
			var result = Math.abs(objPlay.topCard().rank - objOtherPlay.topCard().rank);
			console.log('result is now:', result);
			console.log('objPlay color: ', cardColor(objPlay.topCard()))
			console.log('objOtherPlay color: ', cardColor(objOtherPlay.topCard()))
			if (cardColor(objPlay.topCard()) != cardColor(objOtherPlay.topCard())) { // ongelijke kleur
				result = result * 3;
				console.log('result * 3:', result);
			} else if (objPlay.topCard().suit === objOtherPlay.topCard().suit) { // dezelfde suit
				result = result * 1;
				console.log('result * 1: ', result);
			} else {
				result = result * 2; // andere suit en dezelfde kleur
				console.log('result * 1: ', result);
			}
			console.log('Eind result: ', result);

			switch (true) {
				case (result > 9):
					sendMessage('HOME RUN')
					moveRunners();
					break;
				case (result > 7):
					sendMessage('TRIPLE');
					moveRunners();
					break;
				case (result > 5):
					sendMessage('DOUBLE');
					moveRunners()
					break;
				case (result > 3):
					sendMessage('SINGLE');
					moveRunners();
					break;
				case (result > 0):
					sendMessage('OUT');
					console.log('no runner to move (yes)');
					numOuts += 1; // en daar hoort ook een check voor 3 out bij
					updateScoreboard();
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
			numStrikes = 0;
			numBalls = 0;
			updateScoreboard();
			atBatStatus = 'pitch' // nieuwe slagman
			break;
		default:
			console.log('playValidate default');
			endOfGame = true;
			break;
	}
	// check met strikes, balls, outs & innings

}

// beurt wisselen
function changePlayer() {
	if (turnLower) {
		turnUpper = true;
		$("#upper").css("background-color", "red");
		turnLower = false;
		$("#lower").css("background-color", "green");
		objHand = upperhand;
		objPlay = upperPlay;
		objOtherHand = lowerhand;
		objOtherPlay = lowerPlay;
	} else {
		turnLower = true;
		$("#lower").css("background-color", "red");
		turnUpper = false;
		$("#upper").css("background-color", "green");
		objHand = lowerhand;
		objPlay = lowerPlay;
		objOtherHand = upperhand;
		objOtherPlay = upperPlay;
	}
}

// functie om de Hand aan te vullen met een kaart van deck
function refillHand(objHand) {
	objHand.addCard(deck.topCard());
	objHand.render();
	deck.render();
}

// functie om een HAND met kaarten te verplaatsten
// hierin in blijkbaar niet voorzien in card.js
function moveCards(from, to) {
	//sleep(5000) // stopt ie of gaat ie wel door met andere dingen
	for (let i = 0; i < from.length; i++) {
		to.push(from[i]);
		from.splice(i, 1);
		i--;
	}
	from.render();
	to.render();
}


// sitepoint sleep function met async ...await
// https://www.sitepoint.com/delay-sleep-pause-wait/
// de functie die moet een slaapmoment moet hebben wordt vooraf gegaan met async
// in de functie wordt het slaapmoment aangeroepen met await sleep(ms)
// zie de movecards aanroepen
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function cardColor(kaart) { // blijkbaar geen eigenschap van de kaart
	if (kaart.suit === 'd' || kaart.suit === 'c') {
		var color = 'red';
	} else {
		var color = 'black';
	}
	return color;
}

function moveRunners() {
	console.log('inside moveRunners');
	//sendMessage('move runners');
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

function sendMessage(message) {
	document.getElementById("messageboard").innerHTML = message;
}

function gameOver() {
	console.log('GAME OVER');
}

