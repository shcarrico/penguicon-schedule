steal(
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