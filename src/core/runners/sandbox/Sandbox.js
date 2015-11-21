"use strict";

const owe = require("owe.js");
const oweEvents = require("owe-events");
const childProcess = require("child_process");
const path = require("path");

const api = require("./api");

const sandbox = Symbol("sandbox");

class Sandbox {
	constructor(runner) {
		this.runner = runner;

		this[sandbox] = childProcess.fork(path.join(__dirname, "process"), {
			silent: true,
			execArgv: []
		});

		this[sandbox].stdout.on("data",
			data => process.stdout.write(`${this.runner.name} > ${data}`));
		this[sandbox].stderr.on("data",
			data => process.stderr.write(`${this.runner.name} > ${data}`));

		// Start an owe server for this sandbox's runner listening for requests from the sandbox:
		api.server(this[sandbox], owe.api({
			runner: this.runner,
			eventController: oweEvents.controller
		}, owe.serve.router()));

		// Start an owe client to request data from the sandbox's API:
		this.api = api.client(this[sandbox]);

		// TEST:
		this.api.route("greeting").then(greeting => console.log(`${this.runner.name} responds '${greeting}'.`));

		let i = 0;
		let y = 0;
		const fn = data => {
			console.log(`${this.runner.name} emits '${data}'.`);

			if(++i >= 5) {
				i = 0;
				this.api.route("emitter").removeListener("test", fn).then(() => {
					if(++y < 10000)
						this.api.route("emitter").on("test", fn);
				});
			}
		};

		fn.toString = () => "[function Function]";

		this.api.route("emitter").on("newListener", function(event, listener) {
			console.log("new", event, listener);

			this.route("greeting").then(console.log, console.log);
		});

		this.api.route("emitter").on("test", fn);
	}

	/**
	 * Sandbox should not appear in the JSON.stringify outputs used in LokiJS.
	 * @return {undefined} Return nothing.
	 */
	toJSON() {
		return;
	}
}

module.exports = Sandbox;
