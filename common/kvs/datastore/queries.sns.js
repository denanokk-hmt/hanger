'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * get User SNS
 * @param {*} ns
 * @param {*} UID
 */
const getUserSNS = (ns, UID) => {
  return new Promise((resolve, reject) => {
    const result = store.getByAncestorKey(
      ns,
      ds_conf.KIND.USER_UID,
      UID,
      ds_conf.KIND.USER_SNS
    )
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getUserSNS = getUserSNS;