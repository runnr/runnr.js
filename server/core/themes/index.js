var config = require("../../config"),

	//api,

	api = require("../api"),

	themeId = "light",

	Theme = require("./Theme"),

	currentTheme = new Theme(themeId),

themes = {
	get current() {
		return currentTheme;
	}
};

api.offer(themes).redirect(themes.current).publish("theme");

module.exports = themes;
