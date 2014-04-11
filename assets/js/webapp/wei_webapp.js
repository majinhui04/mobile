/*
*
*/
(function(){
    //var libs = 'http://assets.haoyuyuan.com/vendor/libs/';
    if(location.href.indexOf('192.168.1')>-1){
        var libs = 'http://192.168.1.195/mobile/vendor/libs/';
        var js = 'http://192.168.1.195/mobile/assets/js/';
        var css = 'http://192.168.1.195/mobile/assets/css/';
    }else if(location.href.indexOf('http://wx.igrow.cn')>-1){
        var libs = 'http://wx.igrow.cn/test/vendor/libs/';
        var js = 'http://wx.igrow.cn/test/assets/js/';
        var css = 'http://wx.igrow.cn/test/assets/css/';
    }
        
    seajs.config({
        alias:{
            'wei_dialog.css': css + 'webapp/wei_dialog.css',
            'underscore':libs + 'underscore/underscore-1.4.4.min.js',
            'jquery':libs + 'jquery/jquery-2.0.0.min.js',
            'common':js + 'webapp/wei_webapp_common.js',
            'mobile':js + 'webapp/mobile.js',
            
            'test':js + 'modules/test/test.js',
            'profile':js + 'modules/profile/profile.js'
        },
        charset: 'utf-8'
    });

    


})();