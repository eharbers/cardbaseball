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
