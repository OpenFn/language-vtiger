import { execute as commonExecute, expandReferences } from 'language-common';
import request from 'request';
import md5 from 'md5';
// var md5 = require('md5');
import { resolve as resolveUrl } from 'url';
import { curry, mapValues, flatten } from 'lodash-fp';

function assembleError({ response, error }) {
  if (response && ([200,201,202,204].indexOf(response.statusCode) > -1)) return false;
  if (error) return error;
  return new Error(`Server responded with ${response.statusCode}`)
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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  // return state => {
  //   return commonExecute(...operations)({ ...initialState, ...state })
  // };

  return state => {
    return commonExecute(
      challenge,
      login,
      ...flatten(operations)
    )({ ...initialState, ...state })

  };

}

function challenge(state) {

  const {hostUrl, username, accessToken} = state.configuration

  console.info(`Challenging as ${username}...`);

  return new Promise((resolve, reject) => {
    request.get (`${hostUrl}/webservice.php?operation=getchallenge&username=${username}`,
      function(error, response, body){
      error = assembleError({response, error})
      if(error) {
        reject(error);
      } else {
        console.log("Challenge succeeded.");
        body = JSON.parse(body)
        resolve(body.result.token);
      }
    })
  })
  .then((value) => {
    return { ...state, token: value }
  })

}

export function login(state) {

  const {hostUrl, username, accessToken} = state.configuration;

  const { token } = state;

  console.info(`Logging in...`)

  return new Promise((resolve, reject) => {
    request.post ({
      url: `${hostUrl}/webservice.php`,
      form: {
        operation: 'login',
        username: username,
        accessKey: md5(token + accessToken)
      }
    }, function(error, response, body){
      error = assembleError({response, error})
      if(error) {
        console.log(response)
        reject(error);
      } else {
        console.log("Login succeeded.");
        body = JSON.parse(body)
        resolve(body);
      }
    })
  })
  .then((result) => {
    return { ...state, session: result }
  })

}

export function listTypes() {
  return state => {

    const { hostUrl } = state.configuration;
    const { sessionName } = state.session.result;

    return new Promise((resolve, reject) => {
      request.post ({
        url: `${hostUrl}/webservice.php`,
        form: { operation: 'listTypes', sessionName }
      }, function(error, response, body){
        error = assembleError({response, error})
        if(error) {
          reject(error);
        } else {
          console.log(body)
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  }
}

export function postElement(params) {

  return state => {

    const { hostUrl } = state.configuration;
    const { sessionName } = state.session.result;

    const { elementType, element, operation } = expandReferences(params)(state);

    const url = `${hostUrl}/webservice.php`;

    console.log(`Performing a(n) ${operation} on ${elementType}.`);

    const body = {
      operation,
      sessionName,
      element,
      elementType
    }

    return new Promise((resolve, reject) => {
      request.post ({
        url: url,
        form: body
      }, function(error, response, body){
        error = assembleError({response, error})
        if(error) {
          reject(error);
        } else {
          console.log(body)
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  };

};

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
