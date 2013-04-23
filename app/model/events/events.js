steal("can",function(can){
    return can.Model({
        findAll : {
            url: "http://www.alucodev.net/penguicon2013/data/jsonp",
            dataType: "jsonp",
            jsonpCallback : "parse",
            jsonp : false,
            cache : true
        }
    },{});

});