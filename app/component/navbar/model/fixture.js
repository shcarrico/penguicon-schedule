steal("can",
	"can/util/fixture",
	function () {

		var url = JV.properties.service_urls;

		can.fixture(url.nav, function () {
				return [
					{
						name: 'Employees',
						route: '/employees'
					},
					{
						name: 'Foo',
						route: '/foo'
					}
				];
			})
	}
);