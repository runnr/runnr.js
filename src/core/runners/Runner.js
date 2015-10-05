"use strict";

const owe = require("owe.js");
const StoreItem = require("../StoreItem");

const name = Symbol("name");
const active = Symbol("active");
const update = StoreItem.update;

class Runner extends StoreItem {
	constructor(preset) {

		const exposed = ["name", "active"];

		super(exposed, exposed, preset);

		owe(this, owe.serve({
			router: {
				filter: new Set(exposed.concat(["activate", "deactivate", "delete"])),
				writable: new Set(exposed)
			},
			closer: {
				filter: true,
				writable: data => typeof data !== "object"
			}
		}));
	}

	get name() {
		return this[name];
	}
	set name(val) {
		if(typeof val !== "string")
			throw new owe.exposed.TypeError("Runner name has to be a string.");

		val = val.trim();

		if(val === "")
			throw new owe.exposed.TypeError("Runner name must not conist of whitespace.");

		if(val === this.name)
			return;

		if(name in this && require("./manage/helpers").exists(val))
			throw new owe.exposed.Error(`Runner with name '${val}' already exists.`);

		this[name] = val;
		this[update]();
	}

	get active() {
		return this[active];
	}
	set active(val) {
		this[val ? "activate" : "deactivate"]();
	}

	activate() {
		this[active] = true;
		this[update]();
		this.emit("activeChanged", true);

		return Promise.resolve(this);
	}

	deactivate() {
		this[active] = false;
		this[update]();
		this.emit("activeChanged", false);

		return Promise.resolve(this);
	}

	delete() {
		return this.deactivate()
			.then(() => require("./manage/delete")(this))
			.then(() => this.emit("deleted"));
	}

	static add(runner) {
		return require("./manage/add")(runner, runner => new Runner(runner));
	}
}

module.exports = Runner;
