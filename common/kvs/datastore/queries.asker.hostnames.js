'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Insert hostname
 * @param {*} namespace
 * @param {*} client
 * @param {*} hostname
 * @param {*} commit_id
 * @param {*} update=false
 */
 const insertHostname = (namespace, client, hostname, commit_id, update=false) => {
  
  const dt = new Date();

  //entity生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.ASKER_HOSTNAMES, hostname ],
  })
  const data = [
    {
      name: 'hostname',
      value: hostname,
    },
    {
      name: 'client',
      value: client,
    },
    {
      name: 'commit_id',
      value: commit_id,
    },
    {
      name: 'update',
      value: update,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'cdt',
      value: dt,
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
module.exports.insert = insertHostname;

/**
 * Update Asker hostname update flg
 * @param {*} namespace
 * @param {*} client
 * @param {*} hostname
 * @param {*} commit_id
 * @param {*} update=false
 */
const putHostnamesUpdate = async (namespace, client, hostname, commit_id, update=true) => {

  const dt = new Date();

  //entity生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.ASKER_HOSTNAMES, hostname ],
  })
  const data = [
    {
      name: 'hostname',
      value: hostname,
    },
    {
      name: 'client',
      value: client,
    },
    {
      name: 'commit_id',
      value: commit_id,
    },
    {
      name: 'update',
      value: update,
    },
    {
      name: 'udt',
      value: dt,
    },
  ]
  const entity = {
    key: key,
    data: data,
  }
  //put entity
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
module.exports.put = putHostnamesUpdate;

/**
 * Delete hostname
 * @param {*} namespace
 * @param {*} hostname
 */
 const deletHostname = (namespace, hostname) => {

  //Key生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.ASKER_HOSTNAMES, hostname ],
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
module.exports.delete = deletHostname;

/**
 * Get hostnames
 * @param {*} namespace
 * @param {int} client
 */
const getHostnames = (namespace, client) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.ASKER_HOSTNAMES)
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
module.exports.get = getHostnames;