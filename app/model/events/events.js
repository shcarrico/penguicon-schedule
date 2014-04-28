steal("can",function(can){
    return can.Model({
        findAll : {
            url: "http://www.alucodev.net/penguicon2014/jsonp",
            dataType: "jsonp",
            jsonpCallback : "parse",
            jsonp : false,
            cache : true
        }
    },{});

});
