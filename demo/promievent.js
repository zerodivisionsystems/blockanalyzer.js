// in node.js
var Web3PromiEvent = require('web3-core-promievent');
 
var myFunc = function(){
    var promiEvent = Web3PromiEvent();
    
    setTimeout(function() {
        promiEvent.eventEmitter.emit('done', 'cazz!');
        //promiEvent.resolve('porcodio!');
    }, 10);
    
    return promiEvent.eventEmitter;
};
 
 
// and run it
myFunc()
.on('done', console.log);