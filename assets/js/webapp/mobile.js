define(function(require, exports, module) {
    require('jquery');
    var Common = require('common'),
        MDialog = Common.MDialog,
        MLoading = Common.MLoading;

    var ajaxUrlMap = {

    };
    // 默认ajax前缀
    var ajaxApi = 'http://m.igrow.cn/api/1.1b';
    var Cache = {};
    var HTTP = {
        tpl: function(url,successCallback, failCallback, always) {
            var dfd = $.Deferred();

            if(Cache[url]){
                dfd.resolve(Cache[url]);
                return dfd.promise();
            }else{
                return this.ajax(url, {}, { type: 'GET' ,dataType:'html' }).done(function(result) {
                    Cache[url] = result;
                });
            }
            
        },
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
    
    var mDailogDefault = {
        auto:true,
        modal:true
    };
    function MDialog(options){
        this.options = $.extend({},mDailogDefault,options || {});

        this.init();
    }
    MDialog.prototype = {
        constructor: MDialog,
     
        show: function() {
            var options = this.options,
                $container = this.$container;

            options.beforeShow && options.beforeShow();
            centerElement($container);
            if (true === options.modal) {
                this.$modal = makeModal({});
            }

        },
        hide:function() {
            var options = this.options,
                $container = this.$container;

            $container.css({
                left: '-9999px',
                top: '-9999px'
            });
            this.$modal && this.$modal.remove();
        },
        init: function() {
            var self = this,options = this.options,auto = options.auto;

            self.initDialog.done(function(){
                self.bind();

                if(auto){
                    self.show();
                }
            });
        },
        initDialog:function() {
            var self = this,
                options = this.options,
                dialogTplUrl = options.dialogTplUrl,
                $dialog = options.$dialog,
                dfd = $.Deferred();

            if(dialogTplUrl){
                HTTP.tpl(dialogTplUrl).done(function(dialogTpl){
                    self.$container = $(dialogTpl).appendTo( $('body') );
                    dfd.resolve();

                }).fail(function(result){
                    alert(result.message);
                });

            }else if($dialog && $dialog.length){
                self.$container = $dialog;
                dfd.resolve();

            }else{
                dfd.reject();
            }

            return def.promise();
        },
        render: function() {

        },
        bind: function() {
            var self = this, options = this.options, $container = options;


        },
        sync: function() {

        }
    };


    var Mobile = {
        cache:Cache,
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
            

        }
    };
    Mobile.$resource = $resource;
    Mobile.http = HTTP;
    $.extend(Mobile,Common);
    window['Mobile'] = Mobile;


    function makeModal(options) {
        var options = options || {},
            zIndex = options.zIndex || 900,
            opacity = options.opacity || 0.5;
            win = getClient(),
            backgroundColor = options.backgroundColor || '#000',
            height = win.h,
            position = options.position || 'fixed',
            id = 'modal_' + new Date().getTime(),
            tmpl = '<div class="m-modal"><a href="javascript:;" style="display:block;"></a></div>';

        $modal = $(tmpl).appendTo($('body'));
        $modal.css({
            left:0,
            top:0,
            position:position,
            width:'100%',
            zIndex: zIndex,
            opacity: opacity,
            backgroundColor:backgroundColor
        }).attr('id',id);

        $modal.find('a').css('height',height);

        return $modal;
    }
    function removeModal($element) {
        if ($element) {
            $element.remove();
        }else {
            $('.m-modal').remove();
        }
    }
    function getClient(e){
        if (e) {
            w = e.clientWidth;
            h = e.clientHeight;
        } else {
            w = (window.innerWidth) ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : document.body.offsetWidth;
            h = (window.innerHeight) ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : document.body.offsetHeight;
        }
        return {w:w,h:h};
    }
    
    function centerElement($element,width,height) {
        var win = this.getClient(),
            winHeight = win.h,
            winWidth = win.w,
            element = $element[0],
            width = width || element.offsetWidth,
            height =  height || element.offsetHeight,
            scrollTop,
            top,left;
            
        left =  Math.floor( (winWidth-width)*0.5 );

        element.style.width = width+'px';
        
        element.style.left = left+'px';
        
        //谷歌下不能立即获取scrollTop
        setTimeout(function(){
            
            //scrollTop = Math.max(document.documentElement.scrollTop,document.body.scrollTop)
            top = Math.floor( (winHeight-height)*0.45 );
            element.style.top = top+'px';
          
            
        },30);
    }

    return Mobile;
});