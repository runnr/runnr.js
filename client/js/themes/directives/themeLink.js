(function() {
	angular.module("themes")
		.directive("themeLink", themeLink);

	themeLink.$inject = ["$compile", "$q", "themes.api"];

	function themeLink($compile, $q, themeApi) {
		return {
			restrict: "A",
			transclude: "element",
			terminal: true,
			priority: 3001,
			link: function(scope, element) {

				themeApi.theme.then(function(theme) {
					var clone = angular.element(document.createElement("link"));
					clone.attr("rel", "stylesheet");
					clone.attr("type", "text/css");
					theme.css.main.forEach(function(v) {
						clone.attr("href", themeApi.raw(v.file, true));
						clone.attr("media", v.media || undefined);
						element.after(clone);
						clone = clone.clone();
					});
				});
			}
		};
	}

})();
