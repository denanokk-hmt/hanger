'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Room create
 * @param {*} ns
 * @returns {int} RID 
 */
const createRoom = ns => {

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ds_conf.KIND.ROOM],
  });
  const data = {
    room_name: '',
    cdt: new Date(),
    udt: new Date(),
    dflg: false,
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
module.exports.createRoom = createRoom;

/**
 * Room delete
 * @param {*} ns
 * @param {*} rid
 * @returns {int} RID 
 */
const deleteRoom = async (ns, rid) => {

  console.log(`=========DELETE ROOM ENTITY:${rid}`)

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ds_conf.KIND.ROOM, Number(rid)],
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
module.exports.deleteRoom = deleteRoom;









