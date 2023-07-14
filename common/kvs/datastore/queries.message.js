'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store

/**
 * Post message
 * @param {text} ns
 * @param {text} RID 
 * @param {text} UID 
 * @param {text} mtype 
 * @param {*} talk 
 * @param {*} mtime 
 * @param {*} init_flg
 */
const postMessage = (ns, RID, UID, mtype, talk, mtime, init_flg, op_mid) => {

  const dt = new Date();
  const unixtime = dt.getTime();   //now unixtime
  
  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.MESSAGE ],
  })
  const data = [
    {
      name: 'mtime',
      value: unixtime,
    },
    {
      name: 'rid',
      value: RID,
    },
    {
      name: 'uid',
      value: UID,
    },
    {
      name: 'op_mid',
      value: op_mid,
    },
    {
      name: 'mtype',
      value: mtype,
    },
    {
      name: 'mtime',
      value: mtime,
    },
    {
      name: 'talk',
      value: talk,
      excludeFromIndexes: true,
    },
    {
      name: 'udt',
      value: new Date(),
    },
    {
      name: 'cdt',
      value: new Date(),
    },
    {
      name: 'ddt',
      value: new Date(),
    },
    {
      name: 'uflg',
      value: false,
    },
    {
      name: 'dflg',
      value: false,
    },
    {
      name: 'init_flg',
      value: init_flg,
    }
  ];

  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      console.log("RESULT",JSON.stringify(result));
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
};
module.exports.postMessage = postMessage;


/**
 * Get messages
 * @param {text} ns
 * @param {text} RID 
 * @param {int} mtime
 * @param {text} eqsign ('lt','gt','eq','le','ge') 
 * @param {int} qty
 */
const getMessages = (ns, RID, mtime, eqsign, qty, mtype=null) => {
  let sign;
  switch (eqsign) {
    case 'gt' : sign = '>'; break;
    case 'eq' : sign = '='; break;
    case 'le' : sign = '<='; break;
    case 'ge' : sign = '>='; break;
    default : sign = '<'; break;
  }
  const rid = String(RID)
  const msgid = Number(mtime)
  return new Promise((resolve, reject) => {
    //set namespace
    store.datastore.namespace = ns
    //set query
    let query = store.datastore
      .createQuery(ds_conf.KIND.MESSAGE)
      .filter('mtime', sign, msgid)
      .order('mtime', { descending: true })
      .filter('rid', '=', rid);
    if(mtype){
      query = query.filter('mtype', '=', mtype);
    }
    query = query.limit(qty);

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
module.exports.getMessages = getMessages;

/**
 * Get message by mid
* @param {*} ns
 * @param {*} mid
 */
const getMessageByMid = (ns, mid) => {
  return new Promise((resolve, reject) => {
    const result = store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.MESSAGE,
      key: mid,
      customNm: false
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getMessageByMid = getMessageByMid;

/**
 * Get message by op_mid
 */
const getMessageKeyByOpMid = (ns, op_mid) => {
  return new Promise((resolve, reject) => {

    //Set namespace
    store.datastore.namespace = ns

    //set Query
    const query = store.datastore
      .createQuery(ds_conf.KIND.MESSAGE)
      .filter('op_mid', '=', op_mid)

    //run query
    store.datastore.runQuery(query)
      .then(async results => {
        const entities = results[0];
        try {
          resolve(entities[0][store.datastore.KEY]);
        } catch {
          resolve(null)
        }
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    });
}
module.exports.getMessageKeyByOpMid = getMessageKeyByOpMid;

/**
 * Update message with new talk body.
 * @param {number} id
 * @param {*} ns
 * @param {*} talk
 * @param {*} original_msg
 */
const updateMessage = (id, ns, talk, original_msg) => {
  console.log(`Replace message: ${talk}`)

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.MESSAGE, id ],
  })
  const data = [
    {
      name: 'mtime',
      value: original_msg.mtime,
    },
    {
      name: 'rid',
      value: original_msg.rid,
    },
    {
      name: 'uid',
      value: original_msg.uid,
    },
    {
      name: 'op_mid',
      value: original_msg.op_mid,
    },
    {
      name: 'mtype',
      value: original_msg.mtype,
    },
    {
      name: 'mtime',
      value: original_msg.mtime,
    },
    {
      name: 'talk',
      value: talk,
      excludeFromIndexes: true,
    },
    {
      name: 'udt',
      value: original_msg.udt,
    },
    {
      name: 'cdt',
      value: original_msg.cdt,
    },
    {
      name: 'ddt',
      value: null,
    },
    {
      name: 'uflg',
      value: true,    // set updated flag.
    },
    {
      name: 'dflg',
      value: false,
    },
    {
      name: 'init_flg',
      value: original_msg.init_flg,
    }
  ];

  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      console.log("RESULT",JSON.stringify(result));
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
};
module.exports.updateMessage = updateMessage;

/**
 * Update message for set op_mid param.
 * @param {number} id
 * @param {*} ns
 * @param {*} op_mid
 * @param {*} original_msg
 */
const updateMessageForOpMid = (id, ns, op_mid, original_msg) => {
  console.log(`Set op_mid for message: ${id} (${op_mid})`)

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.MESSAGE, id ],
  })
  const data = [
    {
      name: 'mtime',
      value: original_msg.mtime,
    },
    {
      name: 'rid',
      value: original_msg.rid,
    },
    {
      name: 'uid',
      value: original_msg.uid,
    },
    {
      name: 'op_mid',
      value: op_mid,
    },
    {
      name: 'mtype',
      value: original_msg.mtype,
    },
    {
      name: 'mtime',
      value: original_msg.mtime,
    },
    {
      name: 'talk',
      value: original_msg.talk,
      excludeFromIndexes: true,
    },
    {
      name: 'udt',
      value: original_msg.udt,
    },
    {
      name: 'cdt',
      value: original_msg.cdt,
    },
    {
      name: 'ddt',
      value: null,
    },
    {
      name: 'uflg',
      value: false, // This is not for update. Called on creating(posting) sequence.
    },
    {
      name: 'dflg',
      value: false,
    },
    {
      name: 'init_flg',
      value: original_msg.init_flg,
    }
  ];

  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      console.log("RESULT",JSON.stringify(result));
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
};
module.exports.updateMessageForOpMid = updateMessageForOpMid

/**
 * Delete message from datastore.
 * @param {*} ns datastore's namespace
 * @param {number} id ID for key.
 */
const deleteMessage = (ns, id) => {
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.MESSAGE, id ],
  })

  return new Promise((resolve, reject) => {
    store.deleteEntity(key).then(result => {
      resolve(result)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  })
}
module.exports.deleteMessage = deleteMessage