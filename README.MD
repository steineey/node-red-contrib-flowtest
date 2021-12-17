# node-red-contrib-flowtest
Simple testing for your Node-RED flows.

## Design
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
