(function(){
    var waitForCondition = function (condition, callback) {
        var execute = function () {
            if(condition()) {
                callback();
            } else {
                setTimeout(execute, 100);
            }
        };
        execute();
    };
    waitForCondition(function () { return VWO && VWO._ && VWO._.libLoaded } , function () {

;(function() {
var constants_restrictions, vwo_lib, NativeConstants, ajax, gQuery, vwoUtils_tag, vwoUtils_utils, cookies, core, nls_utils, ajax_nls, constants_LibEventTypeEnum, vwoUtils_eventsManager, event_listeners, nls, constants_EventsEnum = {}, vwoUtils_vwo_utils, insertRule, html, init_init, customEvent, mutations, utils, recording, FocusBlurService, customFormElements, form_analysis, init_all_modules, module = {
    'paths': {
      'config': function () {
        return {
          'jquery': '../bower_components/jquery/jquery.min',
          'nls-jquery': 'nls-jquery'
        };
      }
    }
  };
constants_restrictions = function () {
  var restrictions = {
    // For followings account id, we will not wait for first html call to be success before sending further calls
    htmlSuccess: [6],
    // For followings account id, native constants library will be disabled
    disableNativeConstants: [
      307863,
      318739,
      337597,
      11708,
      354377,
      279614
    ]
  };
  /* jshint camelcase:false */
  // Getting account id from window, as nls.ids.account will not be available here
  var currentAccountId = window._vwo_acc_id;
  /* jshint camelcase:true */
  if (restrictions.disableNativeConstants.indexOf(currentAccountId) >= 0) {
    window.DISABLE_NATIVE_CONSTANTS = true;
  }
  return restrictions;
}();
vwo_lib = function () {
  var VWO = window.VWO = window.VWO || [];
  var console = window.console || {
    log: function () {
    }
  };
  var vwoLib = {
    /**
     * Process Events that will be pushed to window.VWO
     * @param evnt Array of arguments to be sent ( First element would be the name of the function and subsequent argument
     * will be arguments to that functions
     * @param contextName Context of the VWO library to process event, for ex ( 'survey', 'nls' )
     * @returns 0 or 1, 1 if function has been processed successfully, 0 if function context is not
     * matching or there is any exception in processing that function
     */
    processEvent: function (evnt, contextName) {
      try {
        var fullFunctionName = evnt[0], functionArgs = evnt.slice(1), doesContextExist = fullFunctionName.indexOf('.') !== -1;
        if (doesContextExist && fullFunctionName.indexOf(contextName) === 0 || !doesContextExist) {
          fullFunctionName = 'VWO.' + fullFunctionName;
          /* jshint evil:true */
          var functionReference = eval(fullFunctionName), context;
          context = fullFunctionName.split('.');
          context.splice(-1);
          context = eval(context.join('.'));
          /* jshint evil:false */
          if (functionReference) {
            functionReference.apply(context, functionArgs);
            return 1;
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      } catch (e) {
        console.error('Error occured in VWO Process Event (' + (evnt && evnt[0]) + '): ', e);
        return 0;
      }
    },
    /**
     * Overriding push to VWO to listen for any push to VWO queue
     * @param contextName Context of the VWO library to process event, for ex ( 'survey', 'nls' )
     */
    addPushListener: function (contextName) {
      var _push = VWO.push, isProcessed;
      VWO.push = function (evnt) {
        // Process push listeners that were attached earlier, first
        _push.apply(VWO, [].slice.call(arguments));
        // Only process event if it has not been removed by previous push
        if (VWO[VWO.length - 1] === evnt) {
          isProcessed = vwoLib.processEvent(evnt, contextName);
          // If evnt was actually pushed to array and processed successfully, remove it.
          // We don't want to keep processed events in queue
          if (VWO[VWO.length - 1] === evnt && isProcessed) {
            VWO.splice(-1);
          }
        }
      };
    },
    /**
     * Process already pushed events with the matching contextName ('survey', 'nls')
     * @param contextName Context of the VWO library to process event, for ex ( 'survey', 'nls' )
     */
    init: function (contextName) {
      var i = 0;
      while (i < VWO.length) {
        /* jshint expr: true */
        vwoLib.processEvent(VWO[i], contextName) === 1 ? VWO.splice(i, 1) : i++;  /* jshint expr: false */
      }
      vwoLib.addPushListener(contextName);
    }
  };
  return vwoLib;
}();
(function () {
  'use strict';
  // AMD Cleans converts define('NativeConstants', to NativeConstant =
  // which may conflict with the scope variable defined by require at the top
  var _NativeConstants = function () {
    var iframe, iframeContentWindow, setImmutable = function (objName, prop) {
        try {
          Object.defineProperty(objName, prop, { writable: false });
        } catch (e) {
        }
      }, overrideSetAttributeMethod = function (element) {
        element.setAttribute = function (attr, val) {
        };
      }, createNewIFrame = function () {
        // Create iframe element
        if (!window.DISABLE_NATIVE_CONSTANTS) {
          if (!document.body) {
            window.DISABLE_NATIVE_CONSTANTS = true;
            return;
          }
          iframe = window.document.createElement('iframe');
          //  To block someone from setting the src on iframe which leads to onerror
          setImmutable(iframe, 'src');
          overrideSetAttributeMethod(iframe);
          iframe.style.display = 'none';
          // onload used as you need to wait until the IFRAME has loaded to get the contentWindow
          // since sometimes it's possible that dynamic IFRAME isn't fully loaded and might lead to contentWindow as null
          iframe.onload = function () {
            iframeContentWindow = iframe.contentWindow;
            iframeContentWindow.onerror = function (msg, url, lineno, colno) {
              /* jshint expr: true */
              window.VWO && window.VWO._ && window.VWO._.customError && window.VWO._.customError({
                msg: msg,
                url: url,
                lineno: lineno,
                colno: colno,
                source: 'nativeConstants'
              });  /* jshint expr: false */
            };
          };
          // Append the iframe to the body of document
          document.body.appendChild(iframe);
          iframeContentWindow = iframe.contentWindow;
          if (iframeContentWindow) {
            // To block someone from setting href which leads to onerror
            setImmutable(iframeContentWindow.location, 'href');
          }
        }
      },
      // Returns the native constant using the iframe's content window
      get = function (constantName) {
        if (!iframe || !iframe.contentWindow) {
          createNewIFrame();
        }
        var context = iframeContentWindow;
        // Option to disable NativeConstants Library
        if (!context || window.DISABLE_NATIVE_CONSTANTS) {
          context = window;
        }
        return context[constantName];
      };
    createNewIFrame();
    // Allow access to get function
    return { get: get };
  }();
  if (true) {
    NativeConstants = function () {
      return _NativeConstants;
    }();
  }
}());
ajax = function (NativeConstants) {
  // Add any key here that you want to be automatically compressed
  var xmlRequestCall, ajax, keysForWhichWorkerIsRequired = [
      'html',
      'mutations',
      'recording'
    ], workerMessageIdCounter = 0, workerMessages = [], worker = null, console = {
      log: function () {
        if (!window.console || document.cookie.indexOf('vwo_log_mode') === -1) {
          return;
        }
        return window.console.log.apply(window, [].slice.call(arguments));
      }
    }, MAX_RETRIES = 3, retryRequest = function (type, data, options, statusCode) {
      setTimeout(function () {
        options.retries = options.retries || 0;
        options.retries++;
        if (options.retries <= MAX_RETRIES) {
          xmlRequestCall(type, data, options);
          if (options.type === 'POST') {
            var err = 'Analyze ' + options.type + ' call failed with data length: ' + options.dataLength + ' and statusCode: ' + statusCode + ' with retry ' + options.retries;
            // This code assumes _ to be defined, if not defined then something is fishy somewhere else not here
            ajax.sendError(err, 'ajax.js', 30);
          }
        }
      }, 50);
    };
  /**
  * @summary makes xmlHttp Request from IFrame.
  * @param {string} type - specifies format is 'JSON' or 'FORMDATA'.
  * @param {string} data - can be formdata or unserializedData.
  * @param {object} options - options to be used for XML http request
  * @return {Object} options - all the data required to make call.
   */
  xmlRequestCall = function (type, data, options) {
    var url = options.url;
    var XMLHttpRequest = NativeConstants.get('XMLHttpRequest');
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
    if (type === 'JSON') {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    } else {
      request.formData = data;
    }
    request.send(data);
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        if (this.response) {
          try {
            var JSON = NativeConstants.get('JSON');
            options.success(JSON.parse(this.response));
          } catch (e) {
          }
        } else {
          options.success();
        }
      } else {
        options.formData = this.formData;
        options.error();
        retryRequest(type, data, options, this.status);
      }
      options.complete();
    };
    request.onerror = function () {
      options.formData = this.formData;
      options.error();
      options.complete();
      retryRequest(type, data, options, this.status);
    };
  };
  ajax = {
    isWorkerAvailable: function () {
      return this.workerUrl;
    },
    isMultipartSupported: function () {
      return !!window.FormData;
    },
    isWorkerRequired: function (data) {
      var key;
      for (var i = 0; i < keysForWhichWorkerIsRequired.length; i++) {
        key = keysForWhichWorkerIsRequired[i];
        if (data[key]) {
          return true;
        }
      }
    },
    ajax: function (options) {
      options = options || {};
      var url = typeof options.url !== 'undefined' ? options.url : '', type = typeof options.type !== 'undefined' ? options.type : 'AUTO', unserializedData = options.data = typeof options.data !== 'undefined' ? options.data : {}, success = options.success = typeof options.success === 'function' ? options.success : function () {
        }, error = options.error = typeof options.error === 'function' ? options.error : function () {
        }, complete = options.complete = typeof options.complete === 'function' ? options.complete : function () {
        }, workerUrl = this.workerUrl = options.workerUrl, formData = options.formData, data;
      // If there's no data
      var Object = NativeConstants.get('Object');
      if (!Object.keys(unserializedData).length) {
        return;
      }
      // Create the query string
      data = this.createQueryString(unserializedData);
      // If we should send as GET
      if (type.toUpperCase() === 'GET' || type.toUpperCase() === 'AUTO' && data.length <= 1800) {
        options.type = 'GET';
        var Image = NativeConstants.get('Image');
        var pixel = new Image();
        pixel.src = url + '?' + data;
        pixel.onload = function () {
          success();
          complete();
        };
        pixel.onerror = function () {
          error();
          complete();
        };
      } else if (type.toUpperCase() === 'POST' || type.toUpperCase() === 'AUTO' && data.length > 1800) {
        options.url = options.url + '?_a=' + unserializedData.a + '&_u=' + encodeURIComponent(unserializedData.url);
        options.type = 'POST';
        var stringsToCompress = [];
        try {
          if (workerUrl) {
            worker = worker || new Worker(workerUrl);
          }
        } catch (e) {
        }
        if (formData) {
          xmlRequestCall('FormData', formData, options);
        } else {
          options.dataLength = options.dataLength || data.length;
          if (this.isWorkerRequired(unserializedData) && this.isWorkerAvailable() && this.isMultipartSupported() && worker) {
            for (var i = 0; i < keysForWhichWorkerIsRequired.length; i++) {
              stringsToCompress[i] = unserializedData[keysForWhichWorkerIsRequired[i]];
            }
            workerMessageIdCounter++;
            workerMessages[workerMessageIdCounter] = {
              data: unserializedData,
              options: options
            };
            worker.postMessage({
              id: workerMessageIdCounter,
              action: 'compress',
              strings: stringsToCompress
            });
            worker.onmessage = worker.onmessage || function (e) {
              var data = e.data, compressedStrings = data.strings;
              if (!workerMessages[data.id]) {
                return;
              }
              var originalData = workerMessages[data.id].data, originalOptions = workerMessages[data.id].options, compressedKey;
              if (data.action === 'compressed') {
                //console.log('Improvement',  (uncompressedHtml.length - compressedHtml.length) * 100 / compressedHtml.length);
                for (i = 0; i < compressedStrings.length; i++) {
                  //Prefix compressed keys
                  compressedKey = keysForWhichWorkerIsRequired[i];
                  if (compressedStrings[i]) {
                    originalData['c_' + compressedKey] = new Blob([compressedStrings[i]]);
                    console.log('Original Size: ' + originalData[compressedKey].length + ', Compressed Size: ' + originalData['c_' + compressedKey].size);
                    delete originalData[compressedKey];
                  }
                }
                var formData = new FormData();
                for (var key in originalData) {
                  if (originalData.hasOwnProperty(key)) {
                    formData.append(key, originalData[key]);
                  }
                }
                xmlRequestCall('FormData', formData, originalOptions);
                delete workerMessages[data.id];
              }
            };
          } else {
            xmlRequestCall('JSON', data, options);
          }
        }
      }
    },
    createQueryString: function (data) {
      var query = '';
      for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
          query += query.length ? '&' : '';
          query += prop + '=';
          query += encodeURIComponent(data[prop]);
        }
      }
      return query;
    },
    sendError: function (msg, url, lineNo, colNo) {
      // This code assumes _ to be defined, if not defined then something is fishy somewhere else not here
      if (window.VWO._.customError) {
        window.VWO._.customError({
          msg: msg,
          url: url,
          lineno: lineNo || 0,
          colno: colNo || 0,
          source: encodeURIComponent(window.location.href)
        });
      }
    }
  };
  return ajax;
}(NativeConstants);
gQuery = function () {
  var doc = document;
  var docEl = doc.documentElement;
  var slice = [].slice;
  var push = [].push;
  var mapEvents = {
    focus: { delegateType: 'focusin' },
    blur: { delegateType: 'focusout' },
    mouseenter: {
      delegateType: 'mouseover',
      bindType: 'mouseover'
    },
    mouseleave: {
      delegateType: 'mouseout',
      bindType: 'mouseout'
    },
    pointerenter: {
      delegateType: 'pointerover',
      bindType: 'pointerover'
    },
    pointerleave: {
      delegateType: 'pointerout',
      bindType: 'pointerout'
    }
  };
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;
      if (!document.documentElement.contains(el))
        return null;
      do {
        if (el.matches(s))
          return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
  var gQuery = function (selector, context) {
    return new gQuery.fn.init(selector, context);
  };
  var matches = function (el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  };
  var isString = function (item) {
    return typeof item === typeof '';
  };
  var noop = function () {
  };
  var isFunction = function (item) {
    return typeof item === typeof noop && item.call;
  };
  var uid = gQuery.uid = '_gQ' + Date.now();
  var getDataCache = function (node) {
    return node[uid] = node[uid] || {};
  };
  var setData = function (node, key, value) {
    return getDataCache(node)[key] = value;
  };
  var getData = function (node, key) {
    var c = getDataCache(node);
    var val = c[key];
    if (val === undefined) {
      val = node.dataset ? node.dataset[key] : gQuery(node).attr('data-' + key);
    }
    return val;
  };
  var frag;
  var parseHTML = function (str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
    }
    frag.body.innerHTML = str;
    return frag.body.childNodes;
  };
  var isWindow = function (elem) {
    return elem === elem.window;
  };
  var isDocument = function (elem) {
    return elem.nodeType === 9;
  };
  gQuery.extend = function (out) {
    var args = arguments;
    out = out || {};
    for (var i = 1; i < args.length; i++) {
      if (!args[i])
        continue;
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key))
          out[key] = args[i][key];
      }
    }
    return out;
  };
  gQuery.isArray = Array.isArray;
  gQuery.each = function () {
    var array;
    var callback;
    var args = arguments;
    if (args.length === 1 && isFunction(args[0])) {
      array = slice.call(this);
      callback = args[0];
    } else {
      array = args[0];
      callback = args[1];
    }
    for (var i = 0; i < array.length; i++) {
      callback(i, array[i]);
    }
  };
  gQuery.ajax = function (params) {
    var request = new XMLHttpRequest();
    request.open(params.method ? params.method : 'GET', params.url, true);
    if (!params.data) {
      params.data = null;
    }
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        if (!params.dataType) {
          this.response = JSON.parse(this.response);
        }
        if (params.success) {
          params.success(this.response);
        }
      }
    };
    request.onerror = function () {
      if (params.error) {
        params.error(this.response);
      }
    };
    request.send(params.data);
  };
  gQuery.isEmptyObject = function (obj) {
    return obj && Object.keys(obj).length === 0;
  };
  gQuery.fn = {
    constructor: gQuery,
    hasClass: function (className) {
      return slice.call(this).every(function (el) {
        return el.nodeType === 1 && el.classList.contains(className);
      });
    },
    ready: function (callback) {
      if (this[0] === doc) {
        if (doc.readyState !== 'loading') {
          callback();
        } else {
          doc.addEventListener('DOMContentLoaded', callback);
        }
      }
    },
    scrollTop: function () {
      var elem = this[0];
      if (isWindow(elem)) {
        return elem.pageYOffset;
      } else if (isDocument(elem)) {
        return elem.defaultView.pageYOffset;
      } else {
        return elem.scrollTop;
      }
    },
    scrollLeft: function () {
      var elem = this[0];
      if (isWindow(elem)) {
        return elem.pageXOffset;
      } else if (isDocument(elem)) {
        return elem.defaultView.pageXOffset;
      } else {
        return elem.scrollLeft;
      }
    },
    getComputedDimension: function (dimension, type) {
      var elem = this[0];
      dimension = dimension.charAt(0).toUpperCase() + dimension.slice(1);
      if (isDocument(elem)) {
        var document = elem.documentElement;
        return Math.max(elem.body['scroll' + dimension], elem.body['offset' + dimension], document['scroll' + dimension], document['offset' + dimension], document['client' + dimension]);
      } else if (isWindow(elem)) {
        return type && type.indexOf('outer') === 0 ? elem['inner' + dimension] : elem.document.documentElement['client' + dimension];
      } else {
        return elem.getBoundingClientRect()[dimension];
      }
    },
    height: function () {
      return this.getComputedDimension('height');
    },
    width: function () {
      return this.getComputedDimension('width');
    },
    is: function (selector) {
      if (!selector) {
        return false;
      }
      var match = false;
      this.each(function (index, el) {
        match = el === selector;
        return !match;
      });
      return match;
    },
    attr: function (name, value) {
      if (!name) {
        return undefined;
      }
      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }
        return this.each(function (index, el) {
          if (el.setAttribute) {
            el.setAttribute(name, value);
          } else {
            el[name] = value;
          }
        });
      }
      for (var key in name) {
        this.attr(key, name[key]);
      }
      return this;
    },
    outerWidth: function () {
      return this.getComputedDimension('width', 'outer');
    },
    outerHeight: function () {
      return this.getComputedDimension('height', 'outer');
    },
    offset: function () {
      var el = this[0];
      if (!el) {
        return {
          top: 0,
          left: 0
        };
      }
      var rect = el.getBoundingClientRect();
      var win = el.ownerDocument.defaultView;
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },
    index: function (el) {
      var els = slice.call(this);
      for (var i = 0; i < els.length; i++) {
        if (els[i] === el) {
          return i;
        }
      }
      return -1;
    },
    each: gQuery.each,
    on: function (eventName, delegate, callback, useCapture) {
      var originalCallback;
      if (isFunction(delegate)) {
        callback = delegate;
        delegate = null;
      }
      if (this[0] === document && eventName === 'ready') {
        this.ready(callback);
        return this;
      }
      if (delegate) {
        originalCallback = callback;
        callback = function (e) {
          var t = e.target;
          while (!matches(t, delegate)) {
            // It can be fired on the removed nodes where target could be null
            if (t === this || !t) {
              return t = false;
            }
            t = t.parentNode;
          }
          if (t) {
            originalCallback.call(t, e);
          }
        };
      }
      if (mapEvents[eventName]) {
        if (delegate && mapEvents[eventName].delegateType) {
          eventName = mapEvents[eventName].delegateType;
        } else if (mapEvents[eventName].bindType) {
          eventName = mapEvents[eventName].bindType;
        }
      }
      return this.each(function (index, node) {
        node.addEventListener(eventName, callback, !!useCapture);
      });
    },
    off: function (eventName, callback, useCapture) {
      return this.each(function (index, node) {
        node.removeEventListener(eventName, callback, !!useCapture);
      });
    },
    isChecked: function () {
      return this[0].getAttribute('checked') !== null;
    },
    isFocussed: function () {
      // Right now, supports only one element
      return this[0] === doc.activeElement;
    },
    closest: function (elements) {
      // Right now, supports only one element
      return new gQuery(this[0].closest(elements));
    },
    parent: function () {
      return new gQuery(this[0].parentNode);
    },
    val: function () {
      var value = this[0].value;
      if (value === 'string') {
        return value.replace(/\r/g, '');
      }
      return value == null ? '' : value;
    },
    prop: function (name, value) {
      if (isString(name)) {
        return value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        });
      }
      for (var key in name) {
        this.prop(key, name[key]);
      }
      return this;
    },
    data: function (name, value) {
      if (isString(name)) {
        return value === undefined ? getData(this[0], name) : this.each(function (index, v) {
          return setData(v, name, value);
        });
      }
      for (var key in name) {
        this.data(key, name[key]);
      }
      return this;
    },
    eq: function (index) {
      return gQuery(this.get(index));
    },
    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return index < 0 ? this[index + this.length] : this[index];
    },
    appendTo: function (parent) {
      var parents = gQuery(parent);
      for (var i = 0; i < parents.length; i++) {
        parents[i].appendChild(this[0]);
      }
      return this;
    },
    find: function (selector) {
      return gQuery(selector, this[0]);
    }
  };
  var init = gQuery.fn.init = function (selector, context) {
    // HTML String has been provided
    var isHTML = false;
    if (/<.+>/.test(selector)) {
      isHTML = true;
      try {
        selector = parseHTML(selector);
      } catch (e) {
        throw e;
      }
    }
    if (!selector) {
      return this;
    } else if (selector && selector.nodeType || isWindow(selector)) {
      this[0] = selector;
      this.length = 1;
      return this;
    } else if (selector) {
      context = context || doc;
      var returnValue = this.constructor();
      push.apply(returnValue, isHTML ? selector : context.querySelectorAll(selector));
      return returnValue;
    }
  };
  init.prototype = gQuery.fn;
  return gQuery;
}();
vwoUtils_tag = function () {
  var utils = VWO._.commonUtil;
  function Tag(type, maxCount, addTagCallback) {
    if (type === 'Array') {
      this.tags = [];
      this.lastSent = 0;
    } else if (type === 'Hash') {
      this.tags = {};
      this.sentTags = {};
    }
    this.type = type;
    this.maxCount = maxCount || Infinity;
    this.addTagCallback = addTagCallback || function () {
    };
  }
  Tag.prototype.add = function (tag, value) {
    if (!tag) {
      return;
    }
    var tags = this.tags;
    if (this.type === 'Array') {
      if (Object.prototype.toString.call(tag) !== '[object Array]') {
        tag = [tag];
      }
      // Purify tags
      tag = utils.map(tag, function (item) {
        item = encodeURIComponent(item.trim());
        return item;
      });
      tags = tags.concat(tag);
      tags = tags.slice(0, this.maxCount);
      // get unique tags
      tags = utils.filter(tags, function (item, pos) {
        return tags.indexOf(item) === pos;
      });
      this.tags = tags;
    } else if (this.type === 'Hash') {
      if (!(this.sentTags[tag] && this.sentTags[tag] === value)) {
        this.tags[encodeURIComponent(tag)] = encodeURIComponent(value);
      }
    }
    this.addTagCallback();
  };
  Tag.prototype.get = function () {
    // If recording disabled or no data addition
    if (!this.isTagPassed()) {
      return;
    }
    var tags;
    if (this.type === 'Array') {
      tags = this.tags.slice(this.lastSent);
      this.lastSent = this.tags.length;
    } else if (this.type === 'Hash') {
      tags = this.tags;
      utils.extend(this.sentTags, this.tags);
      this.tags = {};
    }
    return tags;
  };
  Tag.prototype.isTagPassed = function () {
    if (this.type === 'Array') {
      return this.tags.length > this.lastSent;
    } else if (this.type === 'Hash') {
      return utils.getKeys(this.tags).length > 0;
    }
    return false;
  };
  Tag.prototype.reset = function () {
    if (this.type === 'Array') {
      this.tags = [];
      this.lastSent = 0;
    } else if (this.type === 'Hash') {
      this.tags = {};
      this.sentTags = {};
    }
  };
  Tag.prototype.refresh = function () {
    if (this.type === 'Array') {
      this.lastSent = 0;
    } else if (this.type === 'Hash') {
      utils.extend(this.tags, this.sentTags);
      this.sentTags = {};
    }
  };
  return Tag;
}();
vwoUtils_utils = function () {
  var localStartTimeStamp = parseInt(+new Date() / 1000, 10), serverStartTimeStamp,
    // VWO.data.ts may not be defined by first call (in case of one smart code),
    // so, assigning it dynamically so that it will get the updated value dynamically
    getServerStartTimeStamp = function () {
      if (serverStartTimeStamp) {
        return serverStartTimeStamp;
      }
      serverStartTimeStamp = VWO.data.ts || localStartTimeStamp;
      return serverStartTimeStamp;
    };
  var utils = {
    /**
     * gte
     *
     * @param a
     * @param b
     * @return {undefined}
     */
    gte: function (a, b) {
      return a >= b;
    },
    /**
     * @function
     * @param {object} obj An object.
     * @return {Array.<string>} An array of keys of the passed object.
     * Uses browser's implementation of finding keys (if available) of any object or calculates them.
     */
    getKeys: Object.keys || function (obj) {
      var keys = [], key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys;
    },
    /**
     * Extend objects (shallow extend)
     * @param obj1
     * @param obj2
     */
    extend: function (obj1, obj2) {
      for (var i in obj2) {
        if (obj2.hasOwnProperty(i)) {
          obj1[i] = obj2[i];
        }
      }
    },
    forEach: function (obj, callback) {
      if (!obj || typeof callback !== 'function') {
        return;
      }
      var i;
      // TODO: Can optimize it
      if (obj instanceof Array) {
        for (i = 0; i < obj.length; i++) {
          if (callback(obj[i], i) === false) {
            // Break
            return;
          }
        }
      } else {
        for (i in obj) {
          if (obj.hasOwnProperty(i)) {
            if (callback(obj[i], i) === false) {
              // Break
              return;
            }
          }
        }
      }
    },
    arrayContains: function (haystack, needle) {
      if (!(haystack instanceof Array)) {
        return -1;
      }
      for (var i = 0; i < haystack.length; i++) {
        if (needle === haystack[i]) {
          return i;
        }
      }
    },
    setAttrs: function (el, attrs) {
      var keys = this.getKeys(attrs);
      for (var i = 0; i < keys.length; i++) {
        el.setAttribute(keys[i], attrs[keys[i]]);
      }
    },
    isAbsoluteUrl: function (url) {
      return /^(https?:\/\/|\/\/)/.test(url);
    },
    map: function (arr, callback) {
      var newArr = [];
      for (var i = 0; i < arr.length; i++) {
        newArr.push(callback(arr[i]));
      }
      return newArr;
    },
    filter: function (arr, callback) {
      var newArr = [];
      for (var i = 0; i < arr.length; i++) {
        if (callback(arr[i], i)) {
          newArr.push(arr[i]);
        }
      }
      return newArr;
    },
    /**
     * Returns server start time when library is loaded in sec or ms.
     * @param isSeconds {boolean} If true returns value in seconds otherwise in milliseconds.
     * @return {number} timestamp in seconds or milliseconds.
     */
    getServerStartTimestamp: function (isSeconds) {
      var _serverStartTimeStamp = getServerStartTimeStamp();
      if (isSeconds) {
        return _serverStartTimeStamp;
      } else {
        // Adding current miliseconds in the timestamp to get the precision to milliseconds
        return _serverStartTimeStamp * 1000 + +new Date() % 1000;
      }
    },
    /**
     * Returns current server time in sec or ms.
     * @param isSeconds {BOOLEAN} If true returns value in seconds otherwise in milliseconds.
     * @return {number} timestamp in seconds or milliseconds.
     */
    getCurrentTimestamp: function (isSeconds) {
      var _serverStartTimeStamp = getServerStartTimeStamp();
      var localCurrentTimeStamp = parseInt(+new Date() / 1000, 10);
      var timeDifference = localCurrentTimeStamp - localStartTimeStamp;
      if (isSeconds) {
        return _serverStartTimeStamp + timeDifference;
      } else {
        return (_serverStartTimeStamp + timeDifference) * 1000 + +new Date() % 1000;
      }
    },
    /**
     * Returns time zone difference, in hours, from UTC to current locale (host system settings).
     */
    getTimeZoneOffset: function () {
      var date = new Date();
      var currentTimeZoneOffsetInHours = date.getTimezoneOffset() / 60;
      return currentTimeZoneOffsetInHours;
    },
    /**
     * Throttle a function by specified time limit
     * @param callback Function to throttle
     * @param limit Time limit (in ms)
     * @returns {Function}
     */
    throttle: function (callback, limit) {
      var wait = false;
      // Initially, we're not waiting
      return function () {
        // We return a throttled function
        if (!wait) {
          // If we're not waiting
          callback.call();
          // Execute callback function
          wait = true;
          // Prevent future invocations
          setTimeout(function () {
            // After a period of time
            wait = false;  // allow future invocations
          }, limit);
        }
      };
    },
    /**
     * Debounce a function by specified time limit
     * @param callback Function to debounce
     * @param limit Time limit (in ms)
     * @returns {Function}
     */
    debounce: function (callback, limit) {
      var wait = false, timer;
      return function () {
        if (wait) {
          clearTimeout(timer);
          timer = null;
        }
        timer = setTimeout(function () {
          callback.call();
        }, limit);
        wait = true;
      };
    }
  };
  VWO._.commonUtil = utils;
  return utils;
}();
cookies = {
  // Create a cookie
  create: function (name, value, days, domain) {
    var expires = '';
    if (days) {
      var Date = NativeConstants.get('Date');
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toGMTString();
    } else {
      if (days === false) {
        expires = '; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
    }
    domain = domain ? '; domain=' + domain : '';
    document.cookie = name + '=' + value + expires + '; path=/' + domain;
  },
  // Get the value of a cookie
  get: function (name) {
    var nameEq = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEq) === 0) {
        return c.substring(nameEq.length, c.length);
      }
    }
    return null;
  },
  // Delete a cookie
  erase: function (name, domain) {
    this.create(name, '', false, domain);
  }
};
core = function (ajax, nlsjq, NativeConstants, Tag, utils, cookies) {
  var VWO = window.VWO || [];
  VWO._vba = VWO._vba || {};
  var MAX_RECORDING_TIME_IN_SESSION = 120;
  // In minutes
  /**
  * Find minimum and maximum element in array.
  * @param arr
  * @returns {min: number, max: number} Object
  */
  var findMinMax = function (arr) {
    var sortedData = arr.sort(function (a, b) {
      return a - b;
    }).filter(function (item) {
      return item;
    });
    return {
      min: sortedData[0] || 0,
      max: sortedData[sortedData.length - 1] || 0
    };
  };
  var nls = {
    visualViewportAvaialable: window.visualViewport,
    jq: nlsjq,
    version: '__LIB_VERSION__',
    ids: {
      /*jshint camelcase:false*/
      account: window._vwo_acc_id,
      experiment: {},
      re: {},
      he: {},
      fe: {},
      /*jshint camelcase:true*/
      recording: 0,
      html: 0,
      session: 0
    },
    tags: {
      eTags: new Tag('Hash'),
      eTagsV2: {
        f: new Tag('Array'),
        r: new Tag('Array'),
        h: new Tag('Array')
      },
      uTags: new Tag('Array')
    },
    heartBeatFrequency: VWO._vba.heartBeat || 4000,
    startTime: 0,
    returnVisitor: false,
    newSession: false,
    loadChance: 100,
    saveNewRecordingInitiatedOnce: false,
    lastTime: 0,
    enums: {
      formAnalysis: {
        // state to mark recording disable
        TEMPORARY_STATE: 'temporary',
        // state to mark session cookie deletion
        PERMANENT_STATE: 'permanent'
      }
    },
    stopRecording: false,
    sessionIdleTimeout: false,
    config: {
      // stop recording after 30mins: 30*60*1000 ms
      stopRecordingTime: 30 * 60 * 1000,
      // delete recording session after 0 mins
      deleteSessionRecordingTime: 0
    },
    recordingData: {
      totals: {
        movements: 0,
        clicks: 0,
        keyPresses: 0,
        scroll: 0,
        touches: 0,
        // Orientation Changes
        ocs: 0
      },
      last: {
        movements: 0,
        clicks: 0,
        keyPresses: 0,
        scroll: 0,
        touches: 0,
        ocs: 0
      },
      mouse: {
        lastMove: {
          docX: 0,
          docY: 0
        }
      }
    },
    htmlRequestSuccess: false,
    // enable timeout to disable recording
    triggerSessionIdleTimeout: function () {
      if (nls.sessionIdleTimeout) {
        return;
      }
      nls.sessionIdleTimeout = setTimeout(function () {
        nls.stopRecording = nls.enums.formAnalysis.TEMPORARY_STATE;
        nls.triggerSessionDeleteTimeout();
      }, nls.config.stopRecordingTime);
    },
    // enable timeout to delete session cookie
    triggerSessionDeleteTimeout: function () {
      nls.sessionIdleTimeout = setTimeout(function () {
        nls.stopRecording = nls.enums.formAnalysis.PERMANENT_STATE;
        cookies.erase('nlssid' + nls.ids.account, nls.getCookieDomain());
        cookies.erase('nlsrid' + nls.ids.account, nls.getCookieDomain());
      }, nls.config.deleteSessionRecordingTime);
    },
    // clear disable recording or session cookie deletion timeout
    clearSessionIdleTimeout: function () {
      if (nls.sessionIdleTimeout) {
        clearTimeout(nls.sessionIdleTimeout);
        nls.sessionIdleTimeout = false;
      }
    },
    resetAfterDataSent: function () {
      nls.recordingData.last.scroll = nls.recordingData.totals.scroll;
      nls.recordingData.last.movements = nls.recordingData.totals.movements;
      nls.recordingData.last.clicks = nls.recordingData.totals.clicks;
      nls.recordingData.last.keyPresses = nls.recordingData.totals.keyPresses;
      nls.recordingData.last.touches = nls.recordingData.totals.touches;
      nls.recordingData.last.ocs = nls.recordingData.totals.ocs;
      nls.resetTagAfterSent();
    },
    resetTagAfterSent: function () {
      // Make tags (only for version 2) available to send again
      nls.tags.eTagsV2.f.refresh();
      nls.tags.eTagsV2.r.refresh();
      nls.tags.eTagsV2.h.refresh();
    },
    checkIfIdle: function () {
      return nls.recordingData.last.scroll === nls.recordingData.totals.scroll && nls.recordingData.last.movements === nls.recordingData.totals.movements && nls.recordingData.last.clicks === nls.recordingData.totals.clicks && nls.recordingData.last.keyPresses === nls.recordingData.totals.keyPresses && nls.recordingData.last.touches === nls.recordingData.totals.touches && nls.recordingData.last.ocs === nls.recordingData.totals.ocs;
    },
    resetClicksCount: function () {
      this.recordingData.totals.clicks = 0;
      this.recordingData.last.clicks = 0;
    },
    /**
     * calculates duration and end time.
     * duration is calculated by finding => max(recording, mutation) - min(recording, mutation)
     * @param data
     * @param newRecording {BOOLEAN} First recording of every session has newRecording set to true.
     * @returns {{currentTime: (*|number), duration: (number|*)}}
     */
    calcDuration: function (data, newRecording) {
      data = data || {};
      var currentTime = utils.getCurrentTimestamp(), recordingData, mutationData, minRecordingTime, maxRecordingTime, minMutationTime, maxMutationTime, recDataDurationIndex = 1, duration, Math = NativeConstants.get('Math'), minMaxObj;
      if (data.recording) {
        recordingData = data.recording.split(',');
        minRecordingTime = +recordingData[0].split('_')[1];
        maxRecordingTime = +recordingData[recordingData.length - 1].split('_')[recDataDurationIndex];
      }
      if (data.mutations) {
        mutationData = NativeConstants.get('JSON').parse(data.mutations);
        if (mutationData instanceof NativeConstants.get('Array')) {
          minMutationTime = +mutationData[0].time;
          maxMutationTime = +mutationData[mutationData.length - 1].time;
        }
      }
      // It is possible that mutation occurred after recording event (like mouse click, scroll etc).
      // Same goes for start time of mutations and recordings.
      // So the total duration should consider the start time and end time of both recording and mutations.
      minMaxObj = findMinMax([
        maxRecordingTime,
        maxMutationTime,
        minRecordingTime,
        minMutationTime
      ]);
      // If max is zero that means no recording/mutation event occurred, then duration will be zero.
      // when it's first call of session, then also duration will be zero.
      // duration = idle_Time + current_max - current_min =   ( current_min - lastTime ) + current_max - current_min =  max - lastTime
      // BUG : scroll event is pushed even before first call of recording for first session is sent, so duration comes out to be negative, So abs is used.
      duration = newRecording || !minMaxObj.max ? 0 : Math.abs(minMaxObj.max - this.lastTime);
      // duration should be in seconds
      duration /= 1000;
      // If it's new recording, consider last time as (current Time - startTime (when lib execution started))
      // If duration is not zero, then lastTime will be the current maxTime.
      // If duration is zero, then lastTime shouldn't be updated as next event should consider the idle time since previous lastTime.
      // EXISTING BUG : Recording of Time interval between current session and before next session that is going to be started will be lost,
      // if no event occurred but mutations might have occurred.
      this.lastTime = newRecording ? currentTime - nls.startTime : duration ? minMaxObj.max : this.lastTime;
      return {
        currentTime: currentTime,
        duration: duration
      };
    },
    isMobile: function () {
      return /iphone|ipad|ipod|android|webos|opera mini|blackberry|iemobile|windows phone/i.test(navigator.userAgent);
    },
    getViewportDimensions: function () {
      var _window = {
          width: 0,
          height: 0
        }, dimensions;
      // Set the window height
      _window.width = this.isMobile() ? window.innerWidth : document.documentElement.clientWidth;
      _window.height = this.isMobile() ? window.innerHeight : document.documentElement.clientHeight;
      _window.height = parseInt(_window.height, 10);
      _window.height = _window.height || 0;
      if (nls.isMobile()) {
        dimensions = this.getDimensionsConsideringOrientation(_window.width, _window.height);
      } else {
        dimensions = {
          width: _window.width,
          height: _window.height
        };
      }
      return dimensions;
    },
    getAvailableDimensions: function () {
      var width = window.screen.availWidth || window.outerWidth, height = window.screen.availHeight || window.outerHeight, dimensions = this.getDimensionsConsideringOrientation(width, height);
      // Some browsers e.g. browsers on iOS report outerHeight and outerWidth to be 0.
      // In such cases, return 1, so that iframe in recording player are still visible with no scaling.
      return {
        height: dimensions.height,
        width: dimensions.width
      };
    },
    getDimensionsConsideringOrientation: function (width, height) {
      var isLandscapeMode = this.isLandscapeMode(), _width, _height, Math = NativeConstants.get('Math');
      if (isLandscapeMode) {
        _width = Math.max(width, height);
        _height = Math.min(width, height);
      } else {
        _height = Math.max(width, height);
        _width = Math.min(width, height);
      }
      return {
        width: _width,
        height: _height
      };
    },
    isLandscapeMode: function () {
      // When orientation is changed some devices resize event too before actually changing the orientation value.
      // So, in that case in resize callback, the orientation of device will actually be landscape but orientation value will report it as portrait.
      // So, check using height/width logic
      var isLandscapeMode;
      // For chrome version > 60, innerWidth and innerHeight represents layout viewport, so changing logic to identify landscape mode
      // As currently when keypad is opened, innerWidth becomes greater than innerHeight and hence gives wrong answer.
      // We are considering that if window.visualViewport exists then orientation is supported by browser which is for sure available for chrome > 60
      if (nls.visualViewportAvaialable && window.screen && window.screen.orientation) {
        isLandscapeMode = window.screen.orientation.type.indexOf('landscape') >= 0;
      } else {
        isLandscapeMode = window.innerWidth > window.innerHeight;
      }
      return isLandscapeMode;
    },
    /**
     * Screen Dimensions on iphone doesn;t change on orientation but it does on android
     * So, decide width and height based on which one is bigger in which orientation
     */
    getScreenDimensions: function () {
      var width = window.screen.width, height = window.screen.height, dimensions = this.getDimensionsConsideringOrientation(width, height);
      return {
        width: dimensions.width,
        height: dimensions.height
      };
    },
    /**
     * Screen Scale normally remains 1:1 only. But in following cases it get's changed
     * 1. If On mobile, someone opens touch keyboard. The space available might or might not get reduced depending on OS which can change scale depending on that.
     */
    getScreenScale: function () {
      var availableDimensions = nls.getAvailableDimensions(), screenDimensions = nls.getScreenDimensions();
      return {
        x: availableDimensions.width / screenDimensions.width,
        y: availableDimensions.height / screenDimensions.height
      };
    },
    /**
     * Identifies zooming level on mobile devices.  Assumption is that the innerWidth and innerHeight changes on zoom in /zoom out.
     * But it has stopped working after Chrome Version > 60. 
     * See https://confluence.wingify.com/display/VWOENG/How+zoom+in+and+zoom+out+calculated+in+mobile+devices+and+related+problems+with+chrome+version+%3E+60
     */
    getScale: function () {
      var screenDimensions = this.getScreenDimensions(), scaleX = screenDimensions.width / window.innerWidth, scaleY = screenDimensions.height / window.innerHeight;
      return {
        x: scaleX,
        y: scaleY
      };
    },
    getScrollPercentage: function () {
      var scroll = nlsjq(window).scrollTop(), docHeight = nlsjq(document).height(), winHeight = nlsjq(window).height(), Math = NativeConstants.get('Math');
      var scrollPercentage = Math.ceil(100 - (docHeight - (winHeight + scroll)) / docHeight * 100);
      if (isNaN(scrollPercentage)) {
        return 0;
      }
      if (scrollPercentage > 100) {
        return 100;
      }
      return scrollPercentage;
    },
    getPageTitle: function () {
      var title = document.getElementsByTagName('title')[0];
      if (title) {
        return title.innerHTML;
      }
      return document.title;
    },
    getCookieDomain: function () {
      var Date = NativeConstants.get('Date');
      var i = 0, domain = document.domain || window.location.host, p = domain.split('.'), s = 'nlsgd' + new Date().getTime();
      while (i < p.length - 1 && document.cookie.indexOf(s + '=' + s) === -1) {
        domain = p.slice(-1 - ++i).join('.');
        document.cookie = s + '=' + s + ';domain=' + domain + ';';
      }
      document.cookie = s + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + domain + ';';
      return domain;
    },
    /**
     * triggerLibEvent
     *
     * @param evName
     * @param data
     * @return {undefined}
     */
    triggerLibEvent: function (evName, data) {
      var Array = NativeConstants.get('Array');
      if (!(data instanceof Array)) {
        data = [data];
      }
      /*jshint camelcase:false*/
      window._vwo_evq.push([evName].concat(data));  /*jshint camelcase:true*/
    },
    isEligibleToSendRecordingData: function () {
      // Do not record further if recordign state is permanently stopped
      if (nls.stopRecording === nls.enums.formAnalysis.PERMANENT_STATE) {
        return false;
      }
      var currentTime = utils.getCurrentTimestamp(), sessionStartTime = nls.ids.session * 1000, diff;
      // in milliseconds
      diff = currentTime - sessionStartTime;
      // Convert enum to milliseconds
      if (diff > MAX_RECORDING_TIME_IN_SESSION * 60 * 1000) {
        nls.stopRecording = nls.enums.formAnalysis.PERMANENT_STATE;
        return false;
      }
      return true;
    }
  };
  return nls;
}(ajax, gQuery, NativeConstants, vwoUtils_tag, vwoUtils_utils, cookies);
nls_utils = function (nlsjq, nls) {
  var cookies = window.VWO._.cookies;
  var utils = {
    getNodeProperty: function (node, value, anonymizeKeys) {
      value = value || '';
      if (this.needsMasking(node, anonymizeKeys)) {
        return this.getMaskedValue(value);
      }
      return value;
    },
    getMaskedValue: function (value, type) {
      if (!value) {
        return '';
      }
      if (typeof value !== 'string') {
        return value;
      }
      if (type === 'password') {
        return '*';
      } else if (type === 'number') {
        return value.replace(/./gi, '0');
      } else if (type === 'date') {
        return '1970-01-01';
      } else {
        return value.replace(/./gi, '*');
      }
    },
    /**
     * Call this function if you want to check if given node is blacklisted
     * @param node HTML Node to be tested
     * @returns {boolean}
     */
    isElementBlacklisted: function (node, anonymizeKeys) {
      if (nlsjq(node).is(nls.Recording.bl)) {
        return true;
      } else if (node.classList && node.classList.contains('nls_protected')) {
        return true;
      } else if (node.tagName && (node.tagName.toLowerCase() === 'textarea' || node.tagName.toLowerCase() === 'option') && anonymizeKeys) {
        // textarea is a type of input, we should anonymize it's content
        // options content should also be anonymized
        return true;
      } else {
        return false;
      }
    },
    /**
     * Call this function if you want to check if given node is whitelisted
     * @param node HTML Node to be tested
     * @returns {boolean}
     */
    isElementWhitelisted: function (node) {
      if (nlsjq(node).is(nls.Recording.wl)) {
        return true;
      } else if (node.classList && node.classList.contains('nls_whitelist')) {
        return true;
      } else {
        return false;
      }
    },
    /**
     * Call this function if you want to check if non-input element should be masked
     * @param node HTML Node to be tested
     * @param anonymizeKeys If anonymizeKeys feature is enabled
     * @returns {boolean}
     */
    needsMasking: function (node, anonymizeKeys) {
      if (this.isElementWhitelisted(node)) {
        return false;
      } else if (this.isElementBlacklisted(node, anonymizeKeys)) {
        return true;
      } else {
        return node.parentNode && this.needsMasking(node.parentNode, anonymizeKeys);
      }
    },
    /**
     * Call this function if you want to check if input element should be masked
     * @param node HTML Node to be tested
     * @param anonymizeKeys If user has enabled anonymize keys feature on
     * @returns {boolean}
     */
    shouldAnonymizeValue: function (node, anonymizeKeys) {
      var $el = nlsjq(node), val = $el.val();
      if (!this.isElementWhitelisted(node) && (anonymizeKeys && $el.prop('type') !== 'submit' && $el.prop('type') !== 'reset') || this.isElementBlacklisted(node, anonymizeKeys) || !this.isElementWhitelisted(node) && val.match(/\d{3,}/) || $el.prop('type') === 'password' || $el.prop('type') === 'hidden') {
        return true;
      }
    },
    sanitizeActionData: function (str) {
      if (typeof str !== 'string') {
        // TODO: Log this as an error in our system.
        return 'INVALIDATA';
      }
      return str.replace(/_/g, '!-u-!').replace(/,/g, '!-c-!');
    },
    /**
           * fetches the value of attribute from element that has to be anonymized
           * @param $el {object} jquery element
     * @param attribute {string} name of attribute
     * @returns {string}
     */
    attributeValueToBeAnonymized: function ($el, attribute) {
      var val;
      switch (attribute) {
      case 'label':
        val = $el.attr('label');
        break;
      case 'value':
      default:
        val = $el.val();
      }
      return val;
    },
    /**
           *
     * @param el {object} Dom Node
     * @param anonymizeKeys {number} 1 or 0
     * @param attribute {string} name of attribute which is to be anonymized (default attribute to be anonymized is value)
     * @returns {string}
     */
    handleProtected: function (el, anonymizeKeys, attribute) {
      var $el = nlsjq(el), val = this.attributeValueToBeAnonymized($el, attribute);
      if (this.shouldAnonymizeValue(el, anonymizeKeys)) {
        val = this.getMaskedValue(val, $el.prop('type'));
      }
      return val;
    },
    getUUID: function () {
      // As this function is called when sending request and OPA is not initiialized till uuid and sessionId is created, we can read the value directly from cookie.
      return cookies.get('_vwo_uuid');
    }
  };
  return utils;
}(gQuery, core);
ajax_nls = function (nls, ajax, nlsjq, NativeConstants, restrictions, nlsUtils) {
  /*jshint camelcase:false */
  var serverUrl, serverUrlV2, callName = 'nls_ajax.php', KEYS_NOT_TO_SEND = [
      'eTags',
      'eTagsV2'
    ], vwoData = window.VWO.data, noop = function () {
    };
  var sessionUrlMapping = {};
  var callsCount = 0;
  var getWorkerUrl = function () {
      return !nls.faultyWorker && nls.workerUrl;
    }, isDataEligibleToSend = function (data) {
      var keys = Object.keys(data);
      if (keys.length > KEYS_NOT_TO_SEND.length) {
        return true;
      }
      for (var i = 0; i < keys.length; i++) {
        if (KEYS_NOT_TO_SEND.indexOf(keys[i]) === -1) {
          return true;
        }
      }
      return false;
    };
  function sendData(data, options) {
    serverUrl = 'https://dev.visualwebsiteoptimizer.com/';
    serverUrlV2 = nls.analyze && vwoData.asn && 'https://' + vwoData.asn + '/';
    options = options || {};
    var callback = options.callback || function () {
      }, workerURL = nls.analyze || window.VWO._vba.forceWorker ? getWorkerUrl() : null, url = (serverUrlV2 || serverUrl) + callName, sessionId = nls.ids.session;
    if (sessionUrlMapping[sessionId]) {
      if (sessionUrlMapping[sessionId] !== url) {
        // This is an error, same session call should not go to different servers. Logging at backend in this case
        ajax.sendError('Recording url is not matching ' + '__ previous url: ' + sessionUrlMapping[sessionId] + ' ' + '__ new url: ' + url + ' ' + '__ sessionId: ' + sessionId + '__ uuid: ' + nlsUtils.getUUID(), 'ajax-nls.js', 33);
        sessionUrlMapping[sessionId] = url;
      }
    } else {
      sessionUrlMapping[sessionId] = url;
    }
    data.count = ++callsCount;
    ajax.ajax({
      url: url,
      type: options.method,
      data: data,
      workerUrl: workerURL,
      success: function (data) {
        callback(data);
      }
    });
  }
  function getAnalyzeData() {
    var data = {};
    var JSON = NativeConstants.get('JSON');
    if (nls.r) {
      data.re = JSON.stringify(nls.ids.re);
    }
    if (nls.hs) {
      data.he = JSON.stringify(nls.ids.he);
    }
    if (nls.fae) {
      data.fe = JSON.stringify(nls.ids.fe);
    }
    return data;
  }
  return {
    formSubmitCallbacks: [],
    saveNewRecording: function (callback) {
      var screenSize = nls.getViewportDimensions();
      var currentScroll = nls.getScrollPercentage();
      var forms = nls.formAnalysis ? nls.formAnalysis.forms : {};
      var recordingTime = nls.calcDuration(null, true), recordingData, formData, heatmapData, analyzeData, tagData = {};
      callback = callback || noop;
      if (!nls.isEligibleToSendRecordingData()) {
        return;
      }
      nls.recordingData.totals.scroll = currentScroll < 1 ? 10 : currentScroll;
      var screenDimensions = nls.getScreenDimensions();
      var JSON = NativeConstants.get('JSON');
      var data = {
        codedo: 'set_html_and_recording',
        a: nls.ids.account,
        e: JSON.stringify(nls.ids.experiment),
        /*jshint camelcase:true */
        title: nls.getPageTitle(),
        url: window.location.href,
        /*jshint camelcase:false*/
        referring_url: document.referrer,
        session_id: nls.ids.session,
        recording_id: nls.ids.recording,
        return_visitor: nls.returnVisitor,
        ins: nls.newSession,
        // Its used as session created on time. So it needs to be sent always
        start_time: nls.startTime,
        end_time: recordingTime.currentTime,
        window_width: screenSize.width,
        window_height: screenSize.height,
        sh: screenDimensions.height,
        sw: screenDimensions.width,
        vn: nls.version
      };
      // Reset it for subsequent calls
      nls.newSession = false;
      if (nls.hs) {
        heatmapData = { scroll_percentage: nls.recordingData.totals.scroll };
      }
      if (nls.fae) {
        formData = { forms: JSON.stringify(forms) };
      }
      if (nls.r) {
        recordingData = {
          duration: recordingTime.duration,
          clicks: nls.recordingData.totals.clicks,
          movements: nls.recordingData.totals.movements,
          end_time: recordingTime.currentTime
        };
        /*jshint camelcase:true*/
        if (nls.Recording) {
          nls.Recording.addInitialHTML(data);
        }
      }
      // TODO: This is for compatibility with old campaigns ANALYSIS
      if (nls.analyze) {
        // Sending account id and page url for debugging purpose in error logs
        callName = 'analyze';
        analyzeData = getAnalyzeData();
        //delete data.e;
        if (nls.fae) {
          formData.f = JSON.stringify(nls.formAnalysis ? nls.formAnalysis.f : {});
        }
        tagData = nls.getTags();
        nls.resetTagAfterSent();
      }
      nlsjq.extend(data, recordingData, formData, heatmapData, analyzeData, tagData);
      sendData(data, { callback: callback });
      nls.resetClicksCount();
    },
    sendRecordingData: function (forcePush, url) {
      if (restrictions.htmlSuccess.indexOf(nls.ids.account) === -1 && !nls.htmlRequestSuccess) {
        return false;
      }
      var response, data, recordingTime, extraData, isIdle = nls.checkIfIdle(), isNewDataThere, recordingData, analyzeData, JSON = NativeConstants.get('JSON');
      // Handle the functionality after recording has been stopped
      // or the session cookie has been deleted
      if (!forcePush) {
        if (!nls.isEligibleToSendRecordingData()) {
          return;
        }
        switch (nls.stopRecording) {
        // When recording has been disabled
        case nls.enums.formAnalysis.TEMPORARY_STATE:
          // If recording has been disabled, though the user has become active
          if (!isIdle) {
            nls.resetAfterDataSent();
            nls.clearSessionIdleTimeout();
            nls.triggerSessionDeleteTimeout();
          }
          return;
        // If recording has been disabled and session cookie has been deleted
        case nls.enums.formAnalysis.PERMANENT_STATE:
          return;
        }
        // If idle, trigger timeout to stop recording
        if (isIdle) {
          nls.triggerSessionIdleTimeout();
          // If isIdle
          if (isIdle) {
            return;
          }
          // Clear session idle timeout if any
          nls.clearSessionIdleTimeout();
        }
        // Send the data
        data = {
          a: nls.ids.account,
          e: JSON.stringify(nls.ids.experiment),
          /*jshint camelcase:false*/
          url: url || window.location.href,
          session_id: nls.ids.session,
          recording_id: nls.ids.recording,
          vn: nls.version
        };
        extraData = {};
        /* jshint camelcase:true */
        for (var index in this.formSubmitCallbacks) {
          if (this.formSubmitCallbacks.hasOwnProperty(index)) {
            // uses nls.recordingData.last
            response = this.formSubmitCallbacks[index]();
            if (response) {
              nlsjq.extend(extraData, response);
            }
          }
        }
        recordingTime = nls.calcDuration(extraData);
        if (nls.r) {
          /*jshint camelcase:false*/
          recordingData = {
            movements: nls.recordingData.totals.movements,
            clicks: nls.recordingData.totals.clicks,
            duration: recordingTime.duration,
            start_time: nls.startTime,
            end_time: recordingTime.currentTime
          };
          isNewDataThere = true;  /*jshint camelcase:true*/
        }
        if (isDataEligibleToSend(extraData)) {
          isNewDataThere = true;
          nlsjq.extend(data, extraData);
        }
        if (!isNewDataThere) {
          // Resetting tags if there is no data to send, so that tags can be sent in further calls
          nls.resetTagAfterSent();
          return;
        }
        if (nls.analyze) {
          callName = 'analyze';
          analyzeData = getAnalyzeData();
          data.fRS = nls.htmlRequestSuccess;
          delete data.e;
        }
        nlsjq.extend(data, recordingData, analyzeData);
        // makes changes to nls.recordingData.last representing last sent data
        nls.resetAfterDataSent();
        sendData(data);
        nls.resetClicksCount();
      }
    }
  };
}(core, ajax, gQuery, NativeConstants, constants_restrictions, nls_utils);
constants_LibEventTypeEnum = function () {
  var LibEventTypeEnum = { INIT: 'nls.init' };
  return LibEventTypeEnum;
}();
vwoUtils_eventsManager = function () {
  // Singleton Instance because multiple JSLib libraries will be consuming the events manager
  // and we want it to be the single source of truth.
  if (VWO._.eventsManager) {
    return VWO._.eventsManager;
  }
  // Events listener queue where are storing the reference of events listeners for native javascript & jquery.
  var events = [], shouldPushToQueue = true, eventsManager;
  var timerQueue = [];
  // This enum is used to find the opposite of event name to turn off the events.
  var REVERSE_TYPE = {
    'bind': 'unbind',
    'live': 'die',
    'on': 'off'
  };
  // Original State of methods that we might override somewhere.
  var originalStates = [];
  function init(options) {
    shouldPushToQueue = options.shouldPushToQueue;
  }
  // Push setTimeout & setInterval in this queue.
  function pushTimers(name, type) {
    if (!shouldPushToQueue) {
      return;
    }
    timerQueue.push({
      name: name,
      type: type
    });
    return eventsManager;
  }
  // Clear timesouts & intervals from timerQueue
  function clearTimers() {
    for (var i = 0; i < timerQueue.length; i++) {
      var currentTimer = timerQueue[i];
      if (currentTimer.type === 'interval') {
        clearInterval(currentTimer.name);
      } else {
        clearTimeout(currentTimer.name);
      }
    }
  }
  // Add jquery event listener references
  function addJqEventListener($el, jqType, eventName, callback, selector, capture) {
    if (shouldPushToQueue) {
      events.push({
        $el: $el,
        jqType: jqType,
        eventName: eventName,
        callback: callback,
        selector: selector,
        capture: capture
      });
    }
    if (selector) {
      $el[jqType](eventName, selector, callback, capture);
    } else {
      $el[jqType](eventName, callback, capture);
    }
    return eventsManager;
  }
  // Remove jquery event listener references
  function removeJqEventListener($el, jqType, eventName, callback, selector, capture) {
    if (jqType) {
      if (selector) {
        $el[REVERSE_TYPE[jqType]](eventName, selector, callback, capture);
      } else {
        $el[REVERSE_TYPE[jqType]](eventName, callback, capture);
      }
    }
  }
  // Add pure javascript event listener references
  function addEventListener($el, eventName, callback, capture) {
    if (shouldPushToQueue) {
      events.push({
        $el: $el,
        name: eventName,
        callback: callback,
        capture: capture
      });
    }
    if ($el.addEventListener) {
      $el.addEventListener(eventName, callback, capture);
    } else if ($el.attachEvent) {
      $el.attachEvent('on' + eventName, callback, capture);
    }
    return eventsManager;
  }
  // Remove pure javascript event listener references
  function clearAllListeners() {
    for (var i = 0; i < events.length; i++) {
      var currentEvent = events[i];
      var currentEl = currentEvent.$el;
      if (!currentEvent.jqType) {
        if (currentEl.removeEventListener) {
          currentEl.removeEventListener(currentEvent.name, currentEvent.callback, currentEvent.capture);
        } else if (currentEl.detachEvent) {
          currentEl.detachEvent('on' + currentEvent.name, currentEvent.callback);
        }
      } else {
        removeJqEventListener(currentEl, currentEvent.jqType, currentEvent.eventName, currentEvent.callback, currentEvent.selector, currentEvent.capture);
      }
    }
    clearTimers();
    revertOverriddenStates();
    events.length = 0;
    originalStates.length = 0;
    timerQueue.length = 0;
    return eventsManager;
  }
  // Store reference for functions which have been overriden
  function addOverrideState(type, state) {
    if (!shouldPushToQueue) {
      return;
    }
    originalStates.push({
      type: type,
      state: state,
      ref: type[state]
    });
  }
  // Revert references which were overriden
  function revertOverriddenStates() {
    // since same state can be overridden multiple times, so reverting it in reverse order
    // matching with stack -> LIFO (last in first out)
    for (var i = originalStates.length - 1; i >= 0; i--) {
      var currentState = originalStates[i];
      currentState.type[currentState.state] = currentState.ref;
    }
  }
  eventsManager = {
    addEventListener: addEventListener,
    clearAllListeners: clearAllListeners,
    addJqEventListener: addJqEventListener,
    pushTimers: pushTimers,
    addOverrideState: addOverrideState,
    revertOverriddenStates: revertOverriddenStates,
    init: init
  };
  VWO.destroy = eventsManager.clearAllListeners;
  VWO._.eventsManager = eventsManager;
  return eventsManager;
}();
event_listeners = function (nls, nlsjq, ajaxnls, utils, eventsManager) {
  function onTouchStart() {
    nls.recordingData.totals.touches++;
  }
  function onKeyUp() {
    // Update key press total
    nls.recordingData.totals.keyPresses++;
  }
  function onMouseUp(e) {
    var el = e.target;
    // If this is the window scrollbar
    if (el.nodeName === 'HTML') {
      return;
    }
    // Update click total
    nls.recordingData.totals.clicks++;
  }
  function onMouseMove(e) {
    var el = e.target;
    // Set the current mouse move data
    var curMoveTag = el.nodeName;
    var curMoveDocX = e.pageX;
    var curMoveDocY = e.pageY;
    // If this is the page scrollbar
    if (curMoveTag === 'HTML') {
      return;
    }
    // If the mouse hasn't moved
    if (nls.recordingData.mouse.lastMove.docX === curMoveDocX && nls.recordingData.mouse.lastMove.docY === curMoveDocY) {
      return;
    }
    // Update mouse movement total
    nls.recordingData.totals.movements++;
    nls.recordingData.mouse.lastMove.docX = curMoveDocX;
    nls.recordingData.mouse.lastMove.docY = curMoveDocY;
  }
  var debouncedSendData = utils.debounce(ajaxnls.sendRecordingData.bind(ajaxnls), 100);
  function onWindowScroll() {
    // Update the scroll percentage
    var curScroll = nls.getScrollPercentage();
    if (curScroll > nls.recordingData.totals.scroll && curScroll > 0) {
      nls.recordingData.totals.scroll = curScroll;
      // Send data
      /*jshint validthis: true */
      debouncedSendData();
    }
  }
  function init() {
    eventsManager.addJqEventListener(nlsjq(window), 'on', 'scroll', onWindowScroll);
    eventsManager.addEventListener(document, 'mouseup', onMouseUp);
    eventsManager.addEventListener(document, 'keyup', onKeyUp);
    eventsManager.addEventListener(document, 'mousemove', onMouseMove);
    eventsManager.addEventListener(document, 'touchstart', onTouchStart);
  }
  var EventListners = { init: init };
  nls.EventListners = EventListners;
}(core, gQuery, ajax_nls, vwoUtils_utils, vwoUtils_eventsManager);
nls = function (nls, ajaxnls, LibEventTypeEnum, EventListners, NativeConstants, cookies, eventsManager) {
  var createSessionIdCookie = function () {
    // Handle cookies and capture frequency
    var visitorSessionId = cookies.get('nlssid' + nls.ids.account);
    if (visitorSessionId) {
      nls.ids.session = visitorSessionId;
      nls.returnVisitor = true;
    } else {
      /*jshint camelcase:false*/
      nls.ids.session = window._vwo_pa.sId;
      /*jshint camelcase:true*/
      // Create the session cookie
      cookies.create('nlssid' + nls.ids.account, nls.ids.session, null, nls.getCookieDomain());
      nls.returnVisitor = false;
    }
  };
  var createRecordingIdCookie = function () {
    var recordingId = parseInt(cookies.get('nlsrid' + nls.ids.account), 10);
    recordingId = isNaN(recordingId) ? 1 : recordingId + 1;
    nls.ids.recording = recordingId;
    cookies.create('nlsrid' + nls.ids.account, recordingId, 365, nls.getCookieDomain());
  };
  var listenerAdded = false;
  var isIElt11 = function () {
    var myNav = navigator.userAgent.toLowerCase();
    return myNav.indexOf('msie') !== -1 ? parseInt(myNav.split('msie')[1], 10) : false;
  };
  var getTags = function () {
    var tagData = {}, eTags = nls.tags.eTags.get(),
      // TODO: Make it a module to handle all tags
      eTagsV2 = {
        f: nls.tags.eTagsV2.f.get(),
        r: nls.tags.eTagsV2.r.get(),
        h: nls.tags.eTagsV2.h.get()
      }, uTags = nls.tags.uTags.get(), JSON = NativeConstants.get('JSON');
    if (eTags) {
      tagData.eTags = JSON.stringify(eTags);
    }
    if (eTagsV2.f || eTagsV2.r || eTagsV2.h) {
      // JSON stringify will remove the undefined keys already from the final object
      tagData.eTagsV2 = JSON.stringify(eTagsV2);
    }
    if (uTags) {
      tagData.uTags = JSON.stringify(uTags);
    }
    return tagData;
  };
  nls.getTags = getTags;
  var init = function (modules, isNewPageView) {
    // If this is a bot
    if (/bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)) {
      return;
    }
    // For backward compatibility, jslib could be old and 'tSC' event has not been triggered (init.js:updateSession)
    if (!nls.ids.session) {
      createSessionIdCookie();
      createRecordingIdCookie();
    }
    // If either the session id or returnVisitor variable are undefined. This can happen when nls session cookie creation fails.
    if (typeof nls.ids.session === 'undefined' || typeof nls.returnVisitor === 'undefined') {
      return;
    }
    function process() {
      // node.cloneNode has issue in IE 9, and mutations are not recorded in IE
      if (!isIElt11()) {
        nls.GetHtml.init(isNewPageView);
      }
      // Do not add listeners multiple times
      if (!listenerAdded) {
        nls.EventListners.init();
        listenerAdded = true;
      }
      ajaxnls.formSubmitCallbacks.push(getTags);
      for (var index in modules) {
        if (modules.hasOwnProperty(index)) {
          nls[modules[index]].init(isNewPageView);
        }
      }
      nls.triggerLibEvent(LibEventTypeEnum.INIT);
      // Save and start it
      ajaxnls.saveNewRecording(function () {
        // Set interval to send data
        nls.saveNewRecordingInitiatedOnce = true;
        var sendRecordingDataInterval = setInterval(ajaxnls.sendRecordingData.bind(ajaxnls), nls.heartBeatFrequency);
        eventsManager.pushTimers(sendRecordingDataInterval, 'interval');
        nls.htmlRequestSuccess = true;
      });
    }
    process();
  };
  return { init: init };
}(core, ajax_nls, constants_LibEventTypeEnum, event_listeners, NativeConstants, cookies, vwoUtils_eventsManager);
constants_EventsEnum = function (exports) {
  /**
   * Enum of all event types
   */
  var EventsEnum = { RECORDING_INITIATED: 'rI' };
  return EventsEnum;
}(constants_EventsEnum);
vwoUtils_vwo_utils = function () {
  /**
   * finds if class passed is unique class in DOM or not.
   * @param className class name in string format
   * @param nonUniqueClassMap
   * @returns {boolean} boolean of class is unique or not.
   */
  var isUniqueClass = function (className, nonUniqueClassMap) {
    if (!className) {
      return;
    }
    var searchElement, classSelector = '.' + className,
      /* jshint camelcase:false*/
      $ = window.vwo_$;
    /* jshint camelcase:true*/
    nonUniqueClassMap = nonUniqueClassMap || {};
    if (nonUniqueClassMap[className]) {
      return false;
    }
    try {
      searchElement = $(classSelector);
    } catch (e) {
      searchElement = '';
    }
    if (1 === searchElement.length) {
      return true;
    }
    nonUniqueClassMap[className] = true;
    return false;
  };
  /**
   * @param {id} id in string format.
   * @return {boolean} boolean id is unique or not.
   * finds if class passed is unique class in DOM or not.
   */
  var isValidElementId = function (id) {
    if (!id) {
      return;
    }
    var searchElement,
      /* jshint camelcase:false*/
      $ = window.vwo_$;
    /* jshint camelcase:false*/
    try {
      searchElement = $('#' + id);
    } catch (e) {
      searchElement = '';
    }
    return searchElement.length;
  };
  var vwoUtils = {
    /**
     * isNewVisitor It will tell you if visitor is new or returning
     * @return {boolean}
     */
    isNewVisitor: function () {
      var v = vwoUtils.gC('_vis_opt_s');
      if (v) {
        return 1 >= parseInt(v.split('|')[0], 10);
      }
      return true;
    },
    /**
     * @param {element} el DOM node whose previous sibling has to be found.
     * @return {element} el DOM node of sibling.
     * finds the previous sibling of element.
     */
    previousElementSibling: function (el) {
      if (el.previousElementSibling) {
        return el.previousElementSibling;
      }
      /* jshint -W084 */
      while (el = el.previousSibling) {
        if (1 === el.nodeType) {
          return el;
        }
      }
    },
    /**
     * @param {object} el DOM node whose xpath has to be found.
     * @param {array} [nonUniqueClassMap] optional (used in recursion loop)
     * @return {string} Jquery compatible xpath of the element.
     * Calculates the xpath of a DOM node.
     */
    getXPath: function (el, nonUniqueClassMap) {
      if (!el) {
        return null;
      }
      //Fix for QF-5147, do not include the document in xpath
      if (el === document) {
        return '#document';
      }
      nonUniqueClassMap = nonUniqueClassMap || {};
      var e = el, names = [], tag = el.tagName, matches, id, classes, className,
        /* jshint camelcase:false*/
        $ = window.vwo_$,
        /* jshint camelcase:true*/
        classSelector;
      if (typeof tag === 'string' && ('body' === tag.toLowerCase() || 'head' === tag.toLowerCase())) {
        return tag;
      }
      while (el) {
        tag = el.tagName;
        matches = tag.match(/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/);
        //IE6,7,8 has a bug which considers ending script tag as a separate node with nodeName /SCRIPT due to which match fails
        if (!tag || !matches || (matches && matches[0]) !== tag) {
          //TODO-4:it needs to be modified as per https://github.com/davidmurdoch/sizzle/commit/0f1163a6a13d12186cb187e94338686b66ad8237
          tag = '*';
        }
        try {
          id = $(el).attr('id');
        } catch (e) {
          id = el.id;
        }
        if (id && typeof id === 'string' && isValidElementId(id)) {
          tag = tag + '#' + id;
        }
        classes = el.getAttribute('class');
        classes = classes ? classes.split(/\s+/) : [];
        for (var i = 0; i < classes.length; i++) {
          className = classes[i];
          classSelector = '.' + className;
          if (isUniqueClass(className, nonUniqueClassMap)) {
            tag += classSelector;
            break;
          }
        }
        names.unshift(tag);
        el = vwoUtils.previousElementSibling(el);
      }
      // due to <base href="" data-vwo=""> added in head tag in player, path made using :first-child while recording is not found during playing
      if (names[0].indexOf('#') === -1 && (!e.parentNode || e.parentNode.nodeName !== 'HEAD')) {
        names[0] += ':first-child';
      }
      // join these paths with a '+'
      return vwoUtils.getXPath(e.parentNode, nonUniqueClassMap) + ' > ' + names.join(' + ');
    }
  };
  // TODO: this is done for unit test cases, we can remove it after fixing test cases
  vwoUtils.isUniqueClass = isUniqueClass;
  return vwoUtils;
}();
insertRule = function (nls, NativeConstants, vwoUtils, utils) {
  var obj = {
    /**
     * insert rule api overridden
     * @param context
     */
    overRideInsertRule: function (context) {
      var nativeInsertRuleApi = CSSStyleSheet.prototype.insertRule;
      CSSStyleSheet.prototype.insertRule = function () {
        var arg = Array.prototype.slice.call(arguments), insertRule = [];
        // Added in try catch because -
        // If user gave index > total cssRuLES, it will break the code with DOM exception.
        // There may be other reasons too for InsertRuleApi getting failed
        try {
          nativeInsertRuleApi.apply(this, arguments);
        } catch (e) {
          throw new Error(e);
        } finally {
          insertRule.push({
            parentSelector: vwoUtils.getXPath(this.ownerNode),
            rule: arg[0],
            index: arg[1]
          });
          context.addMutation({
            time: utils.getCurrentTimestamp() - nls.startTime,
            insertedRules: [{ addedStyles: insertRule }]
          });
        }
      };
    },
    /*
    overRideDeleteRule: function (context) {
        var nativeDeleteRuleApi = CSSStyleSheet.prototype.deleteRule;
        CSSStyleSheet.prototype.deleteRule = function() {
            var arg = Array.prototype.slice.call(arguments),
                e = nativeDeleteRuleApi.apply(this, arguments),
                deleteRule = [];
            deleteRule.push({
                parentSelector: vwoUtils.getXPath(this.ownerNode),
                index: arg[0]
            });
            //return obj.insertRule;
            context.addMutation({
                time: (utils.getCurrentTimestamp() - nls.startTime),
                insertedRules: [{deletedStyles : deleteRule}]
            });
        }
    },*/
    /**
     * style tags in which css rules were inserted using insert rule api are added in initial HTML
     */
    processInsertRules: function () {
      var insertedStyleRules = obj.getCurrentInsertedRules();
      var that = this;
      for (var i = 0; i < insertedStyleRules.length; i++) {
        var style = insertedStyleRules[i];
        [].forEach.call(style.cssRules, function (cssRule, index) {
          var xPath = vwoUtils.getXPath(style.ownerNode);
          var insertRule = [];
          insertRule.push({
            parentSelector: xPath,
            rule: cssRule.cssText,
            index: index
          });
          that.html.insertedRules.push({ addedStyles: insertRule });
        });
      }
    },
    /**
     * returns the style nodes in which there is a possibility of adding css rules using insert rule api
     * It compares the '{' in cssText with cssRules, so if cssRules > '{', means insert rule api used.
     * @returns {Array}
     */
    getCurrentInsertedRules: function () {
      var insertedStyleRules = [];
      [].forEach.call(document.styleSheets, function (style, index) {
        // early return iff stylesheets has href, cssRules doesn't exists, cssRules has length 0
        if (style.href || !style.cssRules || style.cssRules.length === 0) {
          return;
        }
        var innerText;
        typeof style.ownerNode.innerText !== 'undefined' ? innerText = style.ownerNode.innerText : typeof style.ownerNode.innerHTML !== 'undefined' && (innerText = style.ownerNode.innerHTML);
        // regex /{/g matches number of '{' in innerText as it give count of number of css rules applied
        var numberOfCurlyBraces = innerText.match(/{/g) || [];
        if (numberOfCurlyBraces.length < style.cssRules.length) {
          insertedStyleRules.push(style);
        }
      });
      return insertedStyleRules;
    },
    init: function (context) {
      this.overRideInsertRule(context);  // For now, we are not supporting delete Rule
                                         // this.overRideDeleteRule(context);
    }
  };
  return obj;
}(core, NativeConstants, vwoUtils_vwo_utils, vwoUtils_utils);
html = function (nls, nlsjq, NativeConstants, nlsUtils, insertRule) {
  function setAttributes(node, attrs, attrNameModifier) {
    var attrName;
    attrNameModifier = attrNameModifier || function () {
      return arguments[0];
    };
    nlsjq.each(attrs, function (i, attr) {
      attrName = attrNameModifier(attr.name);
      try {
        // setAttribute throws error when attrName is '"' which is possible in following case
        // <img src="test"" />
        // Ideal way to fix it should be by checking if setAttribute is a quote or not.
        // But to be on safe side and to avoid errors in edge cases try catch is being used
        node.setAttribute(attrName, attr.value);
      } catch (e) {
      }
    });
  }
  function getAttributeName(attrName) {
    switch (attrName) {
    case 'src':
      attrName = '__nls-src';
      break;
    case 'srcset':
      attrName = '__nls-srcset';
      break;
    }
    return attrName;
  }
  function cloneNode(node) {
    if (!node) {
      return node;
    }
    var nodeName = node.nodeName && node.nodeName.toLowerCase();
    // Do not clone video tag. Instead use a dummy video tag as cloned video elements audio still runs even if its not attached TO DOM
    if (nodeName === 'video') {
      // Do not clone video node. Cloning creates a separate video on page which keeps on playing if its set to auto.
      var video = document.createElement('__nls-video');
      setAttributes(video, node.attributes);
      return video;
    } else if (nodeName !== 'img') {
      return node.cloneNode(false);
    } else {
      var img = document.createElement('img');
      setAttributes(img, node.attributes, getAttributeName);
      return img;
    }
  }
  /**
  * Deep clones a node without sending image requests for cloned node.
  * Due to a bug when cloning image node the request is sent again.
  * It can cause issues where image requests change something in session e.g. captcha img requests
  */
  function deepCloneNode(node, parentNode) {
    var parentEl;
    if (!node) {
      return node;
    }
    parentEl = cloneNode(node);
    // Sometimes custom element nodes cloneNode(false) (elements registered with document.registerElement) is cloning the
    // node with all the children, if it is the case,  do not clone children again
    if (!parentEl || !parentEl.childNodes.length) {
      node = node.firstChild;
      while (node) {
        if (node.childNodes && node.childNodes.length) {
          deepCloneNode(node, parentEl);
        } else {
          parentEl.appendChild(cloneNode(node));
        }
        node = node.nextSibling;
      }
    }
    if (parentNode) {
      parentNode.appendChild(parentEl);
    }
    return parentEl;
  }
  function GetHtml() {
    this.doctype = {};
    this.htmlEl = {};
    this.headEl = {};
    this.bodyEl = {};
    var NativeArray = NativeConstants.get('Array');
    this.html = {
      // Version >=1 doesn't add base tags on page
      version: 2,
      // Used to denote whether new session created after existing session times out on same page.
      idleToAction: nls.saveNewRecordingInitiatedOnce,
      beforeDoctype: new NativeArray(),
      insertedRules: new NativeArray(),
      doctype: {
        present: false,
        name: '',
        publicId: '',
        systemId: ''
      },
      beforeHtml: new NativeArray(),
      html: {
        present: false,
        attributes: {}
      },
      beforeHead: new NativeArray(),
      head: {
        present: false,
        attributes: {},
        html: ''
      },
      beforeBody: new NativeArray(),
      body: {
        present: false,
        attributes: {},
        html: ''
      },
      afterBody: new NativeArray(),
      afterHtml: new NativeArray()
    };
  }
  GetHtml.prototype.serializeNode = function (node, type, shouldAnonymizeContent, whiteListedElementFound) {
    var NativeArray = NativeConstants.get('Array'), Node = NativeConstants.get('Node');
    if (node === null) {
      return null;
    }
    var data = { nodeType: node.nodeType };
    switch (data.nodeType) {
    case Node.COMMENT_NODE:
    case Node.TEXT_NODE:
      data.textContent = node.textContent;
      // Avoid replacing spaces with *
      if (shouldAnonymizeContent && data.textContent && data.textContent.trim()) {
        // Convert all characters to * including whitespace (previously we don't change  whitespaces to *, but now
        //  are doing since December 2017
        data.textContent = nlsUtils.getMaskedValue(data.textContent);
      }
      break;
    case Node.ELEMENT_NODE:
      var elm = node;
      if (nlsUtils.isElementWhitelisted(node)) {
        shouldAnonymizeContent = false;
        whiteListedElementFound = true;
      } else if (!whiteListedElementFound && nlsUtils.isElementBlacklisted(node, nls.Recording.anonymizeKeys)) {
        shouldAnonymizeContent = true;
      }
      data.tagName = elm.tagName;
      data.attributes = {};
      for (var i = 0; i < elm.attributes.length; i++) {
        var attr = elm.attributes[i];
        data.attributes[attr.name] = attr.value;
      }
      if (elm.childNodes.length) {
        data.childNodes = new NativeArray();
        for (var child = elm.firstChild; child; child = child.nextSibling) {
          data.childNodes.push(this.serializeNode(child, type, shouldAnonymizeContent, whiteListedElementFound));
        }
      }
      break;
    }
    return data;
  };
  GetHtml.prototype.handleBaseElement = function () {
    var foundBase = false, baseElements = document.getElementsByTagName('base'), base;
    // Loop through each base element
    for (var i = 0; i < baseElements.length; i++) {
      base = baseElements[i];
      if (base.hasAttribute('href')) {
        foundBase = true;
        var href = base.getAttribute('href');
        // If href is set, Make it absolute. If href is null, that base tag is ignored by browser so its ignored by us too.
        // base.href always return absolute URL
        // We want to convert hrefs like /products to http://example.com/products
        if (href !== undefined && href !== null) {
          this.html.base = 1;
        }
      }
    }
  };
  GetHtml.prototype.handleTextNodes = function (node) {
    var comment, Node = NativeConstants.get('Node');
    if (node.nodeType === Node.TEXT_NODE && node.textContent === '') {
      comment = document.createComment('!!-nlsTN-!!');
      node.parentNode.replaceChild(comment, node);
      node = comment;
    } else if (node.nodeType === Node.TEXT_NODE && node.previousSibling && node.previousSibling.nodeType === Node.TEXT_NODE) {
      comment = document.createComment('!!-nlsCN-!!');
      node.parentNode.insertBefore(comment, node);
    }
    for (var child = node.firstChild; child; child = child.nextSibling) {
      this.handleTextNodes(child);
    }
    return node;
  };
  GetHtml.prototype.processDoctype = function () {
    this.html.doctype.present = true;
    // Loop backwards from doctype node to get beforeDoctype
    for (var node = this.doctype.previousSibling; node; node = node.previousSibling) {
      this.html.beforeDoctype.push(this.serializeNode(node, 'beforeDoctype'));
    }
    // Reverse it
    this.html.beforeDoctype.reverse();
    this.html.doctype.name = this.doctype.name;
    this.html.doctype.publicId = this.doctype.publicId;
    this.html.doctype.systemId = this.doctype.systemId;
  };
  GetHtml.prototype.processHtml = function () {
    this.html.html.present = true;
    // Loop backwards from the html node to get beforeHtml
    for (var node = this.htmlEl.previousSibling; node; node = node.previousSibling) {
      // If the doctype isn't null, end at the doctype node
      if (this.doctype && node === this.doctype) {
        break;
      }
      this.html.beforeHtml.push(this.serializeNode(node, 'beforeHtml'));
    }
    // Reverse it
    this.html.beforeHtml.reverse();
    for (var i = 0; i < this.htmlEl.attributes.length; i++) {
      var attr = this.htmlEl.attributes[i];
      this.html.html.attributes[attr.name] = attr.value;
    }
    // Loop forwards from the html node to get afterHtml
    for (node = this.htmlEl.nextSibling; node; node = node.nextSibling) {
      this.html.afterHtml.push(this.serializeNode(node, 'afterHtml'));
    }
    // Reverse it
    this.html.afterHtml.reverse();
  };
  GetHtml.prototype.processBaseElement = function () {
    // Handle the base element
    this.handleBaseElement();
  };
  GetHtml.prototype.processHead = function () {
    this.html.head.present = true;
    // Process the baseElement
    this.processBaseElement();
    // Loop backwards from the head node to get beforeHtml
    for (var node = this.headEl.previousSibling; node; node = node.previousSibling) {
      // If the html node isn't null, end at it
      if (this.htmlEl && node === this.htmlEl) {
        break;
      } else if (this.doctype && node === this.doctype) {
        break;
      }
      this.html.beforeHead.push(this.serializeNode(node, 'beforeHead'));
    }
    // Reverse it
    this.html.beforeHead.reverse();
    for (var i = 0; i < this.headEl.attributes.length; i++) {
      var attr = this.headEl.attributes[i];
      this.html.head.attributes[attr.name] = attr.value;
    }
    // Clone the head element
    var clone = this.headEl.cloneNode(true);
    // Handle adjacent and blank text nodes
    for (var child = clone.firstChild; child; child = child.nextSibling) {
      child = this.handleTextNodes(child);
    }
    //this.html.head.html = clone.innerHTML;
    this.html.head.nodes = this.serializeNode(clone);
  };
  GetHtml.prototype.processBody = function () {
    this.html.body.present = true;
    // Loop backwards from the body node to get beforeBody
    for (var node = this.bodyEl.previousSibling; node; node = node.previousSibling) {
      // If the head node isn't null, end at it
      if (this.headEl && node === this.headEl) {
        break;
      } else if (this.htmlEl && node === this.htmlEl) {
        break;
      } else if (this.doctype && node === this.doctype) {
        break;
      }
      this.html.beforeBody.push(this.serializeNode(node, 'beforeBody'));
    }
    // Reverse it
    this.html.beforeBody.reverse();
    for (var i = 0; i < this.bodyEl.attributes.length; i++) {
      var attr = this.bodyEl.attributes[i];
      this.html.body.attributes[attr.name] = attr.value;
    }
    // Clone the body element
    var clone = deepCloneNode(this.bodyEl);
    // Handle adjacent and blank text nodes
    for (var child = clone.firstChild; child; child = child.nextSibling) {
      child = this.handleTextNodes(child);
    }
    // Check if any input (text, date, number etc) elements require anonymization
    nlsjq('input,option', clone).each(function (index, el) {
      // jQuery .val() method on a cloned form element doesn't update its value attribute
      // following is the workaround for the same
      // Set the attributes only if they exist on element otherwise empty attributes will be set.
      if (nlsjq(el, clone).attr('value')) {
        nlsjq(el, clone).attr('value', nlsUtils.handleProtected(el, nls.Recording.anonymizeKeys));
      }
      // options of select box has 'label' attribute which needs to be anonymized too.
      if (nlsjq(el, clone).attr('label')) {
        nlsjq(el, clone).attr('label', nlsUtils.handleProtected(el, nls.Recording.anonymizeKeys, 'label'));
      }
    });
    // Instead of send inner HTML, send DOM Tree so that player can regenerate exact replica of that tree
    // avoiding the browser's auto cleanup of markup(e.g. nested forms)
    //this.html.body.html = clone.innerHTML;
    this.html.body.nodes = this.serializeNode(clone);
    // Loop forwards from the body node to get afterBody
    for (node = this.bodyEl.nextSibling; node; node = node.nextSibling) {
      this.html.afterBody.push(this.serializeNode(node, 'afterBody'));
    }
    // Reverse it
    this.html.afterBody.reverse();
  };
  GetHtml.prototype.init = function (isNewPageView) {
    if (isNewPageView) {
      GetHtml.bind(this)();
    }
    // Set the elements
    this.doctype = document.doctype;
    this.htmlEl = document.getElementsByTagName('html')[0];
    this.headEl = document.getElementsByTagName('head')[0];
    this.bodyEl = document.getElementsByTagName('body')[0];
    // Set the doctype
    if (this.doctype) {
      this.processDoctype();
    }
    // Set the HTML tag attributes
    if (this.htmlEl) {
      this.processHtml();
    }
    insertRule.processInsertRules.call(this);
    // Set the HEAD tag attributes and html code
    if (this.headEl) {
      this.processHead();
    }
    // No base found. So, base element would have to be added during recording playback
    if (!this.html.base) {
      if (!this.html.head.present) {
        // If head is not present, recording player will add head with only child as base tag, so offset in this case would be 2
        nls.baseAdjustment = {
          offset: 2,
          // afterEl  is the element just after base tag if base tag would have been inserted
          // FIXME: Assumption is that body tag is present.
          afterEl: this.bodyEl
        };
      } else {
        // If head tag is present, recording player will just add base tag, so offset will be 1 in this case
        nls.baseAdjustment = {
          offset: 1,
          afterEl: this.headEl.childNodes[0]
        };
      }
    } else {
      nls.baseAdjustment = { offset: 0 };
    }
    // Set the BODY tag attributes and html code
    if (this.bodyEl) {
      this.processBody();
    }
  };
  return nls.GetHtml = new GetHtml();
}(core, gQuery, NativeConstants, nls_utils, insertRule);
init_init = function (vwoLib, nls, ajax, nlsjq, nlsjs, cookies, nlsUtils, utils, EventsEnum, ajaxnls) {
  // By default, disable NATIVE Constants. If someone wants to enable it, he can set this flag to false.
  // See https://confluence.wingify.com/display/VWOENG/JSLib+Developers+-+Things+to+Keep+in+Mind for more details
  if (typeof window.DISABLE_NATIVE_CONSTANTS === 'undefined') {
    window.DISABLE_NATIVE_CONSTANTS = true;
  }
  /* jshint camelcase:false */
  var vwoExp = window._vwo_exp || {}, vwoExpIds = window._vwo_exp_ids || [], _initialize, isFirstSession = true, ANALYZE_HEATMAP_CAMPAIGN = 'ANALYZE_HEATMAP', ANALYZE_RECORDING_CAMPAIGN = 'ANALYZE_RECORDING', ANALYZE_FORM_ANALYSIS_CAMPAIGN = 'ANALYZE_FORM', experimentKeysName = {}, firstInitialized = false, analyzeSessionCreated = false, isInitialized = false, isReadyToInitializeRecordings = false, VWO = window.VWO, MAX_NUMBER_OF_PAGES_IN_A_SESSION = VWO.data && VWO.data.mrp || 20;
  //mrp - dacdn sends the max. number of pages
  /**
  * VWO._.triggerEvent is mangled with different names, so checking specific word string to identify function.
  * TODO Permanent Fix - remove mangling of function names from core.
  */
  var findMangledTriggerFunction = function () {
    for (var i in VWO._) {
      if (VWO._.hasOwnProperty(i) && typeof VWO._[i] === 'function') {
        var stringedFunc = VWO._[i].toString();
        if (stringedFunc.indexOf('unshift(["jI"]') >= 0) {
          return VWO._[i];
        }
      }
    }
  };
  var triggerEvent = VWO._.triggerEvent || findMangledTriggerFunction() || function () {
  };
  experimentKeysName[ANALYZE_FORM_ANALYSIS_CAMPAIGN] = 'fe';
  experimentKeysName[ANALYZE_HEATMAP_CAMPAIGN] = 'he';
  experimentKeysName[ANALYZE_RECORDING_CAMPAIGN] = 're';
  /* jshint camelcase:true */
  var checkIfRecordingEnabled = function (campaignId) {
    /*jshint camelcase: false */
    window._vwo_pa = window._vwo_pa || {};
    /*jshint laxbreak:true */
    if (window._vwo_pa && window._vwo_pa[campaignId]  // check if Recording or Form Analysis enabled
&& (window._vwo_pa[campaignId].r === 1 || window._vwo_pa[campaignId].fae === 1  // check if Heatmap or Scrollmap enabled
|| window._vwo_pa[campaignId].hs === 1)) {
      /*jshint laxbreak:false */
      return true;
    }
    /*jshint camelcase: true */
    return false;
  };
  var isAnalyzeCampaign = function (campaignId) {
      if (!vwoExp[campaignId]) {
        return;
      }
      var type = vwoExp[campaignId].type;
      if ([
          ANALYZE_HEATMAP_CAMPAIGN,
          ANALYZE_RECORDING_CAMPAIGN
        ].indexOf(type) >= 0) {
        if (vwoExp[campaignId].main) {
          nls.hs = nls.hs || type === ANALYZE_HEATMAP_CAMPAIGN;
          nls.r = nls.r || type === ANALYZE_RECORDING_CAMPAIGN;
        }
        return true;
      } else if (type === ANALYZE_FORM_ANALYSIS_CAMPAIGN) {
        // No main campaign exist for form analysis
        nls.fae = true;
        return true;
      }
      return false;
    }, isAnalyzeEnabled = function () {
      var expLength = vwoExpIds.length, type;
      while (expLength--) {
        type = vwoExp[vwoExpIds[expLength]].type;
        if ([
            ANALYZE_HEATMAP_CAMPAIGN,
            ANALYZE_RECORDING_CAMPAIGN,
            ANALYZE_FORM_ANALYSIS_CAMPAIGN
          ].indexOf(type) >= 0) {
          return true;
        }
      }
      return false;
    };
  var stopRecording = function () {
    nls.stopRecording = nls.enums.formAnalysis.PERMANENT_STATE;
  };
  var updateSession = function (sessionId, pageId, returningVisitor, isNewSession, researchPageId) {
    var storedSessionId = cookies.get('nlssid' + nls.ids.account);
    if (!isAnalyzeEnabled() && storedSessionId) {
      nls.ids.session = storedSessionId;
      nls.ids.recording = parseInt(cookies.get('nlsrid' + nls.ids.account) || 1, 10);
      nls.returnVisitor = true;
    } else {
      // pageId supported for previous lib versions
      var pagesInCurrentSession = researchPageId || pageId;
      // Stop the recording after maximum number of page views in a session
      if (pagesInCurrentSession > MAX_NUMBER_OF_PAGES_IN_A_SESSION) {
        stopRecording();
        return;
      }
      // Reset the key after new session will be created
      if (isNewSession) {
        nls.stopRecording = false;
      }
      nls.ids.session = sessionId;
      nls.ids.recording = pagesInCurrentSession;
      nls.returnVisitor = returningVisitor;
      nls.newSession = !!isNewSession;
      analyzeSessionCreated = true;
      if (!isInitialized) {
        _initialize();
      }
      if (isFirstSession && storedSessionId) {
        cookies.erase('nlssid' + nls.ids.account, nls.getCookieDomain());
        cookies.erase('nlsrid' + nls.ids.account, nls.getCookieDomain());
      }
      isFirstSession = false;
      // If new session is created on same page ( after idle timeout ), send new recordings ( in analyze call ) containing page html again.
      if (returningVisitor && nls.saveNewRecordingInitiatedOnce) {
        ajaxnls.saveNewRecording();
      }
    }
  };
  var resetVariables = function () {
    nls.ready = false;
    nls.r = false;
    nls.hs = false;
    nls.fae = false;
    nls.ids.experiment = {};
    analyzeSessionCreated = false;
    nls.saveNewRecordingInitiatedOnce = false;
    isInitialized = false;
    nls.htmlRequestSuccess = false;
    nls.Recording.resetData();
    nls.ids.re = {};
    nls.ids.he = {};
    nls.ids.fe = {};
  };
  var processEvents = function (eventArgs) {
    var evName = eventArgs[0], campaignId, variationId, isAnalyze, type;
    if (evName === 'rH' || evName === 'vS') {
      campaignId = eventArgs[1];
      variationId = +eventArgs[2] || 1;
      isAnalyze = isAnalyzeCampaign(campaignId);
      if (!nls.ids.experiment[campaignId] && (checkIfRecordingEnabled(campaignId) || isAnalyze)) {
        /* Input will be anonymized for all campaigns even if enabled for just a single campaign */
        if (isAnalyze) {
          type = vwoExp[campaignId].type;
          if (vwoExp[campaignId].main || type === ANALYZE_FORM_ANALYSIS_CAMPAIGN) {
            // Adding experiment Id in corresponding ids
            nls.ids[experimentKeysName[type]][campaignId] = nlsUtils.getUUID(campaignId);
            nls.ready = true;
            nls.analyze = true;
            if (type === ANALYZE_FORM_ANALYSIS_CAMPAIGN) {
              nls.tags.eTags.add(campaignId, variationId);
              nls.tags.eTagsV2.f.add(campaignId);
            } else if (type === ANALYZE_RECORDING_CAMPAIGN) {
              //for now vwoExp[campaignId].aK is always 1 from backend and we have set nls.Recording.anonymizeKeys to true initially but handle if aK set to 0(not supported for now)
              //nls.Recording.anonymizeKeys = nls.Recording.anonymizeKeys || vwoExp[campaignId].aK;
              nls.Recording.anonymizeKeys = typeof vwoExp[campaignId].aK !== 'undefined' ? vwoExp[campaignId].aK : nls.Recording.anonymizeKeys;
              nls.Recording.bl = vwoExp[campaignId].bl;
              nls.Recording.wl = vwoExp[campaignId].wl;
            }
            if (!isInitialized) {
              _initialize();
            }
          } else {
            nls.tags.eTags.add(campaignId, variationId);
            switch (type) {
            case ANALYZE_HEATMAP_CAMPAIGN:
              nls.tags.eTagsV2.h.add(campaignId);
              break;
            case ANALYZE_RECORDING_CAMPAIGN:
              nls.tags.eTagsV2.r.add(campaignId);
              break;
            }
          }
        } else {
          /*jshint camelcase:false*/
          // aK represents anonymize keys setting for the campaign
          nls.Recording.anonymizeKeys = nls.Recording.anonymizeKeys || window._vwo_pa[campaignId].aK;
          nls.fae = nls.fae || window._vwo_pa[campaignId].fae;
          nls.hs = nls.hs || window._vwo_pa[campaignId].hs;
          nls.r = nls.r || window._vwo_pa[campaignId].r;
          /*jshint camelcase:true*/
          nls.ids.experiment[campaignId] = nlsUtils.getUUID(campaignId);
          nls.ready = true;
          if (!isInitialized) {
            _initialize();
          }
        }
      }
    } else if (evName === 'tSC') {
      // TRACK_SESSION_CREATED
      /**
      * sessionId -> eventArgs[1]
      * trackPageId -> eventArgs[2] - when only track used to update pageId; eventArgs[5] - when both core and track updates
      * returningVisitor -> eventArgs[3]
      */
      updateSession(eventArgs[1], eventArgs[2], eventArgs[3], eventArgs[4], eventArgs[5]);
    } else if (evName === 'tSE') {
      // TRACK_SESSION_EXPIRED
      // Stop the recording when session expired
      stopRecording();
    } else if (evName === 'uC') {
      //send data collected on SPA for previous page, if any. QF-6826
      ajaxnls.sendRecordingData(false, nls.Recording && nls.Recording.currentUrl);
      resetVariables();
    }
  };
  var setEnabledExperiments = function (evq) {
    nlsjq.each(evq, function (index, eventArgs) {
      processEvents(eventArgs);
    });
  };
  var initCampaignCapture = function () {
    /*jshint camelcase: false */
    window._vwo_evq = window._vwo_evq || [];
    setEnabledExperiments(window._vwo_evq);
    var oldPush = window._vwo_evq.push, oldUnshift = window._vwo_evq.unshift;
    window._vwo_evq.push = function (eventArgs) {
      processEvents(eventArgs);
      oldPush.apply(window._vwo_evq, [].slice.call(arguments));
    };
    window._vwo_evq.unshift = function (eventArgs) {
      processEvents(eventArgs);
      oldUnshift.apply(window._vwo_evq, [].slice.call(arguments));
    };  /*jshint camelcase: true */
  };
  var isWorkerSupported = function () {
    return window.Worker && window.URL && window.Blob;
  };
  var canInitialize = function () {
    if (!nls.ready) {
      return false;
    }
    // Analyze session should be created before initializing analyze
    if (nls.analyze && !analyzeSessionCreated) {
      return false;
    }
    if (nls.faultyWorker) {
      return true;
    }
    if (isWorkerSupported()) {
      return !!nls.workerUrl;
    }
    return false;
  };
  var initialize = function (modules) {
    if (!isInitialized && canInitialize() && isReadyToInitializeRecordings) {
      isInitialized = true;
      // It ensures that recording will be initiated from this onwards.
      if (nls.ready && nls.r) {
        triggerEvent(EventsEnum.RECORDING_INITIATED);
      }
      nlsjs.init(modules, firstInitialized);
      firstInitialized = true;
    }
  };
  return function (modules) {
    _initialize = utils.debounce(function () {
      initialize(modules);
    }, 50);
    initCampaignCapture();
    // VWO is set on window in vwo-lib.js
    /* jshint camelcase:false */
    var workerCb = window._vwo_worker_cb, workerCacheBuster = workerCb ? '-' + workerCb : '';
    if (VWO.nls) {
      return;
    }
    VWO.nls = nls;
    var workerUrl = window._vwo_worker_url || 'https://dev.visualwebsiteoptimizer.com/analysis/worker' + workerCacheBuster + '.js';
    if (isWorkerSupported()) {
      nlsjq.ajax({
        url: workerUrl,
        dataType: 'text',
        success: function (data) {
          try {
            var blob = new window.Blob([data], { type: 'text/javascript' });
            nls.workerUrl = window.URL.createObjectURL(blob);
          } catch (e) {
            nls.faultyWorker = true;
          }
          initialize(modules);
        }
      });
    }
    /* jshint camelcase:true */
    nlsjq(document).ready(function () {
      setTimeout(function () {
        // We need to wait for additonal half a second for recordings to initialize.
        // Its required because otherwise page height/width calculations get skewed.
        isReadyToInitializeRecordings = true;
        initialize(modules);
        // Initialize the VWO api to process events
        vwoLib.init('nls');
      }, 500);
    });
    /* jshint camelcase:false */
    window._vwo_evq = window._vwo_evq || [];
    /* jshint camelcase:true */
    nls.ajax = ajax;
    return window.__nls = nls;
  };
}(vwo_lib, core, ajax, gQuery, nls, cookies, nls_utils, vwoUtils_utils, constants_EventsEnum, ajax_nls);
customEvent = {
  /**
   * @param node  Define the node on which u want to attach event
   * @param eventName Define the event name
   */
  createEvent: function (node, eventName) {
    var event = node.createEvent('Event');
    event.initEvent(eventName, false, false);
    return event;
  },
  /**
   *
   * @param node   Define the node on which u want to dispatch event
   * @param eventName Define the event name
   */
  dispatchEvent: function (node, eventName) {
    node.dispatchEvent(eventName);
  }
};
mutations = function (nls, NativeConstants, nlsUtils, utils, customEvent, insertRule) {
  // Class for mapping all page nodes
  function NodeMap() {
    var NativeArray = NativeConstants.get('Array');
    this.nextId = 1;
    this.nodes = new NativeArray();
    this.ID_PROP = 'nlsNodeId';
  }
  function mutationObserverCallback(mutations) {
    /*jshint validthis: true */
    this.observerCallback(mutations);
  }
  NodeMap.prototype.add = function (node, recursive) {
    var offset = 0;
    if (nls.baseAdjustment.afterEl === node) {
      offset = nls.baseAdjustment.offset;
    }
    this.nextId = this.nextId + offset;
    // Set ID for this node
    node[this.ID_PROP] = this.nextId;
    this.nodes[this.nextId] = node;
    this.nextId++;
    if (recursive && node.childNodes.length) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        this.add(child, true);
      }
    }
    return node[this.ID_PROP];
  };
  /*jshint -W024*/
  NodeMap.prototype.delete = function (node) {
    var id = this.getId(node);
    delete this.nodes[id];
    delete node[this.ID_PROP];
  };
  NodeMap.prototype.getId = function (node) {
    return node[this.ID_PROP];
  };
  NodeMap.prototype.getNode = function (id) {
    return this.nodes[id];
  };
  // Class for tracking mutations
  function Mutations(target) {
    var NativeArray = NativeConstants.get('Array');
    this.target = target || document;
    this.mutations = new NativeArray();
    this.index = 0;
    this.stagger = true;
    this.knownNodes = new NodeMap();
  }
  Mutations.prototype.observerCallback = function (mutations) {
    // Process each mutation and add it to the mutation array
    var NativeArray = NativeConstants.get('Array');
    var processedMutations = new NativeArray();
    mutations.forEach(function (mutation) {
      if (mutation = this.processMutation(mutation)) {
        processedMutations.push(mutation);
      }
    }, this);
    // If there are mutations to track
    if (processedMutations.length) {
      this.addMutation({
        time: utils.getCurrentTimestamp() - nls.startTime,
        mutations: processedMutations
      });
    }
  };
  Mutations.prototype.processMutation = function (mutation) {
    switch (mutation.type) {
    case 'childList':
      return this.processChildList(mutation);
    case 'attributes':
      return this.processAttributes(mutation);
    case 'characterData':
      return this.processCharacterData(mutation);
    }
  };
  Mutations.prototype.processChildList = function (mutation) {
    var NativeArray = NativeConstants.get('Array');
    var addedNodes = new NativeArray(), removedNodes = new NativeArray(), i;
    // Handle addedNodes
    for (i = 0; i < mutation.addedNodes.length; i++) {
      addedNodes = this.processAddedNode(mutation.addedNodes[i], addedNodes);
    }
    // Handle removedNodes
    for (i = 0; i < mutation.removedNodes.length; i++) {
      var node = mutation.removedNodes[i];
      // If this node doesn't exist and has been tracked
      // node.parentElement check - If node is a fragmented one, it's parentElement is null but parentNode is #document-fragment.
      // node.parentNode check - If 'B' is child of 'A', and 'A' and 'B' node comes in mutation.removedNodes, so push in removed nodes only if its parent node doesn't exist
      // since if 'A' is also in mutation.removed nodes then it would have been handled separately and it will remove 'B' automatically.
      // there might be case when 'A' node is appended to 'B' node and 'B' is not part of DOM, then below check will fail TODO - JSLIB-289
      if ((!node.parentNode || !node.parentElement) && this.knownNodes.getId(node)) {
        removedNodes.push(this.serializeNode(node));
        this.knownNodes.delete(node);
      }
    }
    if (addedNodes.length || removedNodes.length) {
      return {
        type: 'childList',
        addedNodes: addedNodes,
        removedNodes: removedNodes
      };
    }
    return null;
  };
  Mutations.prototype.processAddedNode = function (node, addedNodes) {
    var Node = NativeConstants.get('Node'), NativeArray = NativeConstants.get('Array');
    addedNodes = addedNodes || new NativeArray();
    //vwo_element_added event is generic and it can be fired when adding any type of element, but
    // its current use is for input and select elements only. So, we are firing it in that case only. Later it can be fired generically if required.
    if (node.tagName && (node.tagName.toLowerCase() === 'input' || node.tagName.toLowerCase() === 'select')) {
      var custEv = customEvent.createEvent(document, 'vwo_element_added');
      custEv.data = node;
      customEvent.dispatchEvent(document, custEv);
    }
    //If this node exists and isn't in a document fragment
    if (node.parentNode && node.parentNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      var data = this.serializeNode(node);
      data.previousSibling = this.serializeNode(node.previousSibling);
      data.parentNode = this.serializeNode(node.parentNode);
      // Add node data to addedNodes
      addedNodes.push(data);
      // Add all of its child nodes to support innerHTML changes
      for (var child = node.firstChild; child; child = child.nextSibling) {
        addedNodes = this.processAddedNode(child, addedNodes);
      }
    }
    return addedNodes;
  };
  Mutations.prototype.processAttributes = function (mutation) {
    var node = mutation.target, attrName = mutation.attributeName;
    // If this node doesn't exist or its parent hasn't been tracked
    if (!node.parentNode || !this.knownNodes.getId(node.parentNode)) {
      return null;
    }
    var data = this.serializeNode(node);
    data.type = 'attributes';
    data.name = attrName;
    // If it is a value attribute of an input or 'label' attribute of options in select box, sensitive information should be hidden
    if (attrName === 'value' || attrName === 'label') {
      data.value = nlsUtils.handleProtected(node, nls.Recording.anonymizeKeys, attrName);
    } else {
      data.value = node.getAttribute(attrName);
    }
    return data;
  };
  Mutations.prototype.processCharacterData = function (mutation) {
    var node = mutation.target;
    // If this node doesn't exist or its parent hasn't been tracked
    if (!node.parentNode || !this.knownNodes.getId(node.parentNode)) {
      return null;
    }
    var data = this.serializeNode(node);
    data.type = 'characterData';
    // getNodeProperty will return the value after security check (like anonymizing sensitive information)
    data.textContent = nlsUtils.getNodeProperty(node, node.textContent, nls.Recording.anonymizeKeys);
    return data;
  };
  Mutations.prototype.serializeNode = function (node) {
    var Node = NativeConstants.get('Node'), NativeArray = NativeConstants.get('Array');
    if (node === null) {
      return null;
    }
    // Try to pull nls node id
    var id = this.knownNodes.getId(node);
    if (id) {
      return { id: id };
    }
    var data = {
      nodeType: node.nodeType,
      id: this.knownNodes.add(node)
    };
    switch (data.nodeType) {
    case Node.DOCUMENT_TYPE_NODE:
      data.name = node.name;
      data.publicId = node.publicId;
      data.systemId = node.systemId;
      break;
    case Node.COMMENT_NODE:
    case Node.TEXT_NODE:
      // getNodeProperty will return the value after security check (like anonymizing sensitive information)
      data.textContent = nlsUtils.getNodeProperty(node, node.textContent, nls.Recording.anonymizeKeys);
      break;
    case Node.ELEMENT_NODE:
      data.tagName = node.tagName;
      data.attributes = new NativeArray();
      for (var i = 0; i < node.attributes.length; i++) {
        var attr = node.attributes[i];
        data.attributes.push({
          name: attr.name,
          // If it is a value attribute of an input or 'label' attribute of options in select box, sensitive information should be hidden
          value: attr.name === 'value' || attr.name === 'label' ? nlsUtils.handleProtected(node, nls.Recording.anonymizeKeys, attr.name) : attr.value
        });
      }
      break;
    }
    return data;
  };
  Mutations.prototype.addMutation = function (data) {
    this.mutations.push(data);
  };
  Mutations.prototype.init = function (isNewPageView) {
    if (isNewPageView) {
      Mutations.bind(this)();
    }
    // Add the target to the node map
    this.knownNodes.add(this.target);
    // Map all child nodes
    for (var child = this.target.firstChild; child; child = child.nextSibling) {
      this.knownNodes.add(child, true);
    }
    var MutationObserverCtor;
    if (typeof MutationObserver !== 'undefined') {
      MutationObserverCtor = MutationObserver;
    } else if (typeof WebKitMutationObserver !== 'undefined') {
      MutationObserverCtor = window.WebKitMutationObserver;
    }
    if (!MutationObserverCtor) {
      return;
    }
    /**
     * If this.observer is present, it somehow had previously attached observerCallback due to which mutations not generated properly.
     * Fix - If this.observer:
     * 1. disconnect it
     * 2. connect it, so now fresh observerCallback is called
          **/
    if (this.observer) {
      this.observer.disconnect();
    } else {
      // Create new MutationObserver
      this.observer = new MutationObserverCtor(mutationObserverCallback.bind(this));
    }
    // Set configuration
    var config = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    };
    // Start observing
    this.observer.observe(this.target, config);
    var that = this;
    window.addEventListener('unload', function () {
      that.observer.disconnect();
    });
    insertRule.init(this);
  };
  return nls.Mutations = new Mutations(document);
}(core, NativeConstants, nls_utils, vwoUtils_utils, customEvent, insertRule);
utils = function () {
  var utils = {
    getTrueWidth: function (el) {
      var jQuery = window.vwo_$ || window.jQuery;
      return jQuery && jQuery(el).width() || el.clientWidth || el.offsetWidth || el.scrollWidth;
    },
    getTrueHeight: function (el) {
      var jQuery = window.vwo_$ || window.jQuery;
      return jQuery && jQuery(el).height() || el.clientHeight || el.offsetHeight || el.scrollHeight;
    },
    getRelativeStats: function (oldTarget, correctedTarget, oldTargetOffsetX, oldTargetOffsetY, oldTargetPageX, oldTargetPageY) {
      var offsetYOfTargetRelativeToCorrectedTarget = oldTarget.offset().top - correctedTarget.offset().top;
      var offsetXOfTargetRelativeToCorrectedTarget = oldTarget.offset().left - correctedTarget.offset().left;
      var correctedTargetHeight = this.getTrueHeight(correctedTarget[0]);
      var correctedTargetWidth = this.getTrueWidth(correctedTarget[0]);
      var correctedTargetOffsetX = oldTargetOffsetX + offsetXOfTargetRelativeToCorrectedTarget;
      var correctedTargetOffsetY = oldTargetOffsetY + offsetYOfTargetRelativeToCorrectedTarget;
      var correctedTargetPageX = 0, correctedTargetPageY = 0;
      if (oldTargetPageX && oldTargetPageY) {
        correctedTargetPageX = oldTargetPageX - offsetXOfTargetRelativeToCorrectedTarget;
        correctedTargetPageY = oldTargetPageY - offsetYOfTargetRelativeToCorrectedTarget;
      }
      return {
        correctedTargetHeight: correctedTargetHeight,
        correctedTargetWidth: correctedTargetWidth,
        correctedTargetOffsetX: correctedTargetOffsetX,
        correctedTargetOffsetY: correctedTargetOffsetY,
        correctedTargetPageX: correctedTargetPageX,
        correctedTargetPageY: correctedTargetPageY
      };
    }
  };
  return utils;
}();
recording = function (nls, nlsjq, ajaxnls, mutations, NativeConstants, nlsUtils, Tag, vwoUtils, utils, eventsManager, sharedUtils) {
  var $offsetEl, listenerAdded;
  // TODO: Move this to vwo-utils, as jslib is using the same
  function onUrlChange(callback) {
    if (window.history) {
      //Override pushState function to detect push state
      (function (history) {
        var pushState = history.pushState || function () {
        };
        eventsManager.addOverrideState(history, 'pushState');
        history.pushState = function (state) {
          var retVal = pushState.apply(history, [].slice.call(arguments));
          callback({ state: state });
          return retVal;
        };
      }(window.history));
      // popstate event is for detecting history -> popState and replaceState event. It works for onhashchange as well
      if (window.addEventListener) {
        // W3C DOM
        eventsManager.addEventListener(window, 'popstate', callback, false);
      } else if (window.attachEvent) {
        // IE DOM
        window.attachEvent('onpopstate', callback);
      }
    }
  }
  function orientationChangeTimeout() {
    nls.recordingData.totals.ocs++;
    var screenDimensions = nls.getScreenDimensions();
    //alert(JSON.stringify({innerWidth: window.innerWidth, innerHeight: window.innerHeight, height: screen.height, width: screen.width}))
    /*jshint validthis: true */
    this.recording.push('oc_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + screenDimensions.width + '_' + screenDimensions.height);
  }
  function onOrientationChange(self) {
    // On iOS chrome, after orientation change it doesn't change the dimensions instantly. So, do it in next cycle.
    var _orientationChangeTimeout = setTimeout(orientationChangeTimeout.bind(self), 10);
    eventsManager.pushTimers(_orientationChangeTimeout, 'timeout');
  }
  function Recording() {
    // Recording status
    var NativeArray = NativeConstants.get('Array');
    this.heatmap = {
      eventsLength: 0,
      /*jshint camelcase:false*/
      maxClicksRecorded: window._vwo_clicks || 3,
      clicks: new NativeArray()  /*jshint camelcase:true*/
    };
    this.recording = new NativeArray();
    this.clicks = new NativeArray();
    this.index = {
      recording: 0,
      clicks: 0,
      heatmap: 0
    };
    this.intervals = new NativeArray();
    nls.startTime = utils.getCurrentTimestamp();
    this.anonymizeKeys = true;
    this.clickDelay = {
      page: 0,
      link: 380
    };
    this.tags = new Tag('Array');
    this.totals = {
      movements: 0,
      clicks: 0,
      keyPresses: 0,
      scroll: 0
    };
    this.window = {
      width: 0,
      height: 0
    };
    this.mouse = {
      curMove: {
        el: {},
        width: 0,
        height: 0,
        relX: 0,
        relY: 0,
        docX: 0,
        docY: 0
      },
      lastMove: {
        docX: 0,
        docY: 0
      },
      curDown: {
        tag: '',
        index: 0
      }
    };
    this.isMobile = nls.isMobile();
    this.devicePixelRatio = 0;
  }
  Recording.prototype.addInitialHTML = function (data) {
    var JSON = NativeConstants.get('JSON');
    if (nls.r) {
      var html = nls.GetHtml.html;
      // set idleToAction flag to denote new session created after existing session timeout on same page,
      // identified by saveNewRecordingInitiatedOnce.
      html.idleToAction = nls.saveNewRecordingInitiatedOnce;
      data.html = JSON.stringify(html);
    }
  };
  Recording.prototype.getRelativeCoord = function (coord) {
    if (this.isMobile) {
      var offset, elementLeftValue = -100;
      if (!$offsetEl) {
        $offsetEl = nlsjq('<span style="position:absolute;top:0;left:' + elementLeftValue + 'px"></span>').appendTo('body');
      }
      offset = $offsetEl.offset();
      // On zoom in mobile devices, offset changes for all element. We are adding same offset value so get it nullyfy.
      coord.pageY += offset.top;
      // Absoluted element is already have some offset value, substracting it (elementLeftValue) to get actual offset value
      coord.pageX += offset.left - elementLeftValue;
    }
    return {
      x: coord.pageX - coord.offsetX,
      y: coord.pageY - coord.offsetY
    };
  };
  Recording.prototype.sendElementScrollData = function (e) {
    var el = e.target;
    this.recording.push('es_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + nlsjq(el).scrollLeft() + '_' + nlsjq(el).scrollTop());
  };
  Recording.prototype.loadEventListeners = function () {
    var self = this;
    eventsManager.addJqEventListener(nlsjq(window), 'on', 'orientationchange', onOrientationChange.bind(this, self));
    // Handle mouse leaving the document
    eventsManager.addJqEventListener(nlsjq(document), 'on', 'mouseleave', ajaxnls.sendRecordingData.bind(ajaxnls));
    // Handle touch
    var multiTouchHandler = function () {
        var scale = nls.getScale();
        self.recording.push('tc_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + scale.x + '_' + scale.y + '_' + nlsjq(window).scrollLeft() + '_' + nlsjq(window).scrollTop());
      }, onTouchStart = function (e) {
        if (e.touches.length === 2) {
          multiTouchHandler();
        }
      }, onTouchMove = function (e) {
        if (e.touches.length === 2) {
          multiTouchHandler();
        }
        var targetEl = e.target;
        if (!targetEl) {
          return;
        }
        // mark that element was moved.
        targetEl.vwoVbaTm = 1;
        // In case even after 1 second touchend is not triggered, due to some wierd code
        // Now if user touches the element with the intention of click, click won't be processed
        // because vwoVbaTm would be set to 1
        // So, to handle such cases, set vwoVbaTm flag to false after 1 second automatically
        var touchMoveTimeout = setTimeout(function () {
          targetEl.vwoVbaTm = 0;
        }, 1000);
        eventsManager.pushTimers(touchMoveTimeout, 'timeout');
      }, processClick = function (e) {
        /* jshint camelcase:false */
        var el = e.target, offset = nlsjq(el).offset(), isTouchEndEvent = e.type === 'touchend', pageX, pageY, jqEl = window.vwo_$(el), newEl = window.vwo_$(el);
        /* jshint camelcase:true */
        // jQuery is returning offset as undefined if target is document (QF-4720)
        if (!offset) {
          return;
        }
        this.mouse.curDown.tag = el.nodeName;
        this.mouse.curDown.index = nlsjq(el.nodeName).index(el);
        if (isTouchEndEvent) {
          var firstTouchEvent = e.changedTouches[0];
          if (firstTouchEvent) {
            pageX = firstTouchEvent.pageX;
            pageY = firstTouchEvent.pageY;
          }
        } else {
          pageX = e.pageX;
          pageY = e.pageY;
        }
        var Math = NativeConstants.get('Math');
        var relativeCoords = this.getRelativeCoord({
            pageX: pageX,
            offsetX: offset.left,
            pageY: pageY,
            offsetY: offset.top
          }), eventTimestamp = utils.getCurrentTimestamp() - nls.startTime, clickData = 'mc_' + eventTimestamp + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + sharedUtils.getTrueWidth(el) + '_' + sharedUtils.getTrueHeight(el) + '_' + Math.floor(relativeCoords.x) + '_' + Math.floor(relativeCoords.y) + '_' + this.mouse.curMove.docX + '_' + this.mouse.curMove.docY;
        //handles the case when element does not have height/width of its own but uses psuedo element for dimensions
        //use nearest visible parent in that case for plotting the x/y coordinates
        while (newEl.is(':hidden')) {
          newEl = newEl.parent();
        }
        if (newEl && newEl !== jqEl) {
          var relX = Math.floor(relativeCoords.x), relY = Math.floor(relativeCoords.y), docX = this.mouse.curMove.docX, docY = this.mouse.curMove.docY;
          var newStats = sharedUtils.getRelativeStats(jqEl, newEl, relX, relY, docX, docY);
          clickData = 'mc_' + eventTimestamp + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(newEl[0])) + '_' + newStats.correctedTargetWidth + '_' + newStats.correctedTargetHeight + '_' + Math.floor(newStats.correctedTargetOffsetX) + '_' + Math.floor(newStats.correctedTargetOffsetY) + '_' + newStats.correctedTargetPageX + '_' + newStats.correctedTargetPageY;
        }
        this.heatmap.clicks.push(clickData);
        this.recording.push(clickData);
      }, onMouseDown = function (e) {
        var targetEl = e.target;
        // If element was touched, the heatmap and goals have been processed already for it.
        if (targetEl.vwoVbaTe) {
          targetEl.vwoVbaTe = 0;
          return;
        }
        processClick.apply(this, [].slice.call(arguments));
      }, onTouchEnd = function (e) {
        // Set a timeout to account for any lag
        if (e.touches.length === 2) {
          var touchEndTimer = setTimeout(multiTouchHandler, 600);
          eventsManager.pushTimers(touchEndTimer, 'timeout');
        }
        var targetEl = e.target;
        if (!targetEl) {
          return;
        }
        // mark that element was touched.
        // This information will be used in mousedown handler to not record mousedown if its touch has already been recorded
        targetEl.vwoVbaTe = 1;
        // In case even after 1 second mousedown is not triggered, due to lets say fastclick
        // Now if user does mouse click instead of tap(possible in new touch enabled desktop devices), mousedown won't cause click processing
        // because vwoVbaTe would be set to 1
        // So, to handle such cases, set vwoVbaTe flag to false after 1 second automatically
        var touchEndTimerVbaTe = setTimeout(function () {
          targetEl.vwoVbaTe = 0;
        }, 1000);
        eventsManager.pushTimers(touchEndTimerVbaTe, 'timeout');
        // If touch move didn't occur for the element, but it was touched then it means there was no scroll and it was just tapped
        // Trigger heatmap and goal calls in this case.
        if (!targetEl.vwoVbaTm) {
          // Reset element touch move flag
          processClick.apply(this, [].slice.call(arguments).concat(0));
        }
        targetEl.vwoVbaTm = 0;
      };
    eventsManager.addEventListener(document, 'touchstart', onTouchStart.bind(this));
    eventsManager.addEventListener(document, 'touchmove', onTouchMove.bind(this));
    eventsManager.addEventListener(document, 'touchend', onTouchEnd.bind(this));
    var onWindowResize = function () {
      /*jshint validthis: true */
      if (this.devicePixelRatio === window.devicePixelRatio) {
        var scale = nls.getScale(), screenScale = nls.getScreenScale();
        // rs = resize with scale, re = resize normally
        var action = (this.isMobile ? 'rs_' : 're_') + (utils.getCurrentTimestamp() - nls.startTime) + '_' + (this.isMobile ? window.innerWidth : document.documentElement.clientWidth) + '_' + (this.isMobile ? window.innerHeight : document.documentElement.clientHeight) + '_' + nlsjq(window).scrollLeft() + '_' + nlsjq(window).scrollTop() + '_' + (this.isMobile ? scale.x + '_' + scale.y : '') + '_' + (this.isMobile ? screenScale.x : '') + '_' + (this.isMobile ? screenScale.y : '') + '_' + (this.isMobile ? nlsjq('html').width() : '') + '_' + (this.isMobile ? nlsjq('html').height() : '');
        this.recording.push(action);
      } else {
        this.devicePixelRatio = window.devicePixelRatio;
      }
    };
    var onMouseMove = function (e) {
      /*jshint validthis: true */
      // Set the element and its offset
      var el = e.target, offset = nlsjq(el).offset(), relativeCoords;
      // jQuery is returning offset as undefined if target is document (QF-4720)
      if (!offset) {
        return;
      }
      relativeCoords = this.getRelativeCoord({
        pageX: e.pageX,
        offsetX: offset.left,
        pageY: e.pageY,
        offsetY: offset.top
      });
      // Set the current mouse move data
      var Math = NativeConstants.get('Math');
      this.mouse.curMove.el = el;
      this.mouse.curMove.width = sharedUtils.getTrueWidth(el);
      this.mouse.curMove.height = sharedUtils.getTrueHeight(el);
      this.mouse.curMove.relX = Math.floor(relativeCoords.x);
      this.mouse.curMove.relY = Math.floor(relativeCoords.y);
      this.mouse.curMove.docX = e.pageX;
      this.mouse.curMove.docY = e.pageY;
    };
    var onScroll = utils.debounce(function () {
      /*jshint validthis: true */
      var scale = nls.getScale(), scaleX = !this.isMobile ? 1 : scale.x, scaleY = !this.isMobile ? 1 : scale.y;
      this.recording.push('sc_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + scaleX + '_' + scaleY + '_' + nlsjq(window).scrollLeft() + '_' + nlsjq(window).scrollTop() + '_' + window.innerWidth + '_' + window.innerHeight + '_' + nlsjq('html').width() + '_' + nlsjq('html').height());
    }.bind(self), 100);
    // Handle window resize
    eventsManager.addEventListener(window, 'resize', onWindowResize.bind(this));
    // Handle mouse movements
    eventsManager.addEventListener(document, 'mousemove', onMouseMove.bind(this));
    // Handle window scrolling
    eventsManager.addJqEventListener(nlsjq(window), 'on', 'scroll', onScroll);
    // Handle element scrolling
    if (typeof document.addEventListener === 'function') {
      eventsManager.addEventListener(document.body, 'scroll', self.sendElementScrollData.bind(self), true);
    } else {
      eventsManager.addJqEventListener(nlsjq('*'), 'on', 'scroll', self.sendElementScrollData.bind(self));
    }
    // Handle focus
    eventsManager.addEventListener(document, 'focus', function (e) {
      var el = e.target;
      this.recording.push('fo_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)));
    }.bind(this), true);
    // Handle blur
    eventsManager.addEventListener(document, 'blur', function (e) {
      var el = e.target, val = this.handleProtected(el);
      this.recording.push('bl_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + val);
    }.bind(this), true);
    onUrlChange(function () {
      this.recording.push('url_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + encodeURIComponent(location.href) + '_' + encodeURIComponent(this.currentUrl));
      this.currentUrl = location.href;
    }.bind(this));
    // Handle mousedown
    eventsManager.addEventListener(document.body, 'mousedown', onMouseDown.bind(this));
    // Handle mouseup
    eventsManager.addEventListener(document, 'mouseup', function (e) {
      var el = e.target, offset = nlsjq(el).offset(), index = nlsjq(el.nodeName).index(el);
      // If this is the window scrollbar
      // jQuery is returning offset as undefined if target is document (QF-4720)
      if (el.nodeName === 'HTML' || !offset) {
        return;
      }
      // Handle the action type (click happens if mousedown and up on same element)
      var action;
      if (el.nodeName === this.mouse.curDown.tag && index === this.mouse.curDown.index) {
        // Get the click type (left or right)
        switch (e.button) {
        case 0:
        /* falls through */
        case 1:
        /* falls through */
        default:
          action = 'mc_';
          break;
        case 2:
          action = 'mr_';
          break;
        }
      } else {
        action = 'mu_';
      }
      //This has been tackled while mouse down; since we are pushing the recording data unconditionally.
      // As per the flow, if the device is touch, touchEnd event records the data. If its not, mousedown does its job.
      if (action === 'mc_') {
        return;
      }
      var relativeCoords = this.getRelativeCoord({
        pageX: e.pageX,
        offsetX: offset.left,
        pageY: e.pageY,
        offsetY: offset.top
      });
      var Math = NativeConstants.get('Math');
      this.recording.push(action + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + sharedUtils.getTrueWidth(el) + '_' + sharedUtils.getTrueHeight(el) + '_' + Math.floor(relativeCoords.x) + '_' + Math.floor(relativeCoords.y) + '_' + this.mouse.curMove.docX + '_' + this.mouse.curMove.docY);
      // If this isn't a form submit button
      if (nlsjq(el).attr('type') !== 'submit') {
        // Send data on next cycle so that existing other mouseup handleres proccessed info can also be sent along with the request
        // e.g. Form Analysis also does some computation on mouseiup which will get missed if request is sent synchronously.
        setTimeout(function () {
          ajaxnls.sendRecordingData();
        }, 1);
        // Create lag delay to hopefully get data through to server
        var delayTime = el.nodeName === 'A' ? this.clickDelay.link : this.clickDelay.page;
        var Date = NativeConstants.get('Date');
        var now = new Date();
        var stopDateTime = now.getTime() + delayTime;
        while (now.getTime() < stopDateTime) {
          now = new Date();
        }
      }
    }.bind(this));
    // Handle keyup
    eventsManager.addEventListener(document, 'keyup', function (e) {
      var el = e.target, val = this.handleProtected(el);
      this.recording.push('ku_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + val);
    }.bind(this));
    // Handle radios
    eventsManager.addJqEventListener(nlsjq(document), 'on', 'change', function (e) {
      var el = e.target;
      this.recording.push('rb_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + nlsjq(el).isChecked());
    }.bind(this), 'input[type=radio]');
    // Handle checkboxes
    eventsManager.addJqEventListener(nlsjq(document), 'on', 'change', function (e) {
      var el = e.target;
      this.recording.push('cb_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + nlsjq(el).isChecked());
    }.bind(this), 'input[type=checkbox]');
    // Handle select boxes
    eventsManager.addJqEventListener(nlsjq(document), 'on', 'change', function (e) {
      var el = e.target, val, valjq = nlsjq(el).val();
      if (nlsjq.isArray(valjq)) {
        for (var i = 0; i < valjq.length; i++) {
          valjq[i] = nlsUtils.sanitizeActionData(valjq[i]);
        }
        val = valjq.join('!-ac-!');
      } else {
        val = valjq;
      }
      val = this.handleProtected(el);
      this.recording.push('sb_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(el)) + '_' + val);
    }.bind(this), 'select');
  };
  Recording.prototype.storeMouseMove = function () {
    // If this is the page scrollbar
    if (this.mouse.curMove.el.nodeName === 'HTML') {
      return;
    }
    // If the mouse hasn't moved
    if (this.mouse.lastMove.docX === this.mouse.curMove.docX && this.mouse.lastMove.docY === this.mouse.curMove.docY) {
      return;
    }
    // Push data to recording array
    this.recording.push('mm_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + nlsUtils.sanitizeActionData(vwoUtils.getXPath(this.mouse.curMove.el)) + '_' + this.mouse.curMove.width + '_' + this.mouse.curMove.height + '_' + this.mouse.curMove.relX + '_' + this.mouse.curMove.relY + '_' + this.mouse.curMove.docX + '_' + this.mouse.curMove.docY);
    this.mouse.lastMove.docX = this.mouse.curMove.docX;
    this.mouse.lastMove.docY = this.mouse.curMove.docY;
  };
  Recording.prototype.handleProtected = function (el) {
    var val = nlsUtils.handleProtected(el, this.anonymizeKeys);
    val = nlsUtils.sanitizeActionData(val);
    return val;
  };
  Recording.prototype.getHeatmapData = function (latestHeatmaps) {
    // If heatmap enabled and not stopped
    if (!nls.hs || nls.hsStopped) {
      return;
    }
    var heatmapEvents = latestHeatmaps, allowedNumberofEvents, data = {};
    allowedNumberofEvents = nls.Recording.heatmap.maxClicksRecorded - nls.Recording.heatmap.eventsLength;
    heatmapEvents = heatmapEvents.slice(0, allowedNumberofEvents);
    nls.Recording.heatmap.eventsLength += heatmapEvents.length;
    if (heatmapEvents.length > 0) {
      nlsjq.extend(data, { mc: heatmapEvents.join(',') });
    }
    if (nls.Recording.hasScrollChanged()) {
      /*jshint camelcase:false*/
      nlsjq.extend(data, { scroll_percentage: nls.recordingData.totals.scroll });  /*jshint camelcase:true*/
    }
    return data;
  };
  Recording.prototype.resetHeatmapData = function () {
    var NativeArray = NativeConstants.get('Array');
    nls.Recording.heatmap.eventsLength = 0;
    nls.hsStopped = false;
    nls.Recording.heatmap.clicks = new NativeArray();
    nls.Recording.index.heatmap = 0;
  };
  Recording.prototype.resetData = function () {
    nls.tags.eTags.refresh();
    nls.lastSendTime = 0;
    nls.Recording.resetHeatmapData();
  };
  Recording.prototype.hasScrollChanged = function () {
    return nls.recordingData.totals.scroll !== nls.recordingData.last.scroll;
  };
  /**
  * API function to add tags to a recording
  * Send multiple tags
  * Syntax: VWO.push(['nls.formAnalysis.addTag', <tag_array>])
  * Usage: VWO.push(['nls.formAnalysis.addTag', ['tag-name-1', 'tag-name-2']])
  * @param tag Array of strings
  */
  Recording.prototype.addTag = function (tag) {
    //addTags only in case of vba
    if (nls.analyze) {
      return;
    }
    nls.Recording.tags.add(tag);
    if (nls.Recording.tags.isTagPassed()) {
      // force push tags to sync at backend
      ajaxnls.sendRecordingData(true);
    }
  };
  Recording.prototype.getTagData = function () {
    // If recording disabled or no data addition
    if (!nls.r || !nls.Recording.tags.isTagPassed()) {
      return;
    }
    return { tags: nls.Recording.tags.get() };
  };
  Recording.prototype.getRecordingData = function (latestRecording, latestMutations) {
    var recordingData = {}, JSON = NativeConstants.get('JSON');
    // If recording disabled or no data addition
    if (!nls.r) {
      return;
    }
    if (latestRecording.length) {
      recordingData.recording = latestRecording.join(',');
    }
    if (latestMutations.length) {
      recordingData.mutations = JSON.stringify(latestMutations);
    }
    return recordingData;
  };
  Recording.prototype.sendData = function () {
    var data = {}, recordingData, heatmapData, tagData, latestRecording, latestMutations, latestHeatmaps, screenScale = nls.getScreenScale();
    this.oldSettings = this.oldSettings || {};
    if (this.isMobile) {
      if (this.oldSettings.screenScaleX !== screenScale.x || this.oldSettings.screenScaleY !== screenScale.y) {
        nls.Recording.recording.push('sS_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + // Screen Scale (due to keyboard or URL bar open)
        screenScale.x + '_' + screenScale.y);
        this.oldSettings.screenScaleX = screenScale.x;
        this.oldSettings.screenScaleY = screenScale.y;
      }
    }
    // If there's no new data
    if (nls.Recording.index.recording >= nls.Recording.recording.length && nls.Recording.index.heatmap >= nls.Recording.heatmap.clicks.length && nls.Mutations.index >= nls.Mutations.mutations.length && !nls.Recording.hasScrollChanged() && !nls.Recording.tags.isTagPassed()) {
      return;
    }
    // Get latest recording data
    latestRecording = nls.Recording.recording.slice(nls.Recording.index.recording);
    latestMutations = nls.Mutations.mutations.slice(nls.Mutations.index);
    latestHeatmaps = nls.Recording.heatmap.clicks.slice(nls.Recording.index.heatmap);
    // Update the indexes
    nls.Recording.index.recording = nls.Recording.recording.length;
    nls.Recording.index.heatmap = nls.Recording.heatmap.clicks.length;
    nls.Mutations.index = nls.Mutations.mutations.length;
    recordingData = nls.Recording.getRecordingData(latestRecording, latestMutations);
    heatmapData = nls.Recording.getHeatmapData(latestHeatmaps);
    tagData = nls.Recording.getTagData();
    nlsjq.extend(data, recordingData, heatmapData, tagData);
    return data;
  };
  Recording.prototype.pushScaleInformation = function () {
    var scale = nls.getScale(), xScale = scale.x, yScale = scale.y;
    this.recording.push('is_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + xScale + '_' + yScale + '_' + nlsjq(window).scrollLeft() + '_' + nlsjq(window).scrollTop());
  };
  Recording.prototype.init = function (isNewPageView) {
    if (isNewPageView) {
      Recording.bind(this)();
    }
    // Register callback in nlsajax
    this.currentUrl = location.href;
    ajaxnls.formSubmitCallbacks.push(this.sendData.bind(this));
    // Set the devicePixelRatio
    this.devicePixelRatio = window.devicePixelRatio;
    this.initialClientHeight = nls.getViewportDimensions().height;
    // Handle initial mobile scale
    if (this.isMobile) {
      this.oldSettings = this.oldSettings || {};
      var screenScale = nls.getScreenScale(), screenScaleX = screenScale.x, screenScaleY = screenScale.y;
      nls.Recording.recording.push('sS_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + // Screen Scale (due to keyboard or URL bar)
      screenScaleX + '_' + screenScaleY + '_');
      this.oldSettings.screenScaleX = screenScaleX;
      this.oldSettings.screenScaleY = screenScaleY;
      this.pushScaleInformation();
      for (var i = 500; i <= 2000; i += 500) {
        /*jshint -W083*/
        var pushScaleTimeout = setTimeout(this.pushScaleInformation.bind(this), i);
        eventsManager.pushTimers(pushScaleTimeout, 'timeout');
      }
    }
    var scale = nls.getScale();
    // Push the current scroll position
    this.recording.push('sc_' + (utils.getCurrentTimestamp() - nls.startTime) + '_' + (!this.isMobile ? 1 : scale.x) + '_' + (!this.isMobile ? 1 : scale.y) + '_' + nlsjq(window).scrollLeft() + '_' + nlsjq(window).scrollTop() + '_' + window.innerWidth + '_' + window.innerHeight + '_' + nlsjq('html').width() + '_' + nlsjq('html').height());
    // Load the event listeners
    if (!listenerAdded) {
      this.loadEventListeners();
      // Set the interval for storing mouse movements
      var mouseMoveInterval = setInterval(this.storeMouseMove.bind(this), 300);
      eventsManager.pushTimers(mouseMoveInterval, 'interval');
      listenerAdded = true;
    }
  };
  nls.Recording = new Recording();
  return nls;
}(core, gQuery, ajax_nls, mutations, NativeConstants, nls_utils, vwoUtils_tag, vwoUtils_vwo_utils, vwoUtils_utils, vwoUtils_eventsManager, utils);
FocusBlurService = function () {
  /**
   * empty function
   */
  var noop = function () {
  };
  /**
   * FocusBlurService constructor function
   */
  function FocusBlurService() {
    this.focusedNode = null;
    this.selectedLiIndex = -1;
  }
  /**
   * returns the currently focused node
   * @returns {object}
   */
  FocusBlurService.prototype.getFocusedNode = function () {
    return this.focusedNode;
  };
  /**
   * set the node as currently focused node
   * @param node
   */
  FocusBlurService.prototype.setFocusOnNode = function (node) {
    this.focusedNode = node;
  };
  /**
   * set focused node as null
   */
  FocusBlurService.prototype.resetFocusedNode = function () {
    this.focusedNode = null;
  };
  /**
   * reset the li node index to -1
   */
  FocusBlurService.prototype.resetSelectedLiIndex = function () {
    this.selectedLiIndex = -1;
  };
  /**
   * returns the currently selected li node
   * @param index
   * @returns {object}
   */
  FocusBlurService.prototype.getSelectedLiIndex = function (index) {
    return this.selectedLiIndex;
  };
  /**
   * Checks if selected li Index is different from latest index, executes callback function
   * @param index
   * @param callback
   */
  FocusBlurService.prototype.setSelectedLiIndex = function (index, callback) {
    callback = callback || noop;
    if (this.selectedLiIndex !== index) {
      this.selectedLiIndex = index;
      callback();
    }
  };
  /**
   * if currently focused node is different from latest node, then reset focused node and selectedLiIndex
   * @param latestNode
   * @param callback
   */
  FocusBlurService.prototype.doBlurOnNode = function (latestNode, callback) {
    callback = callback || noop;
    if (this.focusedNode && this.focusedNode !== latestNode) {
      callback();
      this.resetFocusedNode();
      this.resetSelectedLiIndex();
    }
  };
  /**
   * if  currently focusedNode is null(i.e. node is clicked first time) or latestNode is different from currently focusedNode, then execute callback
   * used for calling change event
   * @param latestNode
   * @param callback
   */
  FocusBlurService.prototype.doFocusOnNode = function (latestNode, callback) {
    callback = callback || noop;
    if (!this.focusedNode || this.focusedNode !== latestNode) {
      callback();
    }
  };
  var focusBlurHandler = new FocusBlurService();
  return focusBlurHandler;
}();
customFormElements = function (FocusBlurService, customEvent, nlsjq) {
  /**
   * stores the reference of nls.formAnalysis
   */
  var nlsRef;
  /**
   * If native element is repositioned, we need to change its corresponding mapped previous custom elements.
   * So delete previously mapped custom elements and remove its corresponding event Listeners.
   * delete vwoCustEl property saved on native element.
   * @param mappedObject
   */
  function natElementRepositioning(nativeElement) {
    if (nativeElement.vwoCustEl && nativeElement.vwoCustEl.length) {
      var mappedCustomElem = nativeElement.vwoCustEl;
      for (var i = 0; i < mappedCustomElem.length; i++) {
        delete mappedCustomElem[i].vwoNatEl;
        removeEventsFromCustomElem(mappedCustomElem[i]);
      }
      delete nativeElement.vwoCustEl;
    }
  }
  /**
   * It attaches the events to custom elements in capture phase
   * @param object custEl contains DOM Node on which events are attached
   */
  function attachEventsToCustomElem(custEl) {
    custEl.addEventListener('mousedown', customMouseDownHandler, true);
    custEl.addEventListener('mouseup', customMouseUpHandler, true);
    custEl.addEventListener('mouseenter', customMouseEnterHandler, true);
    custEl.addEventListener('mouseleave', customMouseLeaveHandler, true);
  }
  /**
   * It removes the events to custom elements in capture phase
   * @param object custEl contains DOM Node on which events are removed
   */
  function removeEventsFromCustomElem(custEl) {
    custEl.removeEventListener('mousedown', customMouseDownHandler, true);
    custEl.removeEventListener('mouseup', customMouseUpHandler, true);
    custEl.removeEventListener('mouseenter', customMouseEnterHandler, true);
    custEl.removeEventListener('mouseleave', customMouseLeaveHandler, true);
  }
  /**
   * It maps the cutom elements with native elements by adding property vwoNatEl
   * against native elements.
   * It attaches custom elements with listeners and updates the window.vwofem caontaining native and custom elements.
   */
  function internalMapping(mappedObject) {
    var customElements = mappedObject.customElements, nativeElement = mappedObject.nativeElement, newCustomElem = [];
    for (var i = 0; i < customElements.length; i++) {
      if (customElements[i]) {
        if (customElements[i].vwoNatEl) {
          continue;
        }
        customElements[i].vwoNatEl = nativeElement;
        attachEventsToCustomElem(customElements[i]);
        newCustomElem.push(customElements[i]);
      }
    }
    nativeElement.vwoCustEl = newCustomElem;
  }
  /**
   * Call this function if you want to map input elements with associated label element
   * @param node HTML Node to be mapped
   * It also internally handles the label elements to be mapped with input of type radio an checkbox
   * checks for Label which can either be present as parent of input element or associated with for attribute.
   * @returns {object} return label associated with input
   */
  function labelMapping(node) {
    var inpEl = nlsjq(node), type = inpEl.attr('type');
    if (inpEl.is('input') && (type === 'checkbox' || type === 'radio')) {
      var label = nlsjq('label[for="' + inpEl.attr('id') + '"]');
      if (label.length <= 0) {
        var parentElem = inpEl.parent(), parentTagName = parentElem.get(0).tagName.toLowerCase();
        if (parentTagName === 'label') {
          label = parentElem;
        }
      }
      return label.get(0);
    }
  }
  /**
   * Listenes for mouse down event on every custom element.
   * @param e event object
   * It internally fires change handler for select options and blur handler if last focus is different from current element.
   */
  function customMouseDownHandler(e) {
    var el = e.currentTarget.vwoNatEl;
    var targetElem = nlsjq(e.target);
    //	li options is selected considering DOM structure li > a > span
    //  change is fired only if option selected is different from previous.
    //USE findParentsElement use in jsliB GOAL TRIGGERING FUNCTION
    if (el.tagName && el.tagName === 'SELECT' && (targetElem.is('li') || targetElem.parent().is('li') || targetElem.parent().parent().is('li'))) {
      var newIndex = targetElem.closest('li').index();
      el.chStatsProcessed = 0;
      FocusBlurService.setSelectedLiIndex(newIndex, nlsRef.changeHandler.bind({}, { target: el }, true));
      el.chStatsProcessed = 1;
      return;
    }
    // fire original mouseDownHandler
    el.mdStatsProcessed = 0;
    nlsRef.mouseDownHandler({ target: el });
    el.mdStatsProcessed = 1;
    //element is not focused currently, fire original focusHandler on element.
    el.fcStatsProcessed = 0;
    FocusBlurService.doFocusOnNode(el, nlsRef.focusHandler.bind({}, { target: el }));
    el.fcStatsProcessed = 1;
  }
  /**
   * Listenes for mouse up event on every custom element.
   * @param e event object
   * It internally fires change handler for input options and blur handler if last focus is different from current element.
   */
  function customMouseUpHandler(e) {
    var targetElem = nlsjq(e.target);
    var el = e.currentTarget.vwoNatEl;
    // Don't fire other events if select option nodes are selected.
    // Since when option is selected only change fired if different node is selected.
    if (el.tagName && el.tagName === 'SELECT' && (targetElem.parent().is('li') || targetElem.parent().parent().is('li'))) {
      return;
    }
    el.muStatsProcessed = 0;
    nlsRef.mouseUpHandler({ target: el });
    el.muStatsProcessed = 1;
    el.chStatsProcessed = 0;
    // Change event is fired whether same checkbox clicked again n again
    if (el.tagName === 'INPUT' && el.type === 'checkbox') {
      nlsRef.changeHandler({ target: el });
    }  // Change event is not fired if same radio clicked again n again
       // Fire only when selected first time or different radio is selected
    else if (el.tagName === 'INPUT' && el.type === 'radio') {
      FocusBlurService.doFocusOnNode(el, nlsRef.changeHandler.bind({}, { target: el }));
    }
    el.chStatsProcessed = 1;
    //set the value of focused node
    FocusBlurService.setFocusOnNode(el);
  }
  /**
   * Listenes for mouse enter event on every custom element.
   * @param e event object
   * It internally fires native mouseEnter handler
   */
  function customMouseEnterHandler(e) {
    var el = e.currentTarget.vwoNatEl;
    el.meStatsProcessed = 0;
    nlsRef.mouseEnterHandler({ target: el });
    el.meStatsProcessed = 1;
  }
  /**
   * Listenes for mouse enter event on every custom element.
   * @param e event object
   * It internally fires native mouseEnter handler
   */
  function customMouseLeaveHandler(e) {
    var el = e.currentTarget.vwoNatEl;
    el.mlStatsProcessed = 0;
    nlsRef.mouseLeaveHandler({ target: el });
    el.mlStatsProcessed = 1;
  }
  function attachCustomElemEventListener() {
    /**
     * Listen for the event vwo_element_added
     * It is fired for native elements to be mapped on custom elements
     * @param e e.data can contain array of NodeList or single DOM Node to be mapped with custom element
     * It internally maps label elements with input
     */
    document.addEventListener('vwo_element_added', function (e) {
      if (!nlsRef._mapElements) {
        return;
      }
      var nativeElement = e.data;
      if (nativeElement.constructor !== NodeList) {
        nativeElement = [nativeElement];
      }
      for (var i = 0; i < nativeElement.length; i++) {
        var customElements = [], customNativeMapping;
        if (nativeElement[i].tagName && nativeElement[i].tagName.toLowerCase() === 'input') {
          customElements.push(labelMapping(nativeElement[i]));
        }
        customElements.push(nlsRef._mapElements(nativeElement[i]));
        var genericCustomElement = customElements.reduce(function (accumulator, currentValue) {
          return accumulator.concat(currentValue);
        }, []);
        customNativeMapping = {
          customElements: genericCustomElement,
          nativeElement: nativeElement[i]
        };
        natElementRepositioning(nativeElement[i]);
        internalMapping(customNativeMapping);
      }
    }, false);
  }
  return {
    init: function (nls) {
      nlsRef = nls;
      attachCustomElemEventListener();
    }
  };
}(FocusBlurService, customEvent, gQuery);
form_analysis = function (nls, nlsjq, ajaxnls, NativeConstants, utils, eventsManager, FocusBlurService, customEvent, customFormElements) {
  /* jshint camelcase:false */
  var vwoExp = window._vwo_exp, vwoExpIds = window._vwo_exp_ids, listenerAdded,
    /*jshint camelcase: true */
    ANALYZE_FORM_ANALYSIS_CAMPAIGN = 'ANALYZE_FORM', formId = 0, formAnalysis;
  function processInitialNodes() {
    var formSelectors = 'select, input, label';
    var domNodes = document.querySelectorAll(formSelectors);
    if (domNodes.length) {
      var custEv = customEvent.createEvent(document, 'vwo_element_added');
      custEv.data = domNodes;
      customEvent.dispatchEvent(document, custEv);
    }
  }
  /**
  * API function to execute user callback function to extract custom elemets against each native element
  * Usage: VWO.push(['nls.formAnalysis.mapElements', nativeToCustomCallback])
  * @param form	Instance of the form (can be of jQuery or Javascript)
  * @param success Should be 0 or 1 { 0: failure, 1: success }
  */
  function mapElements(nativeToCustomCallback) {
    if (nativeToCustomCallback) {
      formAnalysis._mapElements = nativeToCustomCallback;
      processInitialNodes();
    }
  }
  /**
  * Checks if elements has to be processed for stats depending upon if it has been previously processed or element is not active
  * Properties checked for pre processing are below -
  * meStatsProcessed -> mouse Enter Stats Processed
  * mlStatsProcessed -> mouse Leave Stats Processed
  * mdStatsProcessed -> mouse Down Stats Processed
  * muStatsProcessed -> mouse Up Stats  Processed
  * fcStatsProcessed -> mouse Up Stats  Processed
  * blStats -> Blur Stats  Processed
  * chStatsProcessed ->  Change Stats  Processed
  * kdStats -> Key Down Stats  Processed
     * @param e eventObject
     * @param type type of event
     */
  function preProcessEvents(e, type) {
    var $el = nlsjq(e.target), el = $el.get(0), isProcessedForStats;
    switch (type) {
    case 'mouseenter':
      isProcessedForStats = el.meStatsProcessed;
      break;
    case 'mouseleave':
      isProcessedForStats = el.mlStatsProcessed;
      break;
    case 'mousedown':
      isProcessedForStats = el.mdStatsProcessed;
      break;
    case 'mouseup':
      isProcessedForStats = el.muStatsProcessed;
      break;
    case 'focus':
      isProcessedForStats = el.fcStatsProcessed;
      break;
    case 'blur':
      isProcessedForStats = el.blStats;
      break;
    case 'change':
      isProcessedForStats = el.chStatsProcessed;
      break;
    case 'keydown':
      isProcessedForStats = el.kdStats;
    }
    // If element is already processed OR If this element isn't active
    if (isProcessedForStats || !formAnalysis.handleTracking($el)) {
      return;
    }
    return $el;
  }
  formAnalysis = {
    f: {},
    forms: {},
    // not to be defined initially
    lastSentForms: undefined,
    changes: {},
    formInputSelector: 'form input, form select, form textarea, [nls_fa_name]:not(form) input, [nls_fa_name]:not(form) select, [nls_fa_name]:not(form) textarea',
    getFormName: function (form) {
      if (nls.analyze) {
        // In case of new analyze call, assign unique id to each form and use that only
        // instead of getting name with form name and id
        var id = form.data('id');
        if (id) {
          return id;
        }
        formId++;
        form.data('id', formId);
        return formId;
      } else {
        // Get the form name via nls_fa_name attribute, or name/id
        if (typeof form.attr('nls_fa_name') !== 'undefined' && form.attr('nls_fa_name') !== false) {
          return form.attr('nls_fa_name');
        } else if (typeof form.attr('id') !== 'undefined' && form.attr('id') !== false) {
          return form.attr('id');
        } else if (typeof form.attr('name') !== 'undefined' && form.attr('name') !== false) {
          return form.attr('name');
        }
      }
      return false;
    },
    getFormElementName: function (el) {
      // Get the element name via nls_fa_el_name attribute, or name/id
      if (typeof el.attr('nls_fa_el_name') !== 'undefined' && el.attr('nls_fa_el_name') !== false && el.attr('nls_fa_el_name') !== null) {
        return el.attr('nls_fa_el_name');
      } else if (typeof el.attr('id') !== 'undefined' && el.attr('id') !== false && el.attr('id') !== null) {
        return el.attr('id');
      } else if (typeof el.attr('name') !== 'undefined' && el.attr('name') !== false && el.attr('name') !== null) {
        return el.attr('name');
      }
      return false;
    },
    addForm: function (form) {
      // Get the form name
      var name = this.getFormName(form), length = vwoExpIds.length, exp, expId, shouldAddForm;
      var hiddenCheck, hiddenCheckResult;
      if (!name) {
        return;
      }
      function serializeFormAnalysis(index, item) {
        /*jshint validthis: true */
        if (item === form[0]) {
          shouldAddForm = true;
          formAnalysis.f[name] = formAnalysis.f[name] || {};
          if (!formAnalysis.f[name][expId]) {
            formAnalysis.f[name][expId] = exp.forms[0];
          }
        }
      }
      function updateHiddenCheck(index, item) {
        /*jshint validthis: true */
        var el = nlsjq(item);
        if (el.prop('type').toLowerCase() === 'hidden') {
          hiddenCheck.hiddenInputs += 1;
        }
        if (el.prop('type').toLowerCase() === 'submit') {
          hiddenCheck.submit += 1;
        }
        hiddenCheck.total += 1;
      }
      function processFormElements(index, item) {
        /*jshint validthis: true */
        var el = nlsjq(item), elName = formAnalysis.getFormElementName(el), elType = el.prop('type'), elActiveTracked = el.data('nls_fa_tracked') === 1 && el.data('nls_fa_active') === 1;
        // If we couldn't get the form name or this element's name or this element is a hidden input, or the whole form is hidden or empty, add tracking info to this element and skip it
        if (!name || !elName || el.prop('type').toLowerCase() === 'hidden' || hiddenCheckResult) {
          // If the field has already been tracked and set as active, then don't mark it as inactive
          if (!elActiveTracked) {
            el.data('nls_fa_tracked', 1);
            el.data('nls_fa_active', 0);
          }
          return true;
        }
        var fieldPos = formAnalysis.forms[name].fields.length;
        // Add it to the fields array
        formAnalysis.forms[name].fields.push({
          'name': elName,
          'type': elType,
          'interacted': 0,
          'filledOut': 0,
          'refilled': 0,
          'timeHesitation': 0,
          'timeInteraction': 0,
          'fip': fieldPos
        });
        // Add tracking info
        el.data('nls_fa_tracked', 1);
        el.data('nls_fa_active', 1);
        el.data('nls_fa_name', name);
        el.data('nls_fa_field_pos', fieldPos);
      }
      // Iterate over the experiments to add expId in corresponding forms
      while (length--) {
        expId = vwoExpIds[length];
        exp = vwoExp[expId];
        // Will not execute for old ANALYSIS campaign
        /*jshint loopfunc: true */
        if (exp.type === ANALYZE_FORM_ANALYSIS_CAMPAIGN && exp.ready) {
          // Assuming forms will be an array from backend and contains only one element
          // adding eq(0) so that it will track only first form in case of selector matching more than one.
          var forms;
          try {
            // Invalid selector paths throw error in jquery. So adding try catch to avoiding that
            forms = nlsjq(exp.forms[0]);
          } catch (e) {
            return;
          }
          forms.eq(0).each(serializeFormAnalysis);
        }  /*jshint loopfunc: false */
      }
      // If new analyze campaigns are there and shouldAddForm is false, just return without adding forms
      if (nls.analyze && !shouldAddForm) {
        return;
      }
      // If this form has already been tracked or In case we already have the data for the form, it means some other form with same formName came for tracking which we don't support
      if (form.data('nls_fa_tracked') === 1 || this.forms[name]) {
        return;
      }
      // Check if all elements are hidden inputs
      hiddenCheck = {
        'hiddenInputs': 0,
        'submit': 0,
        'total': 0
      };
      form.find('input, select, textarea').each(updateHiddenCheck);
      // Set the hidden form check result to be used in if statements
      hiddenCheckResult = hiddenCheck.hiddenInputs + hiddenCheck.submit === hiddenCheck.total;
      var NativeArray = NativeConstants.get('Array');
      if (name) {
        // If we identified the name for this form but all inputs (besides submit) are hidden, or this form is empty (checks with hidden check), 
        // we should delay the form for later tracking, may be someone add trackable element later.
        if (hiddenCheckResult) {
          form.data('nls_fa_tracked', 0);
          form.data('nls_fa_active', 0);
        } else {
          form.data('nls_fa_tracked', 1);
          form.data('nls_fa_active', 1);
          // Add it to formAnalysis.forms array
          this.forms[name] = {
            'name': name,
            'fields': new NativeArray(),
            'interacted': 0,
            'submitted': 0
          };
          form.data('nls_fa_name', name);
        }
      } else {
        // If we didn't have the name of the form, we simply can't activate it.
        form.data('nls_fa_tracked', 1);
        form.data('nls_fa_active', 0);
      }
      // Iterate through this form's elements
      form.find('input, select, textarea').each(processFormElements);
      // Add this form to changes array
      if (this.forms.hasOwnProperty(name)) {
        this.addChanges('add_forms', this.forms[name], name);
      }
    },
    addFormElement: function (el) {
      // If this element has already been tracked
      if (el.data('nls_fa_tracked') === 1) {
        return;
      }
      // Get the parent form
      var form = el.closest('form,[nls_fa_name]:not(form)');
      // If this form isn't tracked yet, track it, this element will be tracked automatically
      if (form.data('nls_fa_tracked') !== 1) {
        this.addForm(form);
        return;
      }
      // If this form is tracked but isn't active, set tracking on element
      if (form.data('nls_fa_tracked') === 1 && form.data('nls_fa_active') !== 1) {
        el.data('nls_fa_tracked', 1);
        el.data('nls_fa_active', 0);
        return;
      }
      // Set the formName
      var formName = form.data('nls_fa_name');
      // Get the element name
      var elName = this.getFormElementName(el), elType = el.prop('type');
      // If we can't get a name for this element or it's a hidden input
      if (!elName || el.prop('type').toLowerCase() === 'hidden') {
        el.data('nls_fa_tracked', 1);
        el.data('nls_fa_active', 0);
        return;
      }
      // Get the fieldPos
      var fieldPos = this.forms[formName].fields.length;
      // Add it to the fields array
      this.forms[formName].fields.push({
        'name': elName,
        'type': elType,
        'interacted': 0,
        'filledOut': 0,
        'refilled': 0,
        'timeHesitation': 0,
        'timeInteraction': 0,
        'fip': fieldPos
      });
      // Add tracking info
      el.data('nls_fa_tracked', 1);
      el.data('nls_fa_active', 1);
      el.data('nls_fa_name', formName);
      el.data('nls_fa_field_pos', fieldPos);
      // Add to changes array
      if (this.forms[formName].fields.hasOwnProperty(fieldPos)) {
        this.addChanges('edit', {
          'a': 'add',
          't': 'element',
          'd': this.forms[formName].fields[fieldPos]
        }, formName);
      }
    },
    _addForm: function (index, form) {
      formAnalysis.addForm(nlsjq(form));
    },
    loadForms: function () {
      // Iterate through each form and add it
      nlsjq('form').each(this._addForm);
      nlsjq('[nls_fa_name]:not(form)').each(this._addForm);
    },
    handleTracking: function (el) {
      // If this element hasn't been tracked yet
      if (el.data('nls_fa_tracked') !== 1) {
        this.addFormElement(el);
      }
      // Event after adding form element, if its marked as untracked, then skip this field
      if (!el.data('nls_fa_tracked')) {
        return;
      }
      // If this element is tracked but isn't active
      if (el.data('nls_fa_tracked') === 1 && el.data('nls_fa_active') !== 1) {
        return false;
      }
      return true;
    },
    addChanges: function (section, data, formName) {
      if (section === 'add_forms') {
        /*jshint camelcase:false*/
        if (typeof this.changes.add_forms === 'undefined') {
          this.changes.add_forms = {};
        }
        this.changes.add_forms[formName] = data;  /*jshint camelcase:true*/
      } else if (section === 'edit') {
        var NativeArray = NativeConstants.get('Array');
        if (typeof this.changes.edit === 'undefined') {
          this.changes.edit = {};
        }
        if (typeof this.changes.edit[formName] === 'undefined') {
          this.changes.edit[formName] = new NativeArray();
        }
        this.changes.edit[formName].push(data);
      }
    },
    staggerChanges: function () {
      //Stagger the changes
      var changesStaggered = {};
      var NativeArray = NativeConstants.get('Array');
      for (var section in this.changes) {
        if (!formAnalysis.changes.hasOwnProperty(section)) {
          continue;
        }
        if (section === 'add_forms') {
          /*jshint camelcase:false*/
          changesStaggered.add_forms = formAnalysis.changes.add_forms;  /*jshint camelcase:true*/
        } else if (section === 'edit') {
          changesStaggered.edit = {};
          for (var formName in formAnalysis.changes.edit) {
            if (!formAnalysis.changes.edit.hasOwnProperty(formName)) {
              continue;
            }
            changesStaggered.edit[formName] = new NativeArray();
            for (var i = 0; i < formAnalysis.changes.edit[formName].length; i++) {
              //If this isn't the last one
              if (i + 1 !== formAnalysis.changes.edit[formName].length) {
                var change = formAnalysis.changes.edit[formName][i];
                var nextChange = formAnalysis.changes.edit[formName][i + 1];
                //If this is an edit of the same field for the same property as the next
                // Todo: Removed code that verified the formPos for each field inside
                if (change.a === 'edit' && change.fip === nextChange.fip && change.d.pn === nextChange.d.pn) {
                  continue;
                }
              }
              changesStaggered.edit[formName].push(formAnalysis.changes.edit[formName][i]);
            }
          }
        }
      }
      this.changes = {};
      return changesStaggered;
    },
    changeHandler: function (e) {
      var el = preProcessEvents(e, 'change');
      if (!el) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name');
      var fieldPos = el.data('nls_fa_field_pos');
      var fname = formAnalysis.forms[formName].fields[fieldPos].name;
      // Handle the focus time
      if (el.data('nls_fa_focus_time') > 0) {
        // Handle the hesitation time
        formAnalysis.forms[formName].fields[fieldPos].timeHesitation += utils.getCurrentTimestamp() - el.data('nls_fa_focus_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeHesitation',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeHesitation
          }
        }, formName);
        // Reset the focus time
        el.data('nls_fa_focus_time', 0);
      }
      // Handle the keydown time
      if (el.data('nls_fa_keydown_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeInteraction += utils.getCurrentTimestamp() - el.data('nls_fa_keydown_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeInteraction',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeInteraction
          }
        }, formName);
        // Reset the keydown time
        el.data('nls_fa_keydown_time', 0);
      }
      // Reset the mouseenter and mousedown times
      el.data('nls_fa_mouseenter_time', 0);
      el.data('nls_fa_mousedown_time', 0);
      // Handle refilled before filledOut
      if (formAnalysis.forms[formName].fields[fieldPos].filledOut === 1) {
        formAnalysis.forms[formName].fields[fieldPos].refilled = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'refilled',
            'v': formAnalysis.forms[formName].fields[fieldPos].refilled
          }
        }, formName);
      }
      // Handle filledOut
      if (!el.val() && formAnalysis.forms[formName].fields[fieldPos].filledOut === 1) {
        formAnalysis.forms[formName].fields[fieldPos].filledOut = 0;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'filledOut',
            'v': formAnalysis.forms[formName].fields[fieldPos].filledOut
          }
        }, formName);
      } else if (el.val() && formAnalysis.forms[formName].fields[fieldPos].filledOut === 0) {
        formAnalysis.forms[formName].fields[fieldPos].filledOut = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'filledOut',
            'v': formAnalysis.forms[formName].fields[fieldPos].filledOut
          }
        }, formName);
      }
    },
    blurHandler: function (e) {
      var el = preProcessEvents(e, 'blur');
      if (!el) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name');
      var fieldPos = el.data('nls_fa_field_pos');
      var fname = formAnalysis.forms[formName].fields[fieldPos].name;
      // Handle the focus time
      if (el.data('nls_fa_focus_time') > 0) {
        // Handle the hesitation time
        formAnalysis.forms[formName].fields[fieldPos].timeHesitation += utils.getCurrentTimestamp() - el.data('nls_fa_focus_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeHesitation',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeHesitation
          }
        }, formName);
        // Reset the focus time
        el.data('nls_fa_focus_time', 0);
      }
      // Handle the keydown time
      if (el.data('nls_fa_keydown_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeInteraction += utils.getCurrentTimestamp() - el.data('nls_fa_keydown_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeInteraction',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeInteraction
          }
        }, formName);
        // Reset the keydown time
        el.data('nls_fa_keydown_time', 0);
      }
      // Reset the mouseenter and mousedown times
      el.data('nls_fa_mouseenter_time', 0);
      el.data('nls_fa_mousedown_time', 0);
    },
    focusHandler: function (e) {
      var el = preProcessEvents(e, 'focus');
      if (!el) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name');
      var fieldPos = el.data('nls_fa_field_pos');
      var fname = formAnalysis.forms[formName].fields[fieldPos].name;
      // Set this form and element as interacted with
      if (formAnalysis.forms[formName].interacted === 0) {
        formAnalysis.forms[formName].interacted = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'form',
          'd': {
            'pn': 'interacted',
            'v': 1
          }
        }, formName);
      }
      if (formAnalysis.forms[formName].fields[fieldPos].interacted === 0) {
        formAnalysis.forms[formName].fields[fieldPos].interacted = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'interacted',
            'v': 1
          }
        }, formName);
      }
      // Set the focus time
      el.data('nls_fa_focus_time', utils.getCurrentTimestamp());
      // Handle the mouseenter time
      if (el.data('nls_fa_mouseenter_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeHesitation += utils.getCurrentTimestamp() - el.data('nls_fa_mouseenter_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeHesitation',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeHesitation
          }
        }, formName);
        // Reset the mouseenter time
        el.data('nls_fa_mouseenter_time', 0);
      }
    },
    mouseUpHandler: function (e) {
      var el = preProcessEvents(e, 'mouseup');
      if (!el) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name'), fieldPos = el.data('nls_fa_field_pos'), fname = formAnalysis.forms[formName].fields[fieldPos].name;
      // Handle the mousedown time
      if (el.data('nls_fa_mousedown_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeInteraction += utils.getCurrentTimestamp() - el.data('nls_fa_mousedown_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeInteraction',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeInteraction
          }
        }, formName);
        // Reset the mousedown time
        el.data('nls_fa_mousedown_time', 0);
      }
    },
    mouseDownHandler: function (e) {
      var el = preProcessEvents(e, 'mousedown');
      if (!el) {
        return;
      }
      // fire blur Handler if current element is different from last focused element and reset currently focused and selectedLiIndex.
      // This is done to detect and fire blur on custom form node when native form node is selected.
      FocusBlurService.doBlurOnNode(el.get(0), formAnalysis.blurHandler.bind({}, { target: FocusBlurService.getFocusedNode() }));
      // Set the mousedown time
      el.data('nls_fa_mousedown_time', utils.getCurrentTimestamp());
    },
    mouseLeaveHandler: function (e) {
      var el = preProcessEvents(e, 'mouseleave');
      if (!el || el.isFocussed()) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name');
      var fieldPos = el.data('nls_fa_field_pos');
      var fname = formAnalysis.forms[formName].fields[fieldPos].name;
      //Handle the mouseenter time
      if (el.data('nls_fa_mouseenter_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeHesitation += utils.getCurrentTimestamp() - el.data('nls_fa_mouseenter_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeHesitation',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeHesitation
          }
        }, formName);
        // Reset the mouseenter time
        el.data('nls_fa_mouseenter_time', 0);
      }
    },
    mouseEnterHandler: function (e) {
      var el = preProcessEvents(e, 'mouseenter');
      if (!el || el.isFocussed()) {
        return;
      }
      // Set the mousedown time
      el.data('nls_fa_mouseenter_time', utils.getCurrentTimestamp());
    },
    onFormSubmit: function () {
      var form = nlsjq(this);
      formAnalysis.trackFormSubmission(form);
    },
    keyDownHandler: function (e) {
      var el = preProcessEvents(e, 'keydown');
      if (!el) {
        return;
      }
      // Set the formName and fieldPos variables
      var formName = el.data('nls_fa_name');
      var fieldPos = el.data('nls_fa_field_pos');
      var fname = formAnalysis.forms[formName].fields[fieldPos].name;
      // Handle the focus time
      if (el.data('nls_fa_focus_time') > 0) {
        // Handle the hesitation time
        formAnalysis.forms[formName].fields[fieldPos].timeHesitation += utils.getCurrentTimestamp() - el.data('nls_fa_focus_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeHesitation',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeHesitation
          }
        }, formName);
        // Reset the focus time
        el.data('nls_fa_focus_time', 0);
      }
      // Handle last keydown time
      if (el.data('nls_fa_keydown_time') > 0) {
        formAnalysis.forms[formName].fields[fieldPos].timeInteraction += utils.getCurrentTimestamp() - el.data('nls_fa_keydown_time');
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'element',
          'fip': fieldPos,
          'fname': fname,
          'd': {
            'pn': 'timeInteraction',
            'v': formAnalysis.forms[formName].fields[fieldPos].timeInteraction
          }
        }, formName);
      }
      // Set the keydown time
      el.data('nls_fa_keydown_time', utils.getCurrentTimestamp());
    },
    loadFormEventListeners: function () {
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'focus', formAnalysis.focusHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'blur', formAnalysis.blurHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'change', formAnalysis.changeHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'keydown', formAnalysis.keyDownHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'mouseenter', formAnalysis.mouseEnterHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'mouseleave', formAnalysis.mouseLeaveHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'mousedown', formAnalysis.mouseDownHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'mouseup', formAnalysis.mouseUpHandler, this.formInputSelector);
      eventsManager.addJqEventListener(nlsjq(document), 'on', 'submit', this.onFormSubmit, 'form');
    },
    /**
     * API function to mark the form as success.
     * Usage: VWO.push(['nls.formAnalysis.markSuccess', formInstance, isSuccess])
     * @param form	Instance of the form (can be of jQuery or Javascript)
     * @param success Should be 0 or 1 { 0: failure, 1: success }
     */
    markSuccess: function (form, success) {
      var $form = nlsjq(form), formName = formAnalysis.getFormName($form);
      if (!formName) {
        return;
      }
      form = formAnalysis.forms[formName];
      if (form) {
        form.success = success;
        formAnalysis.trackFormSubmission($form);
      }
    },
    /**
     * Has form successfully submitted, read the value marked by markSuccess function.
     * If no value has been marked, returns 1 always
     * @param formName Name of the form to be checked ( nls_fa_name data )
     * @returns {*} 0 or 1
     */
    isFormSuccess: function (formName) {
      var form = formAnalysis.forms[formName];
      if (form) {
        return form.success === 0 || form.success === false ? 0 : 1;
      } else {
        return 1;
      }
    },
    trackFormSubmission: function (form) {
      // If this form hasn't been tracked yet
      if (form.data('nls_fa_tracked') !== 1) {
        this.addForm(form);
      }
      // If this form is tracked but isn't active
      if (form.data('nls_fa_tracked') === 1 && form.data('nls_fa_active') !== 1) {
        return;
      }
      // Set the formName variable
      var formName = form.data('nls_fa_name');
      // If formName is not defined or forms object does not have the form, return (reason: addForm was unable to add form because form does
      // 	exists in any experiment
      if (!formName || !formAnalysis.forms[formName]) {
        return;
      }
      if (formAnalysis.forms[formName].submitted === 1) {
        return;
      }
      if (formAnalysis.forms[formName].interacted === 0) {
        // Set as interacted with
        formAnalysis.forms[formName].interacted = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'form',
          'd': {
            'pn': 'interacted',
            'v': 1
          }
        }, formName);
      }
      // Checking if form successfully submitted (marked by user). If not, marked the form as failed
      if (formAnalysis.isFormSuccess(formName)) {
        // Set as submitted with
        formAnalysis.forms[formName].submitted = 1;
        // Add to changes array
        formAnalysis.addChanges('edit', {
          'a': 'edit',
          't': 'form',
          'd': {
            'pn': 'submitted',
            'v': 1
          }
        }, formName);
      } else {
        if (!formAnalysis.forms[formName].failed) {
          // Set as failed form submission
          formAnalysis.forms[formName].failed = 1;
          // Add to changes array
          formAnalysis.addChanges('edit', {
            'a': 'edit',
            't': 'form',
            'd': {
              'pn': 'failed',
              'v': 1
            }
          }, formName);
        }
      }
      // TODO: If all 'if' conditions will be false, then possibility of submission of blank data
      // Send data
      ajaxnls.sendRecordingData();
      // Create a lag delay so hopefully the last ajax call goes through
      var Date = NativeConstants.get('Date');
      var now = new Date();
      var stopDateTime = now.getTime() + 300;
      while (now.getTime() < stopDateTime) {
        now = new Date();
      }
    },
    sendData: function () {
      if (!nls.fae) {
        return;
      }
      // Get staggered form changes
      var lastSentForms = formAnalysis.lastSentForms, formChanges = formAnalysis.staggerChanges(), action, change, formObj, lastSentValue, lastSentForm;
      if (!lastSentForms) {
        formAnalysis.lastSentForms = formAnalysis.forms;
      }
      // Changing the absolute value of timeHesitation and timeInteraction to relative
      for (var formName in formChanges.edit) {
        if (!formChanges.edit.hasOwnProperty(formName)) {
          continue;
        }
        formObj = formChanges.edit[formName];
        lastSentForm = formAnalysis.lastSentForms[formName];
        for (var changeIndex in formObj) {
          if (!formObj.hasOwnProperty(changeIndex)) {
            continue;
          }
          action = formObj[changeIndex];
          if (!(action.d.pn === 'timeHesitation' || action.d.pn === 'timeInteraction')) {
            continue;
          }
          lastSentValue = lastSentForm && lastSentForm.fields[action.fip] ? lastSentForm.fields[action.fip][action.d.pn] : 0;
          change = action.d.v - lastSentValue;
          if (change <= 0) {
            continue;
          }
          formChanges.edit[formName][changeIndex].d.v = change;
        }
      }
      formAnalysis.lastSentForms = nlsjq.extend(true, {}, formAnalysis.forms);
      if (!nlsjq.isEmptyObject(formChanges)) {
        var JSON = NativeConstants.get('JSON');
        var data = {
          /*jshint camelcase:false*/
          fa_changes: JSON.stringify(formChanges)  /*jshint camelcase:true*/
        };
        if (nls.analyze) {
          data.f = JSON.stringify(formAnalysis.f);
        }
        return data;
      }
    },
    init: function () {
      // Register callback in nlsajax
      ajaxnls.formSubmitCallbacks.push(this.sendData.bind(this));
      // Start tracking forms
      this.loadForms();
      if (!listenerAdded) {
        // Start tracking form events
        this.loadFormEventListeners();
        listenerAdded = true;
      }
      // Reset changes
      this.changes = {};
      customFormElements.init(formAnalysis);
    }
  };
  nls.formAnalysis = formAnalysis;
  nls.mapElements = mapElements;
  return nls;
}(core, gQuery, ajax_nls, NativeConstants, vwoUtils_utils, vwoUtils_eventsManager, FocusBlurService, customEvent, customFormElements);
init_all_modules = function (init) {
  // Early return if library has been already initialized
  if (window.__nls) {
    return;
  }
  return init([
    'Recording',
    'formAnalysis',
    'Mutations'
  ]);
}(init_init);
}());
});
})();
