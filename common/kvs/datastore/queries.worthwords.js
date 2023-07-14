'use strict'

const store = require('./store.js');

/**
 * Update worth words response
 * @param {*} namespace
 * @param {*} client
 * @param {*} worth_word
 * @param {JSON} talk 
 */
const insertResponse = (namespace, client, response_id, talk) => {
  
  const dt = new Date();
  const talkParse = JSON.parse(talk)

  //entity生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.RESPONSIES, response_id, ],
  })
  const data = [
    {
      name: 'client',
      value: client,
    },
    {
      name: 'worth_word',
      value: talkParse.worth_word,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'cdt',
      value: dt,
    },
    {
      name: 'talk',
      value: talk,
      excludeFromIndexes: true,
    },
  ]
  const entity = {
    key: key,
    data: data,
  }
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
}
module.exports.insertResponse = insertResponse;

/**
 * Delete respomse
 * @param {*} namespace
 * @param {*} response_id
 */
const deleteResponse = (namespace, response_id) => {

  //Key生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.RESPONSIES, response_id ],
  })

  return new Promise((resolve, reject) => {
    store.deleteEntity(key).then(result => {
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
}
module.exports.deleteResponse = deleteResponse;

/**
 * Delete respomse
 * @param {*} namespace
 * @param {*} response_id
 */
const deleteResponseByAll = (namespace) => {

  //Key生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.RESPONSIES ],
  })

  return new Promise((resolve, reject) => {
    store.deleteEntity(key).then(result => {
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
}
module.exports.deleteResponseByAll = deleteResponseByAll;

/**
 * Get worth words response
 * @param {*} namespace
 * @param {str} client
 * @param {str} worth_word
 */
const getWorthWordsResponsies = (namespace, client, worth_word) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.RESPONSIES)
      .filter('client', '=', client)
      .filter('worth_word', '=', worth_word)
      .limit(100);

    //run query
    store.datastore.runQuery(query)
      .then(results => {
        const entities = results[0];
        resolve(entities);
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    });
}
module.exports.getWorthWordsResponsies = getWorthWordsResponsies;