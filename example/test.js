/**
 * Created by joe on 2016/10/26.
 */


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


console.log(getRandomIntInclusive(0,9));