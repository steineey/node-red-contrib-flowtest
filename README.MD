# node-red-contrib-flowtest
Simple testing for your Node-RED flows.

## Usage
This package will add two new node types to your node palette.
* `test inject` which will inject a test message into your flow.
* ... and an `assert` node which will catch this test message and make assertions about it.

![example-flow](https://github.com/steineey/node-red-contrib-flowtest/blob/master/examples/flow.png)

A single `test inject` node can define multiple test cases. A test message will behave like a 'real' message. The only difference is that a test message will be catched by the first `assert` node. The `assert` node executes a callback to the `test inject`, where the assertion about the resulting message is done.

Run the test injection instant after re-deployment or with a message input. The test inject node will output the test result as debug output.

The nodes will give you a simple and intuitive feedback via node states.

Credits: I'm not the first who came up with this kind of design. During development I found these  similar designs.
* https://flows.nodered.org/node/node-red-contrib-flow-asserter
* https://github.com/node-red/node-red/wiki/Flow-testing

## Define Test Cases 

Test case script has to return an array ot test cases
```
return [<test-case-1>, <test-case-2>, ..., <test-case-n>]
```
![example-flow](https://github.com/steineey/node-red-contrib-flowtest/blob/master/examples/inject-node.png)

### Test Case Object
label (string) : Test case label. \
inject (object) : Test message. \
assert (function(msg)) : Assert function. Define your test assertions with NodeJS - Assert or with [should](https://www.npmjs.com/package/should). \
timeout (integer) : Timeout in miliseconds for the test case to timeout. Default is 2000ms, Max is 10000ms. \
delay (integer) : Delay for the test case inject. Default is 100 ms.

### Example

Test Case Script
```
return [{
  label: 'is lower case', 
  inject: {
      payload: 'HELLO WORLD'
  },
  assert: function(msg){
      should(msg).have.property('payload', 'hello world');
  }
}, {
  label: 'msg payload is not null',
  inject: {
    payload: 'hello'
  },
  assert: function(msg) {
      should(msg.payload).not.be.null();
  }
},{
  label: 'wrong data type', 
  inject: {
      payload: 123
  },
  assert: function(msg) {
      should(msg).have.property('error');
  }
}]
```

flow.json 
```
[{"id":"3ba5305cbc00e173","type":"tab","label":"Flow Test","disabled":false,"info":"","env":[]},{"id":"ffe853e065f4a8e9","type":"test inject","z":"3ba5305cbc00e173","name":"","onstart":true,"tests":"return [{\n    label: 'to lower case', \n    inject: {\n        payload: 'HELLO WORLD'\n    },\n    assert: function(msg){\n        should(msg).have.property('payload', 'hello world');\n    }\n}, {\n    label: 'msg payload not null',\n    inject: {\n        payload: 'hello'\n    },\n    assert: function(msg) {\n        should(msg.payload).not.be.null();\n    }\n},{\n    label: 'wrong data type', \n    inject: {\n        payload: 123\n    },\n    assert: function(msg) {\n        should(msg).have.property('error');\n    },\n    delay: 1000\n}];","x":280,"y":180,"wires":[["f2f18ecdccead0a8"],["69a71b38768150a1"]]},{"id":"2ea8589458745f05","type":"inject","z":"3ba5305cbc00e173","name":"input","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"HELLO WORLD","payloadType":"str","x":270,"y":120,"wires":[["f2f18ecdccead0a8"]]},{"id":"f2f18ecdccead0a8","type":"function","z":"3ba5305cbc00e173","name":"to lower case","func":"msg.payload = msg.payload.toLowerCase();\nreturn msg;","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":460,"y":140,"wires":[["1f2cbc42e45437fb"]]},{"id":"1f2cbc42e45437fb","type":"assert","z":"3ba5305cbc00e173","name":"","x":630,"y":140,"wires":[["2e6f285e437cb0dc"]]},{"id":"b2568a8b9019cf6d","type":"catch","z":"3ba5305cbc00e173","name":"","scope":null,"uncaught":false,"x":420,"y":260,"wires":[["5a29cf9d7e7d988c"]]},{"id":"5a29cf9d7e7d988c","type":"assert","z":"3ba5305cbc00e173","name":"","x":570,"y":260,"wires":[[]]},{"id":"2e6f285e437cb0dc","type":"debug","z":"3ba5305cbc00e173","name":"output","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":760,"y":140,"wires":[]},{"id":"69a71b38768150a1","type":"debug","z":"3ba5305cbc00e173","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","statusVal":"","statusType":"auto","x":450,"y":200,"wires":[]}]
```