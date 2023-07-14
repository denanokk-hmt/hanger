'use strict'

//config
const conf = require(REQUIRE_PATH.configure);

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Update answer
 * @param {*} namespace
 * @param {*} client
 * @param {*} answer_id
 * @param {JSON} credentials 
 */
const insertAnswer = (namespace, client, answer_id, credentials, config, default_messages) => {
  
  const dt = new Date();

  //entity生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.ANSWERS, answer_id ],
  })
  const data = [
    {
      name: 'client',
      value: client,
    },
    {
      name: 'answer_id',
      value: answer_id,
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
      name: 'credentials',
      value: credentials,
      excludeFromIndexes: true,
    },
    {
      name: 'config',
      value: config,
      excludeFromIndexes: true,
    },
    {
      name: 'default_messages',
      value: default_messages,
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
module.exports.insertAnswer = insertAnswer;

/**
 * Delete answer
 * @param {*} namespace
 * @param {*} answer_id
 */
const deleteAnswer = (namespace, answer_id) => {

  //Key生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.ANSWERS, answer_id ],
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
module.exports.deleteAnswer = deleteAnswer;

/**
 * Get answers
 * @param {*} namespace
 * @param {int} client
 */
const getAnswers = (namespace, client) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.ANSWERS)
      .filter('client', '=', client)
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
module.exports.getAnswers = getAnswers;

/**
 * Get default messages in answers
 * @param {int} client
 */
const getDefaultMessages = async (client) => {

    //for local debugging = if you could not use datastore on local.
    //if (!process.env.HOSTNAME && !process.env.NODE_ENV) return conf.default_messages[client]

    //Set namespace
    const namespace = `${conf.env.kvs.service}-Asker-${client}-${conf.env.environment}`

    //Get Default messages
    return await getAnswers(namespace, client) //Get answers
    .then(results => {
      const messages = JSON.parse(results[0].default_messages)
      let arry = {}
      for (let idx in messages) {
        arry[messages[idx][0]] = messages[idx][1]
      }
      return arry
    })
    .catch(err =>{
      console.error(JSON.stringify(err))
      return conf.default_messages[conf.server_code]
    })
  
}
module.exports.getDefaultMessages = getDefaultMessages;