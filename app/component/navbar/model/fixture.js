steal("can",
	"can/util/fixture",
	function () {

		var url = JV.properties.service_urls;

		can.fixture(url.nav, function () {
				return [
					{
						name: 'Friday',
						route: 'day/friday'
					},
					{
						name: 'Saturday',
						route: 'day/saturday'
					},
                    {
                        name: 'Sunday',
                        route: 'day/sunday'
                    }
				];
			})
	}
);