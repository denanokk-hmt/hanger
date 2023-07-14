'use strict'

//Datastore
const ds = require('./config_staffs')
const store = ds.store

/**
* Create Staff
* @param {string} ns
* @param {*} props

*/
const createStaff = async ({ns, props}) => {

  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds.KIND.STAFFS, ],
  });
  const dt = new Date();
  const data = [
    {
      name: 'email',
      value: props.email,
    },    
    {
      name: 'token',
      value: props.token,
    },
    {
      name: 'fb_uid',
      value: props.fb_uid || null,
    },
    {
      name: 'token_expire_time',
      value: props.token_expire_time || 0,
    },
    {
      name: 'name_first',
      value: props.name_first || 'NONAME',
    },
    {
      name: 'name_last',
      value: props.name_last || 'NONAME',
    },
    {
      name: 'name_nick',
      value: props.name_nick || 'NONAME',
    },
    {
      name: 'role',
      value: props.role|| 'Guest',
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
      value: props.dflg || false,
    },
    {
      name: 'active',
      value: props.active || true,
    },
  ]
  const entity = {
    key: key,
    data: data,
  }

  return await store.putEntity(entity)
  .then(result => {
    return result
  })
  .catch(err => {
    throw err
  })
}
module.exports.createStaff = createStaff;

/**
* Update seed
* @param {*} ns
* @param {*} props
*/
const updateStaff = async ({ns, props}) => {

  const tran = store.datastore.transaction()
  await tran.run()

  //Set key
  const key = tran.datastore.key({
    namespace: ns,
    path: [ ds.KIND.STAFFS, Number(props.id), ]
  });

  //keep staff
  const [keep] = await tran.get(key)
  if (!keep) {
    await tran.rollback()
    throw Error('staff not found.', JSON.stringify(key))
  }

  const dt = new Date();
  const data = [
    {
      name: 'email',
      value: props.email,
    },    
    {
      name: 'token',
      value: props.token,
    },
    {
      name: 'fb_uid',
      value: props.fb_uid || null,
    },
    {
      name: 'token_expire_time',
      value: props.token_expire_time || 0,
    },
    {
      name: 'name_first',
      value: props.name_first || 'NONAME',
    },
    {
      name: 'name_last',
      value: props.name_last || 'NONAME',
    },
    {
      name: 'name_nick',
      value: props.name_nick || 'NONAME',
    },
    {
      name: 'role',
      value: props.role || 'Guest',
    },
    {
      name: 'cdt',
      value: props.cdt,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'dflg',
      value: props.dflg || false,
    },
    {
      name: 'active',
      value: props.active || true,
    },
  ]

  const entity = {
    key: key,
    data: data,
  }

  //put entity
  return await store.putEntity(entity, tran).then(result => {
    tran.commit()
    return result
  })
  .catch(err => {
    tran.rollback()
    throw err
  })
}

/**
 * Get staff by prop filter
 * @param {string} ns
 * @param {string} propname
 * @param {string} value
 */
const getStaffByFilter = async ({ns, propname, value}) => {

  //set query
  store.datastore.namespace = ns
  const query = store.datastore
    .createQuery(ds.KIND.STAFFS)
    .filter(propname, '=', value)
    .limit(1)

  //put entity
  return await store.datastore.runQuery(query)
  .then(results => {
    let entities = results[0];
    if (entities[0]) {
      entities[0]['key_id'] = entities[0][store.datastore.KEY].id
    }
    return entities[0];
  }).catch(err => {
    throw err
  })   
}

/**
 * Get staffs
 * @param {string} ns
 */
 const getStaffsBy = async ({ns}) => {

  //set query
  store.datastore.namespace = ns
  const query = store.datastore
    .createQuery(ds.KIND.STAFFS)
    .filter("dflg", '=', false)

  //put entity
  return await store.datastore.runQuery(query)
  .then(results => {
    if (results[0]?.length > 0) {
      for (let idx in results[0]) {
        results[0][idx]['key_id'] = results[0][idx][store.datastore.KEY].id
      }
      return results[0];
    } else {
      return null
    }
  }).catch(err => {
    throw err
  })
}

/**
 * Delete staff by ds id
 * @param {string} ns
 * @param {string} id
 */
 const deleteStaffById = async ({ns, id}) => {

  //Key生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds.KIND.STAFFS, Number(id) ],
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

module.exports = {
  createStaff,
  updateStaff,
  getStaffByFilter,
  getStaffsBy,
  deleteStaffById,
};