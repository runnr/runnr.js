module.exports = function start(root) {
	require("./config").root = root;

	// Start HTTP server before socket server:
	var server = require("./http/start")(); // Starts HTTP server to serve rendered HTML templates + static files via express
	server.then(function(app) {
		require("./socket/start")(app); // Starts socket server that runs on top of the express app of the HTTP server
	});
};
