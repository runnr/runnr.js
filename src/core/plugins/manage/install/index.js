"use strict";

const owe = require("owe.js");

const manager = require("../manager");
const helpers = require("./helpers");

function install(plugin, map, dontManage) {
	if(typeof plugin !== "object" || !plugin)
		throw new owe.exposed.TypeError(`Given plugin '${plugin}' cannot be installed.`);

	if(plugin.type in installationTypes) {
		const delayer = dontManage
			? manifest => manifest
			: manifest => {
				return manager.delay(
					manifest.name,
					new Promise(resolve => setImmediate(() => resolve(promise))),
					"install"
				).then(() => manifest);
			};

		const promise = installationTypes[plugin.type](plugin, delayer)
			.then(manifest => helpers.installManifest(map(manifest)));

		return promise;
	}
	else
		throw new owe.exposed.Error("Plugins cannot be installed with the given installation method.");
}

const installationTypes = {
	__proto__: null,

	local: require("./local")
};

module.exports = install;
