steal("jquery")
    .then(
        "css/penguicon.less",
        "lib/jquery.color-2.1.0.min.js",
        "lib/jquery.svg.min.js",
        "lib/bootstrap.min.js",
        'app/bootstrap.js')
    .then(
        "app/control/navbar",
        "app/control/eventList",
        "can",
        function (Navigation,EventList) {
            "use strict";
            var nav,eventList;

            nav = new Navigation("header");

            eventList = new EventList("#EventList");
        }
    );