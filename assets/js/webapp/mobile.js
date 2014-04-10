define(function(require, exports, module) {
    require('jquery');

    var ajaxUrlMap = {

    };
    // 默认ajax前缀
    var ajaxApi = 'http://m.igrow.cn/api/1.1b';

    var HTTP = {
        ajax: function (url, data , opts,successCallback,failCallback,always) {
            var self = this,
                data = data || {},
                dfd = $.Deferred(),
                opts = opts || {},
                type = opts.type || 'GET',
                dataType = opts.dataType || 'json',
                timeout = opts.timeout || 60*1000,
                context = opts.context || self,
                request;

        
            request = $.ajax({
                'url': url,
                'type': type,
                'data': data,
                'timeout':timeout,
                'dataType': dataType

            }).done(function(result) {
                var error;
                if( result.code && result.code > 200 ) {
                    error = self.handleXhrError(result);
                    failCallback && failCallback.call(context,error);
                    always && always.call(context,error);
                    dfd.reject(error);

                } else {
                    successCallback && successCallback.call(context,result);
                    always && always.call(context,result);
                    dfd.resolve(result); 
                }

            }).fail(function(xhr){
                
                var error = self.handleXhrError(xhr);
    
                failCallback && failCallback.call(context,error);
                always && always.call(context,error);
                dfd.reject(error);

            });

            return dfd.promise(); 
      
        },
        get: function(url, data,successCallback, failCallback,always) {

            return this.ajax(url, data, { type: 'GET' },successCallback, failCallback, always);

        },
        post: function(url, data, successCallback, failCallback,always) {

            return this.ajax(url, data, { type: 'POST' },successCallback, failCallback, always);

        },
        // 处理请求错误
        handleXhrError: function(xhr){
            var responseText,
                error = {},
                isResponseObject = function(xhr) {
                    return /^{/.test(xhr.responseText);
                };

            if(xhr.statusText === 'timeout'){
                error.message = '请求超时 ';
            }
            else if(xhr.message){
                error = xhr;
            }
            else if( xhr.status == 500 && isResponseObject(xhr) ){
                try{
                    responseText = xhr.responseText.replace('/\\/g','//');
                    error = $.parseJSON(responseText) ;
                    error.message = error.message || '错误未知';
                    
                }catch(e){
                    console.warn('responseText parse error');
                    error = { message:' 错误未知 ' };
                }

            }else{
                error = { message:' 错误未知 ' };
            }

            error.status = xhr.status;

            return error;
        }
    };

    var $resource = function(url, options, actions) {
        var url = url || '',
            options = options || {}, actions = actions || {},
            resourse = {},params;

        if( url.indexOf('http://')>-1 ){
            url = url;
        }else{
            url = ajaxApi + url;
        }
        resourse = {
            url:url,
            list: function(data,successCallback,failCallback,always){
                var url = this.url+'/list',data = data || {};
                
                data._page = data._page ? data._page:1;
                data._pagesize = data._pagesize ? data._pagesize:20;
                
                return HTTP.get(url,data,successCallback,failCallback,always);
            },
            get: function(data,successCallback,failCallback,always){
                var url = this.url+'/get',data = data || {};
                
                return HTTP.get(url,data,successCallback,failCallback,always);
            },
            search: function(data,successCallback,failCallback,always){
                var url = this.url+'/search',data = data || {};
                
                data._page = data._page ? data._page:1;
                data._pagesize = data._pagesize ? data._pagesize:20;
                
                return HTTP.get(url,data,successCallback,failCallback,always);
            },
            _delete:function(data,successCallback,failCallback,always){
                var url = this.url+'/delete',data = data || {};
                
                return HTTP.get(url,data,successCallback,failCallback,always);
            },
            create:function(data,successCallback,failCallback,always){
                var url = this.url+'/create',data = data || {};
                
                return HTTP.post(url,data,successCallback,failCallback,always);
            },
            update:function(data,successCallback,failCallback,always){
                var url = this.url+'/update',data = data || {};
                
                return HTTP.post(url,data,successCallback,failCallback,always);
            }
        };
        // 自定义action
        for(var action in actions){
            var opts = actions[action] || {},method = opts.method || "GET",params = opts.params || {};
           
            method = method.toLowerCase();
            resourse[action] = (function(url,action,method,params){

                return function(data,successCallback,failCallback,always){
                    var data = data || {};
                   
                    url = url + '/' + action;

                    data = $.extend({},params,data);
                    
                    return HTTP[method](url,data,successCallback,failCallback,always);
    
                };

            })(url,action,method,params)

        };

        return resourse;

    };

    var Mobile = {
        alert: function(content) {
            MDialog.alert('', content, '', '确定');
        },
        confirm: function(content, sureCallback, cancelCallback) {
            MDialog.confirm('', content, '', '取消', cancelCallback, null, '确定', sureCallback, null);
        },
        showLoading: function(notice, needModal) {
            MLoading.show(notice, needModal);
        },
        hideLoading: function() {
            MLoading.hide();
        },
        test: function() {
            $.ajax({
                url: 'http://192.168.1.195/mobile/assets/data/test.json',
                type: 'GET',
                dataType: 'json',
                data: {
                    param1: 'value1'
                },
            })
                .done(function(result) {
                    console.log("success", result);
                })
                .fail(function(result) {
                    console.log("error", result);
                })
                .always(function(result) {
                    console.log("complete", result);
                });

        }
    };
    Mobile.$resource = $resource;
    window['Mobile'] = Mobile;

    return Mobile;
});