'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Update respomse
 * @param {*} namespace
 * @param {*} client
 * @param {*} response_id
 * @param {JSON} talk 
 */
const insertResponse = (namespace, client, response_id, talk, batch_id = null) => {
  
  const dt = new Date();

  //entity生成
  const key = store.datastore.key({
    namespace: namespace,
    path: [ ds_conf.KIND.RESPONSIES, response_id ],
  })
  const data = [
    {
      name: 'client',
      value: client,
    },
    {
      name: 'response_id',
      value: response_id,
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
    {
      name: 'batch_id',
      value: batch_id,
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
 * Delete response by comparing old to new batch_id 
 * @param {*} namespace
 * @param {*} batch_id
 */
const deleteResponseByBatchId = async (namespace, batch_id) => {

  //Set namespace
  store.datastore.namespace = namespace

  //Set a keys-only projection query
  const query = store.datastore
  .createQuery(ds_conf.KIND.RESPONSIES)
  .select('__key__')
  .filter('batch_id', '<', batch_id);

  //run query and store the keys
  const keys = await store.datastore.runQuery(query);

  //parse keys and store into array for deletion
  const parsed_keys = keys[0].map(key => key[store.datastore.KEY])

  //DS has a max write limit of 500, but it's better to not do close to the max because it can fail sometimes
  const max_delete_size = 250;

  //Delete in chunks of 250 by looping and slicing the array of keys with keys.slice(i, i + max_delete_size)
  let result = [];
  for(let i=0; i < parsed_keys.length; i += max_delete_size) {
    const delete_res = new Promise((resolve, reject) => {
      store.deleteEntity(parsed_keys.slice(i, i + max_delete_size)).then(result => {
        resolve(result)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    });
    result.push(delete_res)
  }

  return result;
}
module.exports.deleteResponseByBatchId = deleteResponseByBatchId;

/**
* Delete response
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
 * Delete responses in batch using keys
 * @param {*} keys
 */
const deleteResponseBatch = (keys) => {
  return new Promise((resolve, reject) => {
    store.deleteEntity(keys).then(result => {
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
}
module.exports.deleteResponseBatch = deleteResponseBatch;

/**
 * Get responsies
 * @param {*} namespace
 * @param {int} client
 */
const getResponsies = (namespace, client) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.RESPONSIES)
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
module.exports.getResponsies = getResponsies;

/**
 * Get responsies by all
 * @param {*} namespace
 * @param {int} client
 */
const getResponsiesByAll = (namespace, client) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.RESPONSIES)
      .filter('client', '=', client);

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
module.exports.getResponsiesByAll = getResponsiesByAll;

/**
* Get response
 * @param {*} namespace
 * @param {int} client
 */
const getResponse = (namespace, client, response_id) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = namespace

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.RESPONSIES)
      .filter('client', '=', client)
      .filter('response_id', '=', response_id)
      .limit(1);

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
module.exports.getResponse = getResponse;
