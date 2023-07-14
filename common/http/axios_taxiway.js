'use strict';

const axios = require('axios');
const qs = require('qs');

//Operator config
const conf = require(REQUIRE_PATH.configure);
const api_conn = conf.api_conn.operator_client

//okskyのoperator_system_configをclient毎に保存しexport
api_conn.operator_client = {}
for (let idx in api_conn) {
  if (api_conn[idx]?.system_name != 'oksky') continue
  const taxiway = api_conn[idx].operator_system_config?.taxiway
  api_conn.operator_client[api_conn[idx].client] = {
    system_config : api_conn[idx].operator_system_config,
    axios_type : (api_conn[idx].operator_system_config.taxiway)? 'axios_taxiway' : 'axios_normal',
    system_name : api_conn[idx].system_name,
    get_url : (taxiway)? `${taxiway?.domain}${taxiway?.get_path}` : null,
    post_url : (taxiway)? `${taxiway?.domain}${taxiway?.post_path}` : null,
  }
}

/**
 * Taxiway利用を行うための、url, params, headerの入れ替えを行う
 * @param {text} method
 * @param {text} url 
 * @param {object} params 
 * @param {object} headers 
 * @returns 
 */
function convertTaxiwayRequest({method, url, params, headers=null, options=null}) {
  try {
    const buffer = params
    params = {}
    params = {
      version : conf.version,
      token : conf.conf_keel.token,
      client : buffer.client,
      endpoint_headers : headers,
      endpoint_system : buffer.system_name,
      endpoint_url : url,
      endpoint_params : buffer || null,
      endpoint_options : options || null,
    }
    
    url = api_conn.operator_client[params.client][`${method}_url`]
    //url = `http://localhost:8085/hmt/${method}/request`

  } catch(err) {
    throw err
  }

  return {
    headers : null,
    options : null,
    url,
    params,
  }
}

/**
 * Get method http request with additional Headers
 * Need response return status_code, answer(contents of response)
 * @param {text} url
 * @param {object} params
 * @param {Object} headers
 * @param {func} callback -->no func, return response data
 */
const getRequestWithHeaders = async (url, params, headers, callback) => {

  //Taxiway利用を行うための、url, params, headerの入れ替えを行う
  const taxiway = convertTaxiwayRequest({method: 'get', url, params, headers})

  return await axios({
    url: taxiway.url,
    params : taxiway.params,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
      ...taxiway.headers
    }
  }).then(response => {
    //taxiwayからは、常にdataに包まれてreponseされてくる
    return (callback)? callback(response.data) : response.data
  }).catch(err => {
    throw err
  })
};

/**
 * POST or PUT request with additional Headers
 * @param {text} method --> POST ot PUT
 * @param {string} url
 * @param {string|Object} params
 * @param {Object} headers
 * @param {func} callback -->no func, return response data 
 */
const postRequestWithHeaders = async (method, url, params, headers, callback) => {

  //Taxiway利用を行うための、url, params, headerの入れ替えを行う
  const taxiway = convertTaxiwayRequest({method: 'post', url, params, headers})

  return await axios({
    method: method,
    url: taxiway.url,
    headers: {
      "Accept": "application/json",
      'Content-Type': 'application/json',
      ...taxiway.headers
    },
    data: taxiway.params,
  }).then(response => {
    //taxiwayからは、常にdataに包まれてreponseされてくる
    return (callback)? callback(response.data) : response.data
  }).catch(err => {
    console.log(JSON.stringify(err))
    throw err
  })
}

module.exports = {
  operator_client: api_conn.operator_client,
  getRequestWithHeaders,
  postRequestWithHeaders,
}