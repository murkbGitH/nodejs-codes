#!/usr/bin/env node

var keypress = require('keypress');
var Rx = require('rx');

//
// 要件:
// 1. timer と keypress を merge する
// 2. 1 frame 内では、最初の 1 keypress だけ有効にする, 同frameの他keypressは破棄
// 3. 別途 timer のみを解釈する subscriber を定義する
//
// ----------------------
//
// !! 動くように見えるけどダメ !!
//
// - キーを連打すると、timerStream が止まることがある
// - かつ、keypress の subscribe 内で key が undefined になることもあった
//

var FPS = 2;
var MPF = 1000 / FPS;  // Milliseconds Per Frame?

//
// Copy from:
//   https://raw.githubusercontent.com/Reactive-Extensions/rx-node/master/index.js
//
var fromStreamForKeypress = function (stream, finishEventName) {
  stream.pause();

  finishEventName || (finishEventName = 'end');

  return Rx.Observable.create(function (observer) {
    function dataHandler (chr, key) {
      // 引数はひとつしか送れないみたい
      observer.onNext(key);
    }

    function errorHandler (err) {
      observer.onError(err);
    }

    function endHandler () {
      observer.onCompleted();
    }

    stream.addListener('keypress', dataHandler);
    stream.addListener('error', errorHandler);
    stream.addListener(finishEventName, endHandler);

    stream.resume();

    return function () {
      stream.removeListener('keypress', dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener(finishEventName, endHandler);
    };
  }).publish().refCount();
};

keypress(process.stdin);
process.stdin.setRawMode(true);
//process.stdin.resume();

var pauser = new Rx.Subject();

var timerSource = Rx.Observable
  .timer(0, MPF)
  .timeInterval()
;

//var keypressSource = fromStreamForKeypress(process.stdin).pausable(pauser);
var keypressSource = fromStreamForKeypress(process.stdin).pausable();

// !! 一度 キーを押すと、その後はそれが永遠に出力されてしまう
//var source = timerSource.withLatestFrom(
//  keypressSource,
//  function (timerData, key) {
//    console.log('*Key Input*');
//    return key;
//  }
//);


timerSource.subscribe(
  function(timerData) {
    //pauser.onNext(true);
    keypressSource.resume();
    console.log('Frame count:', timerData.value);
  },
  function (err) {
    console.log('Error(timerSource): ' + err);
  }
);

keypressSource.subscribe(
  function (key) {
    if (!pauser.isStopped) {
      //pauser.onNext(false);
      keypressSource.pause();
      console.log('Paused keypress');
    }
    console.log('Input key:', key.name);
    if (key && key.ctrl && key.name === "c") {
      process.exit(0);
    }
  },
  function (err) {
    console.log('Error: ' + err);
  },
  function () {
    console.log('Completed');
  }
);

//pauser.subscribe(
//  function(bool) {
//    console.log('onNext:', bool);
//  },
//  function (err) {
//    console.log('Error(pauser): ' + err);
//  }
//);

//pauser.onNext(true);
