module.exports = function (RED) {
  var vm = require("vm");
  var msgHandlerKey = "_fth";

  function sendDebug(node, msg) {
    msg = RED.util.encodeObject(
      {
        id: node.id,
        z: node.z,
        _alias: node._alias,
        path: node._flow.path,
        name: node.name,
        msg: msg,
      },
      { maxLength: 10000 }
    );
    RED.comms.publish("debug", msg);
  }

  function runTests(node, done) {
    node.status({ fill: "yellow", shape: "dot", text: "run tests" });

    var tkey = Math.random().toString(16).substr(2);

    // run tests
    var pendingTests = node.n.tests.map(
      (t) =>
        new Promise((resolve) => {
          // set timeout for test
          t.timeout = Math.min(t.timeout || 2000, 10000);
          if (typeof t.timeout !== "number") {
            resolve({
              r: "CANCELED",
              label: t.label,
              error: "invalid test: timeout has to be number.",
            });
          }
          timeout = setTimeout(() => {
            resolve({ r: "NOK", label: t.label, error: "timeout" });
          }, t.timeout);

          var startTime = null;

          var testHandler = {
            tkey: tkey,
            hook: (checkMsg, cb) => {
              // calculate execution time
              var time = Date.now() - startTime;

              // clear timeout for test
              if (timeout) {
                clearTimeout(timeout);
              }

              // execute assertions test
              var tr = null;
              try {
                t.assert(checkMsg);
                tr = { r: "OK", label: t.label, time: time };
              } catch (err) {
                tr = {
                  r: "NOK",
                  label: t.label,
                  error: err.message,
                  time: time,
                };
              }
              cb(tr);
              resolve(tr);
            },
          };

          var testMsg = {
            ...t.inject,
            [msgHandlerKey]: testHandler,
          };

          t.delay = Math.max(t.delay || 100, 0);
          if (typeof t.delay !== "number") {
            resolve({
              r: "CANCELED",
              label: t.label,
              error: "invalid test: delay has to be number.",
            });
          }
          setTimeout(() => {
            startTime = Date.now();
            node.send(testMsg);
          }, t.delay);
        })
    );

    Promise.all(pendingTests).then((tests) => {
      // test stats
      var passed = tests.filter((t) => t.r === "OK").length;
      var total = tests.length;
      var statusText = null;
      if (passed === total) {
        statusText = `(${passed}/${total}) OK`;
        statusFill = "green";
      } else {
        statusText = `(${total - passed}/${total}) NOK`;
        statusFill = "red";
      }

      node.status({
        shape: "dot",
        text: statusText,
        fill: statusFill,
      });

      var testText =
        statusText +
        "\n" +
        "================\n" +
        tests
          .map((t) => {
            switch (t.r) {
              case "OK":
                return `✅ ${t.label} (${t.time} ms)`;
              case "NOK":
                return `❌ ${t.label} (${t.time} ms):\n${t.error}`;
              case "CANCELED":
                return `CANCELED ${t.label}:\n${t.error}`;
            }
          })
          .join("\n");

      sendDebug(node, testText);

      if (done) {
        done();
      }
    });
  }

  function InjectionNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    node.n = {
      tests: new vm.Script(`(function() {${n.tests}})()`).runInNewContext({
        assert: require("assert"),
        should: require("should"),
      }),
      onstart: n.onstart,
      logdbg: n.logdbg,
    };

    if (!Array.isArray(node.n.tests)) {
      node.status({ fill: "yellow", shape: "ring", text: "no tests" });
    } else {
      if (node.n.onstart) {
        runTests(node, null);
      }

      node.on("input", (msg, send, done) => {
        runTests(node, done);
      });
    }
  }

  RED.nodes.registerType("test inject", InjectionNode);

  function CheckPointNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;

    node.n = {
      tkey: null,
      ok: 0,
      failed: 0,
    };

    node.on("input", function (msg, send, done) {
      if (typeof msg[msgHandlerKey] === "object") {
        var testHandler = msg[msgHandlerKey];
        delete msg[msgHandlerKey];

        // reset node state on new test run
        if (node.n.tkey !== testHandler.tkey) {
          node.n.tkey = testHandler.tkey;
          node.n.ok = 0;
          node.n.failed = 0;
        }

        node.statusFill = "red";
        testHandler.hook(msg, function (tr) {
          if (tr.r === "OK") {
            node.n.ok++;
            if (node.n.failed === 0) {
              node.statusFill = "green";
            }
          } else {
            node.n.failed++;
          }
          node.status({
            fill: node.statusFill,
            shape: "dot",
            text: `${node.n.ok} OK, ${node.n.failed} NOK`,
          });
        });
      } else {
        send(msg);
      }
      done();
    });
  }

  RED.nodes.registerType("assert", CheckPointNode);
};
