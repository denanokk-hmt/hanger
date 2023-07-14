'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Create operator
 * @param {text} ns
 * @param {*} opData
 * @param {*} newData
 */
const createOperator = async (ns, uid, opData) => {
  uid = Number(uid)
  const dt = new Date();

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ds_conf.KIND.OPERATOR, uid],
  });
  
  //set data
  const data = [
    {
      name: 'system',
      value: opData.system,
    },
    {
      name: 'uid',
      value: uid,
    },
    {
      name: 'name',
      value: opData.name,
    },
    {
      name: 'full_name',
      value: opData.full_name || null,
    },
    {
      name: 'default_avatar_url',
      value: opData.default_avatar_url || null,
    },
    {
      name: 'avatar_url',
      value: opData.avatar_url || null,
    },
    {
      name: 'cdt',
      value: dt,
    },
    {
      name: 'udt',
      value: dt,
    },
  ];

  //set entity
  const entity = {
    key: key,
    data: data,
  };

  //put record
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result)
    })
      .catch(err => {
        console.log(err);
        reject(err)
      })
  });
};
module.exports.createOperator = createOperator;

/**
 * Put operator
 * @param {text} ns
 * @param {*} opData
 * @param {*} newData
 */
const putOperator = async (ns, opData, newData = {}) => {

  const dt = new Date();
  const uid = Number(opData[store.datastore.KEY].id)

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ds_conf.KIND.OPERATOR, uid],
  });

  //set data
  const data = [
    {
      name: 'system',
      value: newData.system || opData.system,
    },
    {
      name: 'uid',
      value: newData.uid || opData.uid,
    },
    {
      name: 'name',
      value: newData.name || opData.name,
    },
    {
      name: 'full_name',
      value: newData.full_name || null,
    },
    {
      name: 'default_avatar_url',
      value: newData.default_avatar_url || opData.default_avatar_url,
    },
    {
      name: 'avatar_url',
      value: newData.avatar_url || null,
    },
    {
      name: 'cdt',
      value: opData.cdt || dt,
    },
    {
      name: 'udt',
      value: dt,
    },
  ];

  //set entity
  const entity = {
    key: key,
    data: data,
  };

  //put record
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result)
    })
      .catch(err => {
        console.log(err);
        reject(err)
      })
  });
};
module.exports.putOperator = putOperator;

/**
 * Get message by mid
* @param {*} ns
 * @param {*} uid
 */
const getOperatorByUid = (ns, uid) => {
  uid = Number(uid)
  return new Promise((resolve, reject) => {
    const result = store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.OPERATOR,
      key: uid,
      customNm: false
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getOperatorByUid = getOperatorByUid;
