
//Tell the library which element to use for the table
cards.init({table:'#card-table'});

//Create a new deck of cards
deck = new cards.Deck(); 
//By default it's in the middle of the container, put it slightly to the side
deck.x -= 150;

//cards.all contains all cards, put them all in the deck
deck.addCards(cards.all); 
//No animation here, just get the deck onto the table.
deck.render({immediate:true});

//Now lets create a couple of hands, one face down, one face up.
upperhand = new cards.Hand({faceUp:true, y:60});
lowerhand = new cards.Hand({faceUp:true, y:440});

upperPlay = new cards.Hand({faceUp:true, y:200});
lowerPlay = new cards.Hand({faceUp:true, y:300});

// TODO bepalen wie er begint door een kaart te trekken. de hoogste kaart bepaalt start field of atBat 
var turnLower = true; // in dev & test begint Lower met pitchen/veld
var turnUpper = false;

var endOfGame = false;


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
		//start slagbeurt
		playCard();
		if (lowerPlay.length !=0 && upperPlay.length !=0) {
			console.log ('beide hebben een kaart gelegd');
			//endOfGame = true;
		}
	if (endOfGame === true) { // dit stukje zorgt voor de herhaling, todat endOfGame 'waar' is
		gameOver();
	} else {
		window.requestAnimationFrame(playBall);
	}
}
// einde game-loop

//When you click on the top card of a deck, a card is added
//to your hand
/* deck.click(function(card){
	if (card === deck.topCard()) {
		lowerhand.addCard(deck.topCard());
		lowerhand.render();
	}
}); */

function playCard() {

/* mogelijkheid:
playCard aansturen met welke hand er gespeeld mag worden:
playCard(lower) of playCard(upper) 
in functie afvangen met playCard(obj) {}

de click functie is er dan nog maar eentje, nl:

obj.click(function(card) {

});

het wisselen van speler gebeurd dan wellicht in de playValidate

renderen van de kaarten buiten playValidate
zoals die website (www.sitepoint.com/quick-tip-game-loop-in-javascript/) eigenlijk ook doet
*/

lowerhand.click(function(card) {
	if (turnLower === true) {
		console.log ('turnLower: ', turnLower);
		lowerPlay.addCard(card);
		playRender();
		turnLower = false;
		turnUpper = true;
		playValidate();
	} else {
		console.log ('turnLower else: ', turnLower);
	}
});

upperhand.click(function(card) {
	if (turnUpper === true) {
		console.log('turnUpper: ', turnUpper);
		upperPlay.addCard(card);
		playRender();
		turnUpper = false;
		turnLower = true;
		playValidate();
	} else {
		console.log('turnUpper else: ', turnUpper);
	}
});
}


function playValidate() {
	console.log('inside playValidate');
}

function playRender() {
	console.log(' inside playRender');
	deck.render();
	upperhand.render();
	upperPlay.render();
	lowerhand.render();
	lowerPlay.render();
}

function gameOver() {
	console.log('GAME OVER');
}
