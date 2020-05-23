function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function delayedGreeting(){
    console.log('Hello');
    await sleep(2000);
    console.log('World')
    await sleep(2000);
    console.log('Goodbye');
}

delayedGreeting();

console.log('Hasta la Pasta');

var baseRunners =[];
for (i=0; i<=3; i++) {
	baseRunners[i] = 0;
}

baseRunners[1] = 0;
baseRunners[2] = 1;
baseRunners[3] = 1;


console.log('Before');
for (i=0; i<=3; i++) {
    console.log('[',i,']',baseRunners[i]);
}

moveOnWalk_test();

console.log('After');
for (i=0; i<=3; i++) {
    console.log('[',i,']',baseRunners[i]);
}

function moveOnWalk_test() { //TODO dat loopt nog niet helemaal lekker
	// EIGENLIJK DEZELFDE ALS moveOnHBP ... DUS UNIVERSEEL MAKEN
	// verschillende situaties honken bezetting met case afwerken
	// geeft mogelijkheid van een break en uitslag is uniek
    // variant verzinnen op gedwongen opschuiven of door hit (of deze toch apart afhandelen)
    console.log('moveOnWalk_test start');
	if (baseRunners[1]==1) {
        console.log('[1]=1');
		if (baseRunners[2] == 1) {
            console.log('[2]=1');
			if (baseRunners[3]==1) {
                console.log('[3]=1');
				baseRunners[3] = 0;
				/* if (vAtBat) { //visitor scoort...
					vRun[inning]++;
				} else { // home scoort
					hRun[inning]++;
				} */    
            }             
			baseRunners[2] = 0;
			baseRunners[3] = 1;
        } 
        baseRunners[1] = 0;
		baseRunners[2] = 1;
	} 
	baseRunners[0] = 0;
    baseRunners[1] = 1;

    console.log('moveOnWalk_test end');
}

  
let rating = [];
for (let i=1 ; i <= 6 ; i++) {
    rating[i] = 10-i;
    console.log( i + ': ' + rating[i]);
}
console.log('2:' + rating[2])
rating =[]
console.log('2:' + rating[2])
for (let i=1 ; i <= 6 ; i++) {
    rating[i] = 10+i;
    console.log( i + ': ' + rating[i]);
}
console.log('2:' + rating[2])
rating =[]
console.log('2:' + rating[2])