var db = require("../db").plugins,
	config = require("../../config"),
	api = require("../api").api,
	fs = require("fs"),
	path = require("path"),
	Plugin = require("./Plugin"),

plugins = {
	getRaw: db.findAsync,

	countAll: function() {
		return db.countAsync({});
	},
	get: function(id) {
		return new Plugin(id);
	},
	getPersistent: function(id) {
		return new Plugin(id, true);
	}
};

function scan(dir) {

	console.log("Scanning '"+dir+"' for plugins.");

	var f = {
		res: function(data) {
			var manifest = JSON.parse(data);
			Plugin.install(manifest, dir);
		},
		rej: function() {}
	};
	fs.readdirAsync(dir).then(function(files) {
		files.forEach(function(e, i) {
			fs.readFileAsync(path.join(dir, e, "manifest.json")).then(f.res, f.rej);
		});
	}, function(err) {
		console.error("Scanning '"+dir+"' for plugins failed: ", err);
	});
}

function init() {

	plugins.countAll().then(function(count) {
		console.log("Plugin database ready.");
		if(count)
			return;

		// Create indexes if not already done:
		db.ensureIndex({ fieldName:"manifest.core" });

		scan(path.join(config.root, "corePlugins"));
		scan(path.join(config.root, "plugins"));

		console.log("Initialized new plugin db.");
	});
}

init();

api.offer(plugins)
	.router(plugins.get)
	.provider(api.serve.static.content({
		get all() {
			return plugins.getRaw({ "manifest.core":true }, { "manifest.author":1 });
		}
	}))
	.publish("plugins");

module.exports = plugins;
