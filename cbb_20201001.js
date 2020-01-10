
//Tell the library which element to use for the table
cards.init({table:'#card-table'});

//Create a new deck of cards
deck = new cards.Deck(); 
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 150;
deck.y -= -40;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all); 
//No animation here, just get the deck onto the table.
deck.render({immediate:true});

// discardPile voor gespeelde kaarten.
// deze moeten later weer worden toegevoegd aan deck
discardPile = new cards.Deck({faceUp:false});
discardPile.x -= 150;
discardPile.y -= 80;

//Now lets create a couple of hands, one face down (now up), one face up.
upperhand = new cards.Hand({faceUp:true, y:60});
lowerhand = new cards.Hand({faceUp:true, y:440});

upperPlay = new cards.Hand({faceUp:true, y:200});
lowerPlay = new cards.Hand({faceUp:true, y:300});

// TODO bepalen wie er begint door een kaart te trekken. de hoogste kaart bepaalt start field of atBat 
var turnLower = true; // in dev & test begint Lower met pitchen/veld
var turnUpper = false;

var objHand = lowerhand; // het zetten van de eerste speler, omdat
var objPlay = lowerPlay; // er nog geen functie voor de ad random selectie is
var atBatStatus = 'pitch';

numStrikes = 0;
numBalls = 0;

var endOfGame = false;

// activeren van het spel met de DEAL button (of Play Ball)
$('#deal').click(function() {
	//Deck has a built in method to deal to hands.
	$('#deal').hide();
	deck.deal(6, [upperhand, lowerhand], 50, function() {
		//This is a callback function, called when the dealing
		//is done.
		//discardPile.addCard(deck.topCard());
		//discardPile.render();
	});
})

// dit stukje code zorgt voor de game-loop
// vergelijk met sitepoint website of dat beter is
window.requestAnimationFrame(playBall);

function playBall(){
		//slagbeurt 
		console.log('playBall atBatStatus: ', atBatStatus);
		playCard(objHand, objPlay);		
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
}
// einde game-loop


/* TODO mogelijkheid:
playCard aansturen met welke hand er gespeeld mag worden:
playCard(lower) of playCard(upper) 
in functie afvangen met playCard(obj) {}

renderen van de kaarten buiten playValidate ???
zoals die website (www.sitepoint.com/quick-tip-game-loop-in-javascript/) eigenlijk ook doet
*/

// functie om kaart te klikken uit de hand die aan de beurt is.
function playCard(objHand, objPlay) { // kan dat ook op een 'naam' van het object-manier??
										// nu ontstaat er volgens mij een tweede object...
										// wellicht terugkopieren?
	objHand.click(function(card) {
		if (turnLower === true) {
			console.log ('turnLower: ', turnLower, 'turnUpper: ', turnUpper);
			objPlay.addCard(card);
			playRender();
			playValidate();
		} else {
			console.log ('turnLower else: ', turnLower);
		}
	});
}


function playValidate() {
	console.log('inside playValidate');
	// feitelijke controle op de kaart die als laatste aan lowerPlay of upperPlay is toegevoegd
	// dit gaat dan met topCard() gebeuren
	switch (atBatStatus) {
		case 'pitch':
			console.log('atBatStatus: ', 'pitch');
			console.log(objPlay.topCard().name);
			if (objPlay.topCard().rank >= 11) {
				console.log('BALL !!'); // onnozel als je geen 4-wijd wil gooien...
				numBalls += 1
				console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
				// cleanup playing hands !!
				moveCards(objPlay, discardPile);
				refillHand(objHand);
				// en die andere ook
				moveCards(upperPlay, discardPile); // die is waarschijnlijk leeg...
				refillHand(upperPlay);
				atBatStatus = 'pitch';
			} else {
				atBatStatus = 'swing';
				refillHand(objHand); // eerst aanvullen
				changePlayer(); // dan pas van speler wisselen
			}
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		case 'swing':
			console.log('atBatStatus: ', 'swing');
			console.log(objPlay.topCard().name);
			if (objPlay.topCard().suit != lowerPlay.topCard().suit) { // deze vergelijkig is niet goed...
				console.log('STRIKE');
				// cleanup playing hands !!
				numStrikes += 1;
				console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
				moveCards(objPlay, discardPile);
				// en die andere ook !!
				moveCards(lowerPlay, discardPile);
				atBatStatus = 'pitch';
				refillHand(objHand);
				changePlayer();
			} else if (objPlay.topCard().rank < lowerPlay.topCard().rank) {
					console.log('BALL !!');
					numBalls += 1
					console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
					// cleanup playing hands !!
					moveCards(objPlay, discardPile);
					refillHand(objHand);
					// en die andere ook
					moveCards(lowerPlay, discardPile); // die is waarschijnlijk leeg...
					refillHand(lowerPlay);
					atBatStatus = 'pitch';
			} else if (objPlay.topCard().rank >=11) {
					if (numStrikes <2) {
						console.log('STRIKE !!');
						numStrikes +=1;
						console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
						// cleanup playing hands !!
						moveCards(objPlay, discardPile);
						refillHand(objHand);
						// en die andere ook
						moveCards(lowerPlay, discardPile); // die is waarschijnlijk leeg...
						refillHand(lowerPlay);
						atBatStatus = 'pitch';
					} else {
						console.log('FOUL');
						console.log('Balls: ', numBalls, ' Strikes: ', numStrikes); // naar scoreboard
						// cleanup playing hands !!
						moveCards(objPlay, discardPile);
						refillHand(objHand);
						// en die andere ook
						moveCards(lowerPlay, discardPile); // die is waarschijnlijk leeg...
						refillHand(lowerPlay);
						atBatStatus = 'pitch';
					}
			} else {
				console.log('connect');
				atBatStatus = 'connect';
				refillHand(objHand);
			}							
			console.log('atBatStatus is now: ', atBatStatus);
			break;
		default:
			console.log('DEFAULT');
			endOfGame = true;
	}
}

// beurt wisselen
function changePlayer() {
	if (turnLower) {
		turnUpper = true;
		objHand = upperhand;
		objPlay = upperPlay;
	} else {
		turnLower = true;
		objHand = lowerhand;
		objPlay = lowerPlay;
	}
}

	/*if (lowerPlay.length !=0 && upperPlay.length !=0) {
		console.log ('beide hebben een kaart gelegd');
		endOfGame = true;
	} */


// functie om de Hand aan te vullen met een kaart van deck
function refillHand(objHand) {
	objHand.addCard(deck.topCard());
	playRender();
}

function playRender() {
	console.log(' inside playRender');
	deck.render();
	upperhand.render();
	upperPlay.render();
	lowerhand.render();
	lowerPlay.render();
}

// functie om een HAND met kaarten te verplaatsten
// hierin in blijkbaar niet voorzien in card.js
function moveCards(from, to) {
	for (let i=0; i < from.length; i++) {
		to.push(from[i]);
		from.splice(i,1);
		i--;
	}
	from.render();
	to.render();
}



function gameOver() {
	console.log('GAME OVER');
}

