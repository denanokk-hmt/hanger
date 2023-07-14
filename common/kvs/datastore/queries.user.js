'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


//////////////////////////////////////////////////////
// Create
//////////////////////////////////////////////////////

/**
 * UID cerate
 * @param {*} ns
 * @param {int} ID
 * @param {text} oksky_id
 * @returns {int} UID
 */
const createUserUID = (ns, ID, oksky_id) => {

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.USER_UID, ID, ],
  });
  const data = {
      cdt: new Date(),
      udt: new Date(),
      dflg: false,
      oksky_id: oksky_id
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
module.exports.createUserUID = createUserUID;

/**
* UserUser cerate
* @param {*} ns
* @param {int} UID
* @param {*} udata
* @returns {int} UserUser
*/
const createUserUser = (ns, UID, udata) => {

  //entity生成
  const key = store.datastore.key({
    namespace : ns,
    path: [
        ds_conf.KIND.USER_UID,
        UID,
        ds_conf.KIND.USER_USER,
        UID,
    ],
  });
  const data = {
      id : udata.id,
      fname: udata.fname,
      lname: udata.lname,
      nname: udata.nname,
      cdt: new Date(),
      udt: new Date(),
      uflg: false,
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
module.exports.createUserUser = createUserUser;

/**
* UserRoom create
* @param {*} ns
* @param {*} RID 
* @param {*} UID 
* @param {*} rdata
* @returns {*} UserRoom 
*/
const createUserRoom = (ns, RID, UID, rdata) => {

  //entity生成
  const key = store.datastore.key({
    namespace : ns,
    path: [
        ds_conf.KIND.USER_UID,
        UID,
        ds_conf.KIND.USER_ROOM,
        RID,
    ],
  });
  const data = {
      room_name: rdata.room_name,
      cdt: new Date(),
      udt: new Date(),
      uflg: false,
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
module.exports.createUserRoom = createUserRoom;

/**
* User Response context create
* @param {*} ns
* @param {*} RID 
* @param {*} UID
* @returns {*} RID
*/
const createUserResContext = (ns, RID, UID) => {

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [
      ds_conf.KIND.USER_UID,
      UID,
      ds_conf.KIND.USER_RESCONTXT,
      RID,
    ],
  });
  const data = [
    {
      name: 'response_context',
      value: JSON.stringify({ response_context : '' }),
      excludeFromIndexes: true,
    },
    {
      name: 'cdt',
      value: new Date(),
    },
    {
      name: 'udt',
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
      name: 'init_interval',
      value: (new Date).getTime(),
      excludeFromIndexes: true,
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
module.exports.createUserResContext = createUserResContext;


//////////////////////////////////////////////////////
// PUT
//////////////////////////////////////////////////////

/**
 * User Response context update
 * @param {*} ns
 * @param {*} RID 
 * @param {*} UID   
 * @param {*} res_context 
 * @param {*} mtime 
 * @param {*} init_interval
 */
const putUserResContext = async (ns, RID, UID, res_context, mtime, init_interval) => {
  
  //serch existing entity
  const results = await store.getByAncestorKey(
    ns,
    ds_conf.KIND.USER_UID, 
    UID,
    ds_conf.KIND.USER_RESCONTXT
  );
  const cdt = (Array.isArray(results) && results.length)? results[0].cdt : new Date();

  //create update entity
  const key = store.datastore.key({
    namespace: ns,
    path: [
      ds_conf.KIND.USER_UID,
      UID,
      ds_conf.KIND.USER_RESCONTXT,
      RID,
    ],
  });
  const data = [
    {
      name: 'response_context',
      value: res_context,
      excludeFromIndexes: true,
    },
    {
      name: 'mtime',
      value: mtime,
    },
    {
      name: 'cdt',
      value: cdt,
    },
    {
      name: 'udt',
      value: new Date(),
    },
    {
      name: 'uflg',
      value: true,
    },
    {
      name: 'init_interval',
      value: init_interval,
      excludeFromIndexes: true,
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
module.exports.putUserResContext = putUserResContext;

/**
 * Put User Status
 * APP-668より、UserStatusからUserStatusPropsへ移行
 * 祖先キーを利用しない＝グループから外した
 * アプリ側の改修をせず改修範囲少なくさせる為、引数や呼び出し関数名はそのまま
 * @param {string} ns
 * @param {*} RID 
 * @param {*} UID
 * @param {object} status
 */
 const putUserStatusProps = async (ns, RID, UID, props={}) => {
  //transaction start
  const tran = store.datastore.transaction();
  try{
    await tran.run();

    //Set key
    const key = tran.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.USER_STATUS_PROPS,
        UID,
      ],
    });
  
    //keep session
    const [currentStatus] = await tran.get(key);
    if (!currentStatus) {
      console.log('user status not found.');
    }
    //現在値を指定値で上書き
    const status = {
      ...currentStatus,
      ...props,
    };
  
    //Set properties
    const dt = new Date();
  
    const data = [
      // 固定項目 ※常に既存の値を設定、新規の場合は引数の値を設定（udtのみ毎回更新）
      {
        name: 'uid',
        value: currentStatus?.uid || UID,
      },
      {
        name: 'rid',
        value: currentStatus?.rid || RID,
      },
      {
        name: 'cdt',
        value: currentStatus?.cdt || dt,
      },
      {
        name: 'udt',
        value: dt,
      },
  
      // 追加項目　※propで指定された場合のみ上書き、未指定の場合は既存の値を設定（新規、追加時に未指定の場合はnullを設定）
      {
        name: 'mark_read_op',
        value: status.hasOwnProperty('mark_read_op')  ? (Number(status.mark_read_op) || null) : null,
      },
      {
        name: 'mark_read_bot',
        value: status.hasOwnProperty('mark_read_bot') ? (Number(status.mark_read_bot) || null) : null,
      },
      {
        name: 'signin_flg',
        value: status.hasOwnProperty('signin_flg') ? (Boolean(status.signin_flg) || null) : null,
      },
      {
        name: 'init_interval_rbfaq',
        value: status.hasOwnProperty('init_interval_rbfaq') ? (Number(status.init_interval_rbfaq) || null) : null,
        excludeFromIndexes: true,
      },
      {
        name: 'init_interval_mc',
        value: status.hasOwnProperty('init_interval_mc') ? (Number(status.init_interval_mc) || null) : null,
        excludeFromIndexes: true,
      },
    ];
    const entity = {
      key: key,
      data: data,
    };
  
    //put entity
    tran.save(entity);
    await tran.commit();

    return entity;
  }
  catch (err) {
    await tran.rollback();
    throw err;
  }
};
module.exports.putUserStatus = putUserStatusProps;

//////////////////////////////////////////////////////
// Getter
//////////////////////////////////////////////////////

/**
 * Get User UID
 * @param {*} ns
 * @param {*} UID
 * @param {*} oksky_id
 */
const getUserUID = (ns, UID, oksky_id) => {
  return new Promise((resolve, reject) => {
    let query;
    if(UID){
      const result = store.getEntityByKey({
        ns,
        kind: ds_conf.KIND.USER_UID,
        key: UID,
        customNm: true
      })
        .catch(err => {
          console.log(err)
          reject(err)
        })
      resolve(result)

    } else if(oksky_id){

      query = store.datastore
        .createQuery(ds_conf.KIND.USER_UID)
        .filter('oksky_id', '=', oksky_id)
        .limit(1);

      store.datastore.runQuery(query)
        .then(results => {
          const entities = results[0];
          resolve(entities);
        }).catch(err => {
        console.log(err);
        reject(err)
      })
    }

  });
}
module.exports.getUserUID = getUserUID;

/**
 * Get User entiry
 * @param {*} UID 
 * @param {*} ckind
 * @param {*} ns
 */
const getUserEntity = (ns, UID, ckind) => {
  return new Promise((resolve, reject) => {
    const result = store.getByAncestorKey(
      ns,
      ds_conf.KIND.USER_UID,
      UID,
      ckind
    )
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getUserEntity = getUserEntity;

/**
 * Get User Room
 * @param {*} ns
 * @param {*} UID
 */
const getUserRoom = (ns, UID) => {
  return new Promise((resolve, reject) => {
    const result = store.getByAncestorKey(
      ns,
      ds_conf.KIND.USER_UID,
      UID,
      ds_conf.KIND.USER_ROOM
    )
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getUserRoom = getUserRoom;

/**
 * User Response context create
 * @param {*} ns
 * @param {*} UID
 */
const getUserResContext = (ns, UID) => {
  return new Promise((resolve, reject) => {
    const result = store.getByAncestorKey(
      ns,
      ds_conf.KIND.USER_UID,
      UID,
      ds_conf.KIND.USER_RESCONTXT
    )
    .catch(err => {
      console.log(err)
      reject(err)
    })
    resolve(result)
  });
}
module.exports.getUserResContext = getUserResContext;

/**
 * get User Status props
 * APP-668より、UserStatusからUserStatusPropsへ移行
 * 祖先キーを利用しない＝グループから外した
 * アプリ側の改修をせず改修範囲少なくさせる為、引数や呼び出し関数名はそのまま
 * @param {*} ns
 * @param {*} UID
 */
 const getUserStatusProps = (ns, UID) => {
  return new Promise((resolve, reject) => {
    store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.USER_STATUS_PROPS,
      key: UID,
      customNm: true
    })
    .then(result => {
      resolve(result || [])
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  });
}
module.exports.getUserStatus = getUserStatusProps;