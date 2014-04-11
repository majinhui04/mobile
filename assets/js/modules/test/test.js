/*
    test
*/
define(function(require, exports, module) {
    require('underscore')
    require('jquery');
    var Mobile = require('mobile');
    require('wei_dialog.css');
    var MStorage = Mobile.MStorage;
    alert(MStorage.get('a'))
    return {_name:'test'};
});