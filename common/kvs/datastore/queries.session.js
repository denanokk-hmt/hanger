'use strict'

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//Datastore
const ds = require('./config_boarding')
const store = ds.store


/**
* Create seed
* @param {*} ns
* @param {*} token
* @param {*} seed 
*/
const createSeed = async (ns, token, seed) => {

  console.log("=========CREATE SEED ENTITY")
  const tran = store.datastore.transaction()
  await tran.run()
  
  //entity生成
  const key = tran.datastore.key({
    namespace: ns,
    path: [ ds.KIND.SEED, token ],
  });
  const [search] = await tran.get(key)
  const dt = new Date();
  const data = {
    seed: seed,
    cdt: dt,
    udt: dt,
    dflg: null,
  }
  const entity = {
    key: key,
    data: data,
  }
  return new Promise((resolve, reject) => {
    if (search) {
      console.log("===========SEED ROLLBACK")
      tran.rollback()
      resolve({
        type : "QRY",
        status_code : code.WAR_ALREADY_EXIST_103,
        status_msg : status.WAR_ALREADY_EXIST_103,
        seed : search,
      })
    } else {
      store.putEntity(entity, tran).then(result => {
        console.log("===========SEED COMMIT")
        tran.commit()  
        resolve(result)
      })
      .catch(err => {
        console.log(err)
        tran.rollback()
        reject(err)
      })
    }  
  });
}
module.exports.createSeed = createSeed;

/**
* Create session
* @param {*} ns
* @param {*} token
* @param {int} rid
* @param {int} uid 
* @param {int} addProp{}
* @returns {*} token 
*/
const createSession = async (ns, token, rid, uid, addProp={}) => {

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds.KIND.SESSION, token ],
  });
  const dt = new Date();
  const data = [
    // ***** GENGERAL *****
    {
      name: 'rid',
      value: rid,
    },
    {
      name: 'uid',
      value: uid,
    },
    {
      name: 'cdt',
      value: dt,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'dflg',
      value: null,
    },
    {
      name: 'uut',
      value: dt.getTime(),
      excludeFromIndexes: true,
    },
    // ***** OP OKSKY (and OP Shared) *****
    {
      name: 'op_system',
      value: addProp.op_system || null,
    },
    {
      name: 'op_access_token',
      value: (addProp.op_access_token)? String(addProp.op_access_token) : null,
    },
    {
      name: 'op_rid',
      value: (addProp.op_rid)? String(addProp.op_rid) : null,
    },
    {
      name: 'op_cust_uid',
      value: (addProp.op_cust_uid)? String(addProp.op_cust_uid) : null,
    },
    {
      name: 'op_ope_uid',
      value: (addProp.op_ope_uid)? String(addProp.op_ope_uid) : null,
    },
    {
      name: 'op_session',
      value: (addProp.op_session)? String(addProp.op_session) : null,
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
      reject(err)
    })
  });
}
module.exports.createSession = createSession;

/**
* Update seed
* @param {*} ns
* @param {*} token
* @param {*} seed 
* @param {*} old_seed 
* @param {*} dflg 
*/
const updateSeed = async (ns, token, seed, old_seed, dflg) => {

  console.log("=========UPDATE SEED ENTITY")

  const tran = store.datastore.transaction()
  await tran.run()

  //Entity set for update
  const key = tran.datastore.key({
    namespace: ns,
    path: [ ds.KIND.SEED, token, ]
  });
  const [seeds] = await tran.get(key)
  const dt = new Date();
  const data = {
    seed: seed,
    cdt: seeds.cdt,
    udt: dt,
    dflg: (dflg)? dt : null,
  }
  const entity = {
    key: key,
    data: data,
  }
  return new Promise((resolve, reject) => {
    if (seeds.seed != old_seed) {
      console.log("===========SEED ROLLBACK")
      tran.rollback()
      resolve({
        type : "QRY",
        status_code : code.WAR_ALREADY_EXIST_103,
        status_msg : status.WAR_ALREADY_EXIST_103,
        seed : seeds,
      })
    } else {
      store.putEntity(entity, tran).then(result => {
        console.log("===========SEED COMMIT")
        tran.commit()  
        resolve(result)
      })
      .catch(err => {
        console.log(err)
        tran.rollback()
        reject(err)
      })
    }
  });
}
module.exports.updateSeed = updateSeed;

/**
 * Put session
 * @param {string} ns
 * @param {object} session
 * @param {object} addProp
 * @param {string} dflg (Boarding=null)
 */
 const putSession = async ({ns, session, addProp, dflg}) => {

  console.log("=======addProp in putSession", JSON.stringify(addProp))

  //transaction start
  const tran = store.datastore.transaction()
  await tran.run()

  //Set key
  const key = tran.datastore.key({
    namespace: ns,
    path: [ds.KIND.SESSION, session[store.datastore.KEY].name],
  });

  //keep session
  const [search] = await tran.get(key)
  if (!search) {
    await tran.rollback()
    throw Error('session not found.', JSON.stringify(key))
  }

  //Set properties
  const dt = new Date();
  const data = [
    {
      name: 'rid',
      value: session.rid,
    },
    {
      name: 'uid',
      value: session.uid,
    },
    {
      name: 'cdt',
      value: session.cdt,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'dflg',
      value: (dflg)? dt : null,
    },
    {
      name: 'uut',
      value: dt.getTime(),
      excludeFromIndexes: true,
    },
    {
      name: 'op_system',
      value: addProp?.op_system || null,
    },
    {
      name: 'op_access_token',
      value: (addProp?.op_access_token)? String(addProp.op_access_token) : null,
    },
    {
      name: 'op_rid',
      value: (addProp?.op_rid)? String(addProp.op_rid) : null,
    },
    {
      name: 'op_cust_uid',
      value: (addProp?.op_cust_uid)? String(addProp.op_cust_uid) : null,
    },
    {
      name: 'op_ope_uid',
      value: (addProp?.op_ope_uid)? String(addProp.op_ope_uid) : null,
    },
    {
      name: 'op_session',
      value: (addProp?.op_session)? String(addProp.op_session) : null,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  console.log("=======make entiry in putSession", JSON.stringify(entity))

  //put entity
  return await store.putEntity(entity, tran).then(result => {
    tran.commit()
    return result
  })
  .catch(err => {
    tran.rollback()
    throw err
  })
};
module.exports.putSession = putSession;

/**
 * Get User UID
* @param {*} ns
 * @param {*} session_id
 */
const getBySessionId = (ns, session_id) => {
  return new Promise((resolve, reject) => {
    const result = store.getEntityByKey({
      ns,
      kind: ds.KIND.SESSION,
      key: session_id,
      customNm: true
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getBySessionId = getBySessionId;

/**
 * Get session by fileter
 * @param {text} ns
 * @param {text} filtername
 * @param {*} filtervalue
 * @param {bool} str
 */
const getByFilter = (ns, filtername, filtervalue, str=false) => {

  if (str) {
    filtervalue = String(filtervalue)
  } else {
    filtervalue = Number(filtervalue)
  }
  
  return new Promise((resolve, reject) => {
    //set namespace
    store.datastore.namespace = ns
    //set query
    const query = store.datastore
      .createQuery(ds.KIND.SESSION)
      .filter(filtername, '=', filtervalue)
      .filter('dflg', '=', null)
      //.order('udt', { descending: true })
      .limit(1);
    //run query
    store.datastore.runQuery(query)
      .then(results => {
        let entities = results[0];
        if (entities[0]) {
          entities[0]['key_name'] = entities[0][store.datastore.KEY].name
        }
        resolve(entities);
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    });
}
module.exports.getByFilter = getByFilter;


/**
 * Get session with read transaction
 * @param {text} ns
 * @param {text} token --> this session's dflg is null
 */
const getSessionWithReadTran = async (ns, token) => {
  try {
    //Read only transaction start
    const tran = store.datastore.transaction({readOnly: true});
    await tran.run()

    store.datastore.namespace = ns
    const kind = ds.KIND.SESSION
    const sessionKey = store.datastore.key([kind, token])

    //session check
    let [session] = await tran.get(sessionKey);
    if (!session) {
      await tran.rollback();
      return
    } else {
      await tran.commit();
      let result = []
      result.push({
        ...session,
        key_name : session[store.datastore.KEY].name
      })
      return result
    }

  } catch {
    throw new Error(err)
  }
}
module.exports.getSessionWithReadTran = getSessionWithReadTran;