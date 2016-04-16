!function e(t,n,r){function i(o,s){if(!n[o]){if(!t[o]){var u="function"==typeof require&&require;if(!s&&u)return u(o,!0);if(a)return a(o,!0);var c=new Error("Cannot find module '"+o+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return i(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}for(var a="function"==typeof require&&require,o=0;o<r.length;o++)i(r[o]);return i}({1:[function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e){var t=function(){function t(n,i,a){var o=this;r(this,t),this.os=n,this._model=i,this._content=a,this.eventHandler=new e.utils.EventHandler(function(t){var n=[];t.forEach(function(t){if("Insert"===t.struct){var r=void 0;if(null===t.left)r=0;else if(r=1+o._content.findIndex(function(n){return e.utils.compareIds(n.id,t.left)}),0>=r)throw new Error("Unexpected operation!");var i,a;if(t.hasOwnProperty("opContent"))!function(){o._content.splice(r,0,{id:t.id,type:t.opContent});var e=t.opContent;a=1,i=function(){return new Promise(function(t){o.os.requestTransaction(regeneratorRuntime.mark(function n(){var r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.delegateYield(this.getType(e),"t0",1);case 1:r=n.t0,t([r]);case 3:case"end":return n.stop()}},n,this)}))})}}();else{var s=t.content.map(function(e,n){return{id:[t.id[0],t.id[1]+n],val:e}});o._content.splice.apply(o._content,[r,0].concat(s)),i=t.content,a=t.content.length}n.push({type:"insert",object:o,index:r,values:i,length:a})}else{if("Delete"!==t.struct)throw new Error("Unexpected struct!");var r=o._content.findIndex(function(n){return e.utils.compareIds(n.id,t.target)});r>=0&&!function(){var e=o._content.splice(r,t.length||1),i=[];e.forEach(function(e){e.hasOwnProperty("val")?i.push(e.val):i=function(){return new Promise(function(t){o.os.requestTransaction(regeneratorRuntime.mark(function n(){var r;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return n.delegateYield(this.getType(e.type),"t0",1);case 1:r=n.t0,t([r]);case 3:case"end":return n.stop()}},n,this)}))})}}),n.push({type:"delete",object:o,index:r,values:i,_content:e,length:t.length||1})}()}}),o.eventHandler.callEventListeners(n)})}return a(t,[{key:"_destroy",value:function(){this.eventHandler.destroy(),this.eventHandler=null,this._content=null,this._model=null,this.os=null}},{key:"get",value:function(e){var t=this;if(null==e||"number"!=typeof e)throw new Error("pos must be a number!");if(!(e>=this._content.length)){if(null==this._content[e].type)return this._content[e].val;var n=this._content[e].type;return new Promise(function(e){t.os.requestTransaction(regeneratorRuntime.mark(function r(){var t;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:return r.delegateYield(this.getType(n),"t0",1);case 1:t=r.t0,e(t);case 3:case"end":return r.stop()}},r,this)}))})}}},{key:"toArray",value:function(){return this._content.map(function(e,t){return e.val})}},{key:"push",value:function(e){this.insert(this._content.length,e)}},{key:"insert",value:function(t,n){if("number"!=typeof t)throw new Error("pos must be a number!");if(!(n instanceof Array))throw new Error("contents must be an Array of objects!");if(0!==n.length){if(t>this._content.length||0>t)throw new Error("This position exceeds the range of the array!");for(var r=0===t?null:this._content[t-1].id,i=[],a=[],o=r,s=0;s<n.length;){for(var u,c={left:o,origin:o,parent:this._model,struct:"Insert"},l=[];s<n.length;){var f=n[s++];if(u=e.utils.isTypeDefinition(f)){if(l.length>0){s--;break}}else l.push(f)}if(l.length>0)c.content=l,c.id=this.os.getNextOpId(l.length);else{var h=this.os.getNextOpId(1);a.push([u,h]),c.opContent=h,c.id=this.os.getNextOpId(1)}i.push(c),o=c.id}var p=this.eventHandler;this.os.requestTransaction(regeneratorRuntime.mark(function d(){var e,t,n,o,s;return regeneratorRuntime.wrap(function(u){for(;;)switch(u.prev=u.next){case 0:if(null==r){u.next=6;break}return u.delegateYield(this.getInsertionCleanEnd(r),"t0",2);case 2:t=u.t0,e=t.right,u.next=8;break;case 6:return u.delegateYield(this.getOperation(i[0].parent),"t1",7);case 7:e=u.t1.start;case 8:n=0;case 9:if(!(n<a.length)){u.next=14;break}return u.delegateYield(this.createType.apply(this,a[n]),"t2",11);case 11:n++,u.next=9;break;case 14:for(o=0;o<i.length;o++)s=i[o],s.right=e;return u.delegateYield(this.applyCreatedOperations(i),"t3",16);case 16:p.awaitedInserts(i.length);case 17:case"end":return u.stop()}},d,this)})),p.awaitAndPrematurelyCall(i)}}},{key:"delete",value:function(t,n){if(null==n&&(n=1),"number"!=typeof n)throw new Error("length must be a number!");if("number"!=typeof t)throw new Error("pos must be a number!");if(t+n>this._content.length||0>t||0>n)throw new Error("The deletion range exceeds the range of the array!");if(0!==n){for(var r=this.eventHandler,i=t>0?this._content[t-1].id:null,a=[],o=0;n>o;o+=s){var s,u=this._content[t+o].id;for(s=1;n>o+s&&e.utils.compareIds(this._content[t+o+s].id,[u[0],u[1]+s]);s++);a.push({target:u,struct:"Delete",length:s})}r.awaitAndPrematurelyCall(a),this.os.requestTransaction(regeneratorRuntime.mark(function c(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.delegateYield(this.applyCreatedOperations(a),"t0",1);case 1:r.awaitedDeletes(a.length,i);case 2:case"end":return e.stop()}},c,this)}))}}},{key:"observe",value:function(e){this.eventHandler.addEventListener(e)}},{key:"unobserve",value:function(e){this.eventHandler.removeEventListener(e)}},{key:"_changed",value:regeneratorRuntime.mark(function n(e,t){var r,i;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:if(t.deleted){n.next=13;break}if("Insert"!==t.struct){n.next=12;break}r=t.left;case 3:if(null==r){n.next=11;break}return n.delegateYield(e.getInsertion(r),"t0",5);case 5:if(i=n.t0,i.deleted){n.next=8;break}return n.abrupt("break",11);case 8:r=i.left,n.next=3;break;case 11:t.left=r;case 12:this.eventHandler.receivedOp(t);case 13:case"end":return n.stop()}},n,this)})},{key:"length",get:function(){return this._content.length}}]),t}();e.extend("Array",new e.utils.CustomType({name:"Array","class":t,struct:"List",initType:regeneratorRuntime.mark(function n(r,i){var a;return regeneratorRuntime.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:return a=[],n.delegateYield(e.Struct.List.map.call(this,i,function(e){e.hasOwnProperty("opContent")?a.push({id:e.id,type:e.opContent}):e.content.forEach(function(t,n){a.push({id:[e.id[0],e.id[1]+n],val:e.content[n]})})}),"t0",2);case 2:return n.abrupt("return",new t(r,i.id,a));case 3:case"end":return n.stop()}},n,this)})}))}var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();t.exports=i,"undefined"!=typeof Y&&i(Y)},{}]},{},[1]);
//# sourceMappingURL=y-array.js.map
