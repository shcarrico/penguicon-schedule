steal("can",
	"can/util/fixture",
	function () {

		var url = JV.properties.service_urls;

		can.fixture(url.nav, function () {
				return [
					{
						name: 'Friday',
						route: '/friday'
					},
					{
						name: 'Saturday',
						route: '/saturday'
					},
                    {
                        name: 'Sunday',
                        route: '/sunday'
                    }
				];
			})
	}
);