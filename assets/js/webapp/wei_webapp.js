/*
*
*/
(function(){
    //var libs = 'http://assets.haoyuyuan.com/vendor/libs/';
    var libs = 'http://192.168.1.195/mobile/vendor/libs/';
    var assets = ';';
    seajs.config({
        alias:{
            'zepto':libs + 'zepto/1.1.3/zepto.min.js',
            'touch':libs + 'zepto/1.1.3/touch.js',
            'event':libs + 'zepto/1.1.3/event.js',
            'underscore':libs + 'underscore/underscore-1.4.4.min.js',
            'jquery':libs + 'jquery/jquery-2.0.0.min.js',
            'mobile':'http://192.168.1.195/mobile/assets/js/webapp/mobile.js'
        },
        charset: 'utf-8'
    });

    


})();