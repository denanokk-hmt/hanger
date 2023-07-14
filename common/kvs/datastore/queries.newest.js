'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


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