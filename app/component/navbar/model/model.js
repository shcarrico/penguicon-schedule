if (steal.config("fixtures")) {
	steal('./fixture.js');
}

steal("can", function () {
	var url = JV.properties.service_urls;

	var Nav = can.Model({
		findAll: url.nav
	},{});

	return Nav;
});