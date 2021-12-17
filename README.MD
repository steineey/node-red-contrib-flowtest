# node-red-contrib-flowtest
Simple testing for your Node-RED flows.

## Concept
This package will add two new node types to your node palette.
* `test inject` which will inject a test message into your flow.
* ... and an `assert` node which will catch this test message and make assertions about it.

You can define multiple test cases within a single `test inject` node.


