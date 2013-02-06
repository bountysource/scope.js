var scope=function(namespace,base){if(namespace){if(base&&!scope.instance[base]){alert("Invalid scope parent: "+base)}else{if(!scope.instance[namespace]){scope.instance[namespace]=scope.create_context(base?scope.instance[base]:scope.instance)}return scope.instance[namespace]}}else{return scope.instance}};scope.data_logs=[];scope.data_observers=[];scope.data_hash={};scope.create_context=function(proto){function Scope(){}Scope.prototype=proto;var obj=new Scope();if(!obj.__proto__){obj.__proto__=proto}return obj};scope.instance=scope.create_context({define:function(key,callback){this[key]=callback}});if(!window.console){window.console={log:function(){}}}with(scope()){define("redefine",function(name,callback){var real_callback=this[name];define(name,function(){return callback.apply(this,[real_callback].concat(Array.prototype.slice.call(arguments)))})});define("stop_event",function(e){if(!e){return}if(e.preventDefault){e.preventDefault()}if(e.stopPropagation){e.stopPropagation()}e.cancelBubble=true;e.returnValue=false});define("flatten_to_array",function(){var stack=Array.prototype.slice.call(arguments);var arguments=[];while(stack.length>0){var obj=stack.shift();if(obj||(typeof(obj)=="number")){if((typeof(obj)=="object")&&obj.concat){stack=obj.concat(stack)}else{if(((typeof(obj)=="object")&&obj.callee)||(Object.prototype.toString.call(obj).indexOf("NodeList")>=0)){stack=Array.prototype.slice.call(obj).concat(stack)}else{arguments.push(obj)}}}}return arguments});define("shift_options_from_args",function(args){if((typeof(args[0])=="object")&&(typeof(args[0].nodeType)=="undefined")){return args.shift()}else{if((typeof(args[args.length-1])=="object")&&(typeof(args[args.length-1].nodeType)=="undefined")){return args.pop()}else{return{}}}});define("shift_callback_from_args",function(args){if(typeof(args[0])=="function"){return args.shift()}else{if(typeof(args[args.length-1])=="function"){return args.pop()}else{return(function(){})}}});define("for_each",function(){var objs=flatten_to_array(arguments);var callback=objs.pop();var ret_val=[];for(var i=0;i<objs.length;i++){ret_val.push(callback(objs[i]))}return ret_val});define("curry",function(callback){var curried_args=Array.prototype.slice.call(arguments,1);return(function(){return callback.apply(this,Array.prototype.concat.apply(curried_args,arguments))})});define("filter",function(iteratable,callback){var retval=[];for(var i=0;i<iteratable.length;i++){if(callback(iteratable[i])){retval.push(iteratable[i])}}return retval});define("encode_html",function(raw_html){return encodeURIComponent(raw_html)});define("decode_html",function(encoded_html){return decodeURIComponent(encoded_html)});define("merge",function(a,b){var new_hash={};for(var k in a){new_hash[k]=a[k]}for(var k in b){new_hash[k]=b[k]}return new_hash})}with(scope()){scope.__initializers=[];define("initializer",function(callback){scope.__initializers.push(callback)});window.onload=function(){for(var i=0;i<scope.__initializers.length;i++){scope.__initializers[i]()}delete scope.__initializers}}with(scope()){define("render",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);options.layout=typeof(options.layout)=="undefined"?((options.target||options.into)?false:this.default_layout):options.layout;options.target=options.target||options.into||document.body;if(typeof(options.target)=="string"){options.target=document.getElementById(options.target)}if(options.layout){arguments=options.layout(arguments);if(!arguments.push){arguments=[arguments]}if(arguments[0].parentNode==options.target){return}}if(options.target.innerHTML){options.target.innerHTML=""}for(var i=0;i<=arguments.length;i++){var dom_element=arguments[i];if(typeof(dom_element)=="function"){dom_element=observe(dom_element,function(retval,old_retval){if(typeof(retval)=="undefined"){retval=""}if(["string","boolean","number"].indexOf(typeof(retval))>=0){retval=document.createTextNode(""+retval)}if(old_retval&&old_retval.parentNode){old_retval.parentNode.insertBefore(retval,old_retval);old_retval.parentNode.removeChild(old_retval)}return retval})}if(["string","boolean","number"].indexOf(typeof(dom_element))>=0){dom_element=document.createTextNode(""+dom_element)}if(dom_element){options.target.appendChild(dom_element)}}});define("element",function(){var arguments=flatten_to_array(arguments);var tag=arguments.shift();var options=shift_options_from_args(arguments);var element=document.createElement(tag);if(options.type){element.setAttribute("type",options.type);delete options.type}if(options.events){for(var k in options.events){options["on"+k]=options.events[k]}delete options.events}for(var k in options){if(k.indexOf("on")==0){var callback=(function(cb){return function(){cb.apply(element,Array.prototype.slice.call(arguments))}})(options[k]);if(element.addEventListener){element.addEventListener(k.substring(2).toLowerCase(),callback,false)}else{element.attachEvent(k.toLowerCase(),callback)}delete options[k]}}for(var k in options){if(typeof(options[k])=="function"){var key1=k;observe(options[k],function(retval){set_attribute(element,key1,retval)})}else{set_attribute(element,k,options[k])}}if(arguments.length>0){render({into:element},arguments)}return element});define("set_attribute",function(element,key,value){if(key=="class"){element.className=value}else{if(key=="style"){element.style.cssText=value}else{if(key=="placeholder"){element.setAttribute(key,value+" ")}else{if((key=="html")||(key.toLowerCase()=="innerhtml")){element.innerHTML=value}else{if(key=="checked"){element.checked=!!value}else{if(value!=undefined){element.setAttribute(key,value)}}}}}}});for_each("script","meta","title","link","script","iframe","h1","h2","h3","h4","h5","h6","small","div","p","span","pre","img","br","hr","i","b","strong","u","ul","ol","li","dl","dt","dd","table","tr","td","th","thead","tbody","tfoot","select","option","optgroup","textarea","button","label","fieldset","header","section","footer",function(tag){define(tag,function(){return element(tag,arguments)})});define("a",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);if(options.href&&options.href.call){var real_callback=options.href;options.href="";options.onClick=function(e){stop_event(e);real_callback()}}else{if(options.href&&options.href.indexOf("#")==0){if(!this.a.click_handler){this.a.click_handler=function(e){stop_event(e);set_route("#"+this.href.split("#")[1])}}options.onClick=this.a.click_handler}}return element("a",options,arguments)});define("img",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);if(!options.src&&(arguments.length==1)){options.src=arguments.pop()}return element("img",options,arguments)});define("form",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);if(options.action&&options.action.call){var real_callback=options.action;options.onSubmit=function(e){stop_event(e);var serialized_form={};var elems=this.getElementsByTagName("*");for(var i=0;i<elems.length;i++){if((elems[i].tagName!="FORM")&&elems[i].name){var value=null;if(elems[i].tagName=="SELECT"){value=elems[i].options[elems[i].selectedIndex].value}else{if((["radio","checkbox"].indexOf(elems[i].getAttribute("type"))==-1)||elems[i].checked){value=elems[i].value}}var name=elems[i].name;if(name&&(value!=null)){if(name.substring(name.length-2)=="[]"){name=name.substring(0,name.length-2);if(!serialized_form[name]){serialized_form[name]=[]}serialized_form[name].push(value)}else{if(name.indexOf("[")>=0){var parts=name.split(/[[\]]/);if(!serialized_form[parts[0]]){serialized_form[parts[0]]={}}serialized_form[parts[0]][parts[1]]=value}else{if(elems[i].getAttribute("placeholder")&&(value==elems[i].getAttribute("placeholder"))){serialized_form[name]=""}else{serialized_form[name]=value}}}}}}real_callback(serialized_form)};options.action=""}return element("form",options,arguments)});define("input",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);return this[options.type||"text"](options,arguments)});define("submit",function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);options.type="submit";if(!options.value&&arguments.length==1){options.value=arguments.pop()}return element("input",options,arguments)});for_each("text","hidden","password","checkbox","radio","search","range","number",function(input_type){define(input_type,function(){var arguments=flatten_to_array(arguments);var options=shift_options_from_args(arguments);options.type=input_type;return element("input",options,arguments)})});define("remove_element",function(id){var e=document.getElementById(id);return(e?(e.parentNode.removeChild(e)&&true):false)});define("add_class",function(e,class_name){if(!e||has_class(e,class_name)){return e}var parts=e.className.split(/\s+/);parts.push(class_name);e.className=parts.join(" ");return e});define("remove_class",function(e,class_name){if(!e||!has_class(e,class_name)){return e}e.className=e.className.replace((new RegExp("s*"+class_name+"s*"))," ").trim();return e});define("has_class",function(e,class_name){var class_names=e.className.split(/\s+/);return class_names.indexOf(class_name)>=0});define("hide",function(element){if(typeof(element)=="string"){element=document.getElementById(element)}if(element){element.style.display="none"}});define("show",function(element){if(typeof(element)=="string"){element=document.getElementById(element)}if(element){element.style.display="block"}});define("is_visible",function(element){if(typeof(element)=="string"){element=document.getElementById(element)}return element.style.display!="none"});define("toggle_visibility",function(element){if(typeof(element)=="string"){element=document.getElementById(element)}is_visible(element)?hide(element):show(element)});define("inner_html",function(element,html){if(typeof(element)=="string"){element=document.getElementById(element)}if(element){element.innerHTML=html}})}scope.routes=[];with(scope()){initializer(function(){var callback=function(){setTimeout(callback,100);var hash=get_route();if(hash!=scope.current_route){set_route(hash,{skip_updating_browser_bar:true})}};setTimeout(callback,0)});define("route",function(path,callback){if(typeof(path)=="string"){scope.routes.push({regex:(new RegExp("^"+path.replace(/^#\//,"#").replace(/:[a-z_]+/g,"([^/]*)")+"$")),callback:callback,context:this})}else{for(var key in path){this.route(key,path[key])}}});define("get_route",function(){var r="#"+((window.location.href.match(/#\/?(.*)/)||[])[1]||"").split("?")[0];return r});define("get_params",function(){var hash={};var qs=((window.location.href.match(/#?\/?.*?\?(.*)/)||[])[1]||"");var pairs=qs.split("&");for(var i=0;i<pairs.length;i++){var target=hash;var kv=pairs[i].split("=",2);if(kv.length!=2){continue}var this_value=unescape(kv[1]);if(this_value=="true"){this_value=true}else{if(this_value=="false"){this_value=false}}var key_parts=unescape(kv[0]).split("[");for(var j=0;j<key_parts.length;j++){var this_key=key_parts[j].replace(/\]$/,"");var next_key=(key_parts.length>j+1)?key_parts[j+1].replace(/\]$/,""):null;if(next_key==null){if(this_key==""){target.push(this_value)}else{target[this_key]=this_value}}else{if(!target[this_key]){target[this_key]=(next_key==""?[]:{})}target=target[this_key]}}}return hash});define("to_param",function(params){var qs="";for(var k in params){qs+=((qs.length==0?"?":"&")+k+"="+params[k])}return qs});define("set_route",function(path,options){if(!path.match(/^#/)){if(window.location.href.split("#")[0]==path.split("#")[0]){path="#"+path.split("#",2)[1]}else{window.location.href=path;return}}path=path.replace(/^#\//,"#");if(document.getElementById("_content")){document.getElementById("_content").setAttribute("id","content")}if(!options){options={}}if(options.params){if(query_string){path=path.split("?")[0]}path+=to_param(options.params)}if(!options.skip_updating_browser_bar){if(options.replace){window.location.replace(window.location.href.split("#")[0]+path)}else{window.location.href=window.location.href.split("#")[0]+path}}scope.current_route=path;if(options.reload_page){window.location.reload();return}if(typeof(_gaq)=="object"){_gaq.push(["_trackPageview",path])}path=get_route();for(var i=0;i<scope.routes.length;i++){var route=scope.routes[i];var matches=path.match(route.regex);if(matches){window.scrollTo(0,0);if(!route.context.run_filters("before")){return}route.callback.apply(null,matches.slice(1));route.context.run_filters("after");return}}for(var i=0;i<scope.routes.length;i++){var route=scope.routes[i];var matches="#not_found".match(route.regex);if(matches){window.scrollTo(0,0);if(!route.context.run_filters("before")){return}route.callback.apply(null,matches.slice(1));route.context.run_filters("after");return}}alert("404 not found: "+path)})}with(scope()){define("before_filter",function(name,callback){if(!callback){callback=name;name=null}if(!this.hasOwnProperty("before_filters")){this.before_filters=[]}this.before_filters.push({name:name,callback:callback,context:this})});define("after_filter",function(name,callback){if(!callback){callback=name;name=null}if(!this.hasOwnProperty("after_filters")){this.after_filters=[]}this.after_filters.push({name:name,callback:callback,context:this})});define("run_filters",function(name){var filters=[];var obj=this;var that=this;while(obj){if(obj.__proto__&&(obj[name+"_filters"]!=obj.__proto__[name+"_filters"])){filters=obj[name+"_filters"].concat(filters)}obj=obj.__proto__}for(var i=0;i<filters.length;i++){scope.running_filters=true;filters[i].callback.call(that);delete scope.running_filters;if(scope.filter_performed_action){var tmp_action=scope.filter_performed_action;delete scope.filter_performed_action;tmp_action.call(filters[i].context);return}}return true})}with(scope()){define("observe",function(method,callback,old_retval){scope.data_logs.push([]);var retval=method();var keys=scope.data_logs.pop();if(keys.length>0){retval=callback(retval,old_retval);scope.data_observers.push({keys:keys,retval:retval,method:method,callback:callback})}return retval});define("set",function(key,value){scope.data_hash[key]=value;var observers_to_run=[];var observers_skipped=[];for(var i=0;i<scope.data_observers.length;i++){var observer=scope.data_observers[i];if(observer.keys.indexOf(key)!=-1){observers_to_run.push(scope.data_observers[i])}else{observers_skipped.push(scope.data_observers[i])}}scope.data_observers=observers_skipped;for(var i=0;i<observers_to_run.length;i++){observe(observers_to_run[i].method,observers_to_run[i].callback,observers_to_run[i].retval)}return null});define("get",function(key){var data_log=scope.data_logs[scope.data_logs.length-1];if(data_log&&data_log.indexOf(key)==-1){data_log.push(key)}return scope.data_hash[key]})}with(scope("JSONP")){initializer(function(){scope.jsonp_callback_sequence=0;scope.jsonp_callbacks={}});define("get",function(options){var callback_name="callback_"+scope.jsonp_callback_sequence++;var url=options.url;if(!options.params){options.params={}}options.params.cache=(new Date().getTime());options.params.callback="scope.jsonp_callbacks."+callback_name;if(options.method!="GET"){options.params._method=options.method}for(var key in options.params){url+=(url.indexOf("?")==-1?"?":"&");url+=key+"="+encode_html(options.params[key]||"")}var script=document.createElement("script");script.async=true;script.type="text/javascript";script.src=url;scope.jsonp_callbacks[callback_name]=function(response){delete scope.jsonp_callbacks[callback_name];var head=document.getElementsByTagName("head")[0];head.removeChild(script);options.callback.call(null,response)};var head=document.getElementsByTagName("head")[0];head.appendChild(script)})}with(scope("StorageBase")){define("namespaced",function(name){return Storage.namespace?Storage.namespace+"_"+name:name});define("strip_namespace",function(name){if(!Storage.namespace){return name}return name.replace(new RegExp(Storage.namespace+"_"),"")})}with(scope("Cookies","StorageBase")){define("get",function(name){var ca=document.cookie.split(";");for(var i=0;i<ca.length;i++){while(ca[i].charAt(0)==" "){ca[i]=ca[i].substring(1,ca[i].length)}if(ca[i].length>0){var kv=ca[i].split("=");if(kv[0]==namespaced(name)){return decodeURIComponent(kv[1])}}}});define("set",function(name,value,options){options=options||{};var cookie=(value?namespaced(name)+"="+encodeURIComponent(value)+"; path=/;":namespaced(name)+"=; path=/;");if(options.expires_at){cookie+="expires="+options.expires_at.toGMTString()}document.cookie=cookie});define("remove",function(name){var before_remove=get(name);if(before_remove){document.cookie=namespaced(name)+"=;path=;expires=Thu, 01 Jan 1970 00:00:01 GMT";return before_remove}});define("clear",function(options){options=options||{};var ca=document.cookie.split(";");for(var i=0;i<ca.length;i++){var name=ca[i].split("=")[0].replace(/\s+/,"");if(!((options.except||[]).map(namespaced).indexOf(name)>=0)){remove(strip_namespace(name))}}})}with(scope("Local","StorageBase")){define("get",function(name){return window.localStorage.getItem(namespaced(name))});define("set",function(name,value){window.localStorage.setItem(namespaced(name),value)});define("remove",function(name){var before_remove=get(name);if(before_remove){window.localStorage.removeItem(namespaced(name));return before_remove}});define("clear",function(options){options=options||{};for(var attr in window.localStorage){if(!((options.except||[]).map(namespaced).indexOf(attr)>=0)){remove(strip_namespace(attr))}}})}scope("Storage",(document.location.protocol=="file:"||/\.dev$/.test(document.domain))?"Local":"Cookies");