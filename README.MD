# node-red-contrib-flowtest
Simple testing for your Node-RED flows.

## Usage
This package will add two new node types to your node palette.
* `test inject` which will inject a test message into your flow.
* ... and an `assert` node which will catch this test message and make assertions about it.

![example-flow](https://github.com/steineey/node-red-contrib-flowtest/blob/master/example/flow.png)

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
![example-flow](https://github.com/steineey/node-red-contrib-flowtest/blob/master/example/inject-node.png)

### Test Case Object
label (string) : Test case label. \
inject (object) : Test message. \
assert (function(msg)) : Assert function. Define your test assertions with NodeJS - Assert or with [should](https://www.npmjs.com/package/should). \
timeout (integer) : Timeout in miliseconds for the test case to timeout. Default is 2000ms, Max is 10000ms. \
delay (integer) : Delay for the test case inject. Default is 100 ms. \

### Example Test Case Definition
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
