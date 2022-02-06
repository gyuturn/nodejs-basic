// function a(){
//     console.log('A');
// }

//함수가 값이다.
var a=function (){
    console.log('A');
}

function slowfunc(callback){
    callback();
}

slowfunc(a);