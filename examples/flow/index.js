/* @flow */

//
// ```
// flow check
// ```
//
// Manage checker server
// ```
// flow start
// flow stop
// ```
//
// Compile to vanilla js
// ```
// jstransform --strip-types --harmony src/ build/
// jstransform --strip-types --harmony --watch src/ build/
// ```
//

function foo(x) {
  return x * 10;
}

//foo('Hello, world!');
foo(11);


var obj = {
  x: 1,
  y: '2'
};

//obj.x = '11';
//obj.y = 22;

var x: number = 1;
//var y: string = 1;
