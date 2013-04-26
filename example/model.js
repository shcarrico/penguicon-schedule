var Collection = can.Model({
	findAll: "/svc/nodes"
}, {});

Collection({
	myMethod: function () {}
}); //-> extends model with myMethod. available on list object later

Collection.findAll(); //-> returns a deferred object

Collection.findAll()
	.then(function(){}) //-> handle success
	.fail(function(error){}); //-> handle errors