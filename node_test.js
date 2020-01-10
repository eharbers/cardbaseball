console.log('Rest-test');

var objEen = new Object(),
    str = 'objEen',
    rand = Math.random();

var objTwee = new Object(),
    str = 'objTwee',
    rand = Math.random();

var objDrie = new Object(),
    str = 'ObjDrie',
    rand = Math.random();

function printObject (...dingen) {
    dingen.forEach(element => {
        console.log(element.str);
    });
}


printObject(objEen, objDrie, objTwee);