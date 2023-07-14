'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


////////////////////////////////////////////////////////////
// Common
////////////////////////////////////////////////////////////

/**
 * Issue ID 
 * @returns {*} ID
 */
const createID = (ns) => {
  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.ID ],
  });
  const data = {
      cdt: new Date()
  }
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
module.exports.createID = createID;

/**
 * Delete ID
 * @returns {int} ns
 * @returns {int} UID 
 */
const deleteID = async (ns, uid) => {
  console.log(`=========DELETE ID ENTITY:${uid}`)

  //entity生成
  const key = store.datastore.key({
      namespace: ns,
      path: [ ds_conf.KIND.ID, Number(uid) ],
  });
  
  return new Promise(async (resolve, reject) => {
    const [search] = await store.datastore.get(key)
    if (search) {
      store.datastore.delete(key).then(result => {
        resolve(result)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    } else {
        resolve(search)
    }
  });
}
module.exports.deleteID = deleteID;










