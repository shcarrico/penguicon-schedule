steal("can",function(can){
    return can.Model({
        findAll : {
            url: "http://penguicon.alucodev.info/data/jsonp",
            dataType: "jsonp",
            jsonpCallback : "parse",
            jsonp : false,
            cache : true
        }
    },{});

});
