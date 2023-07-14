'use strict';

const axios = require('axios');
const qs = require('qs');


/**
 * Get method http request 
 * Need response return status_code, answer(contents of response)
 * @param {text} url
 * @param {object} params
 * @param {func} callback -->no func, return response data 
 */
const getRequest = async (url, params, callback) => {
  return await axios({
    url: url, 
    params,
    headers: { 'Content-Type': 'Accept: application/json',}
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    throw err
  })
};

/**
 * Get method http request with additional Headers
 * Need response return status_code, answer(contents of response)
 * @param {text} url
 * @param {object} params
 * @param {Object} headers
 * @param {func} callback -->no func, return response data
 */
const getRequestWithHeaders = async (url, params, headers, callback) => {
  return await axios({
    url: url,
    params,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
      ...headers
    }
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    throw err
  })
};

/**
 * Get method http request with parameter serializer
 * Need response return status_code, answer(contents of response)
 * @param {text} url
 * @param {object} params
 * @param {func} callback -->no func, return response data 
 */
const getRequestSLZ = async (url, params, callback) => {
  return await axios({
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json',},
    url: url,
    params,
    paramsSerializer: function (params) {
      return qs.stringify(params, {arrayFormat: 'indices'})
    },  
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    throw err
  })
};

/**
 * POST or PUT request with JSON body or URL String.
 * @param {text} method --> POST ot PUT
 * @param {text} url
 * @param {object} params
 * @param {func} callback -->no func, return response data 
 */
const postRequest = async (method, url, params, callback) => {
  return await axios({
    method: method,
    url: url,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
    },
    data: params,
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    console.log(JSON.stringify(err))
    throw err
  })
}

/**
 * POST or PUT request with JSON body or URL String.
 * @param {string} url
 * @param {string|Object} data
 * @param {string|Object} options
 */
const postRequestWithOptions = async (method, url, data, options, callback) => {
  return await axios({
    method: method,
    url: url,
    data: data,
    params: options?.qs || {},
    headers: options?.headers || {},
  }).then(response => {
    callback(response)
  }).catch(err => {
    console.log(JSON.stringify(err))
    throw new Error(err)
  })
}

/**
 * POST or PUT request with additional Headers
 * @param {text} method --> POST ot PUT
 * @param {string} url
 * @param {string|Object} params
 * @param {Object} headers
 * @param {func} callback -->no func, return response data 
 */
const postRequestWithHeaders = async (method, url, params, headers, callback) => {
  return await axios({
    method: method,
    url: url,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
      ...headers
    },
    data: params,
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    console.log(JSON.stringify(err))
    throw err
  })
}

/**
 * DEELTE request with JSON body or URL String.
 * @param {text} url
 * @param {object} params
 * @param {func} callback -->no func, return response data 
 */
const deleteRequest = async (url, params, callback) => {
  return await axios({
    method: 'delete',
    url: url,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
    },
    data: params,
  }).then(response => {
    return (callback)? callback(response) : response
  }).catch(err => {
    console.log(JSON.stringify(err))
    throw err
  })
}

module.exports = {
  getRequest,
  getRequestWithHeaders,
  getRequestSLZ,
  postRequest,
  postRequestWithOptions,
  postRequestWithHeaders,
  deleteRequest,
}
