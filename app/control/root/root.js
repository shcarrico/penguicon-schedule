steal(
	"app/component/navbar",
	"can",
	function (Navigation) {
		"use strict";
		return can.Control({
			init : function(){
				var nav;

				nav = new Navigation("header");

			}
		});
	}
);