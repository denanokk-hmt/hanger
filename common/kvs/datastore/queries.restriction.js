'use strict'

//Datastore
const ds_conf = require('./config_boarding');
const store = ds_conf.store


/**
 * Get entity by yyyymm
 * @param {string} ns 
 * @param {string} date yyyy-mm
 * @param {string} kind
 */
const getByDate = (ns, date, kind) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = ns

    //set Query
    const query = store.datastore
      .createQuery(kind)
      .filter('yyyymm', '=', date)

    //run query
    store.datastore.runQuery(query)
      .then(async results => {
        const entities = results[0];
        resolve(entities);
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    });
}

/**
 * Get entity by yyyymm for DAU.
 * @param {string} ns
 * @param {string} date yyyymm
 */
const getByDauDate = (ns, date) => {
  return getByDate(ns, date, ds_conf.KIND.DAUSTATUS)
}
module.exports.getByDauDate = getByDauDate

/**
 * Get entity by yyyymm for MAU.
 * @param {string} ns
 * @param {string} date yyyymm
 */
const getByMauDate = (ns, date) => {
  return getByDate(ns, date, ds_conf.KIND.MAUSTATUS)
}
module.exports.getByMauDate = getByMauDate