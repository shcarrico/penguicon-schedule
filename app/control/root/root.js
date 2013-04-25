steal(
	"app/component/navbar",
    "app/control/EventList",
	"can",
    "./penguicon.less",
	function (Navigation,EventList) {
		"use strict";
		return can.Control({
			init : function(){
				var nav,eventList;

				nav = new Navigation("header");

                eventList = new EventList("#EventList");

			}
		});
	}
);