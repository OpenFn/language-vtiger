'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.login = login;
exports.listTypes = listTypes;
exports.postElement = postElement;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _url = require('url');

var _lodashFp = require('lodash-fp');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
// var md5 = require('md5');


function assembleError(_ref) {
  var response = _ref.response,
      error = _ref.error;

  if (response && [200, 201, 202, 204].indexOf(response.statusCode) > -1) return false;
  if (error) return error;
  return new Error('Server responded with ' + response.statusCode);
}

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  // return state => {
  //   return commonExecute(...operations)({ ...initialState, ...state })
  // };

  return function (state) {
    return _languageCommon.execute.apply(undefined, [challenge, login].concat(_toConsumableArray((0, _lodashFp.flatten)(operations))))(_extends({}, initialState, state));
  };
}

function challenge(state) {
  var _state$configuration = state.configuration,
      hostUrl = _state$configuration.hostUrl,
      username = _state$configuration.username,
      accessToken = _state$configuration.accessToken;


  console.info('Challenging as ' + username + '...');

  return new Promise(function (resolve, reject) {
    _request2.default.get(hostUrl + '/webservice.php?operation=getchallenge&username=' + username, function (error, response, body) {
      error = assembleError({ response: response, error: error });
      if (error) {
        reject(error);
      } else {
        console.log("Challenge succeeded.");
        body = JSON.parse(body);
        resolve(body.result.token);
      }
    });
  }).then(function (value) {
    return _extends({}, state, { token: value });
  });
}

function login(state) {
  var _state$configuration2 = state.configuration,
      hostUrl = _state$configuration2.hostUrl,
      username = _state$configuration2.username,
      accessToken = _state$configuration2.accessToken;
  var token = state.token;


  console.info('Logging in...');

  return new Promise(function (resolve, reject) {
    _request2.default.post({
      url: hostUrl + '/webservice.php',
      form: {
        operation: 'login',
        username: username,
        accessKey: (0, _md2.default)(token + accessToken)
      }
    }, function (error, response, body) {
      error = assembleError({ response: response, error: error });
      if (error) {
        console.log(response);
        reject(error);
      } else {
        console.log("Login succeeded.");
        body = JSON.parse(body);
        resolve(body);
      }
    });
  }).then(function (result) {
    return _extends({}, state, { session: result });
  });
}

function listTypes() {
  return function (state) {
    var hostUrl = state.configuration.hostUrl;
    var sessionName = state.session.result.sessionName;


    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: hostUrl + '/webservice.php',
        form: { operation: 'listTypes', sessionName: sessionName }
      }, function (error, response, body) {
        error = assembleError({ response: response, error: error });
        if (error) {
          reject(error);
        } else {
          console.log(body);
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
}

function postElement(params) {

  return function (state) {
    var hostUrl = state.configuration.hostUrl;
    var sessionName = state.session.result.sessionName;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        elementType = _expandReferences.elementType,
        element = _expandReferences.element,
        operation = _expandReferences.operation;

    var url = hostUrl + '/webservice.php';

    console.log('Performing a(n) ' + operation + ' on ' + elementType + '.');

    var body = {
      operation: operation,
      sessionName: sessionName,
      element: element,
      elementType: elementType
    };

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        form: body
      }, function (error, response, body) {
        error = assembleError({ response: response, error: error });
        if (error) {
          reject(error);
        } else {
          console.log(body);
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
};
