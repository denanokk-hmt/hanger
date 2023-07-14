'use strict'

//System modules
const crypto = require('crypto');

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


const generateCouponId = (dt) => {
  let d = dt.valueOf().toString();
  let r = Math.random().toString();
  return crypto.createHash('md5').update(d + r).digest('hex');
}
const parseDataObject = (entity) => {
  let data = {};
  for (let d of entity.data) {
    data[d.name] = d.value;
  }
  return data;
}

/**
* Create session
* @param {text} ns
* @param {text} cname
* @param {date} expire
* @param {text} img_url 
* @returns {*} coupon 
*/
const createCoupon = async (ns, cname, expire, img_url) => {
  const dt = new Date();
  const cid = generateCouponId(dt);
  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.COUPON, cid ],
  });
  const data = [
    // ***** GENGERAL *****
    {
      name: 'coupon_id',
      value: cid,
    },
    {
      name: 'name',
      value: cname,
    },
    {
      name: 'expire',
      value: expire,
    },
    {
      name: 'dflg',
      value: null,
    },
    {
      name: 'sflg',
      value: null,
    },
    {
      name: 'img_url',
      value: img_url,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'cdt',
      value: dt,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result);
    })
    .catch(err => {
      console.log(err);
      reject(err);
    })
  });
}
module.exports.createCoupon = createCoupon;

/**
 * Update coupon entity
 * @param {*} ns 
 * @param {*} cid 
 * @param {*} cname 
 * @param {*} expire 
 * @param {*} dflg 
 * @param {*} sflg 
 * @param {*} img_url 
 * @param {*} dt 
 */
const updateCoupon = async (ns, cid, cname, expire, dflg, sflg, img_url, udt, cdt) => {
  //entity生成
  const key = store.datastore.key({
    namespace: ns,
    path: [ ds_conf.KIND.COUPON, cid ],
  });
  const data = [
    // ***** GENGERAL *****
    {
      name: 'coupon_id',
      value: cid,
    },
    {
      name: 'name',
      value: cname,
    },
    {
      name: 'expire',
      value: expire,
    },
    {
      name: 'dflg',
      value: dflg,
    },
    {
      name: 'sflg',
      value: sflg,
    },
    {
      name: 'img_url',
      value: img_url,
    },
    {
      name: 'udt',
      value: udt,
    },
    {
      name: 'cdt',
      value: cdt,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result);
    })
    .catch(err => {
      console.log(err);
      reject(err);
    })
  });
}
module.exports.updateCoupon = updateCoupon;


/**
 * Get getCoupons
 * @param {text} ns
 * @param {text} cid 
 */
const getCoupons = (ns, cid, exclude_sflg, skip_expired_check) => {
  const dt = new Date();
  return new Promise((resolve, reject) => {
    //set namespace
    store.datastore.namespace = ns;
    //set query
    let query = store.datastore
      .createQuery(ds_conf.KIND.COUPON)
      .filter('dflg', '=', null);
    if (cid) {
      query = query.filter('coupon_id', '=', cid);
    }
    if (exclude_sflg) {
      query = query.filter('sflg', '=', null);
    }
    
    //run query
    store.datastore.runQuery(query)
      .then(results => {
        let entities = results[0];
        if (!skip_expired_check) {
          entities = entities.filter(item => item.expire > dt);
        }
        resolve(entities);
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    });
}
module.exports.getCoupons = getCoupons;

/**
 * UID cerate
 * @param {*} ns
 * @param {int} ID
 * @param {text} oksky_id
 * @returns {int} UID
 */
const createCouponCode = (ns, cid, ccode, site_url) => {
  const dt = new Date();
  //entity生成
  const key = store.datastore.key({
    namespace : ns,
    path: [
        ds_conf.KIND.COUPON,
        cid,
        ds_conf.KIND.COUPON_CODE,
    ],
  });
  const data = [
    // ***** GENGERAL *****
    {
      name: 'coupon_id',
      value: cid,
    },
    {
      name: 'code',
      value: ccode,
    },
    {
      name: 'hmt_id',
      value: null,
    },
    {
      name: 'site_url',
      value: site_url || null,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'cdt',
      value: dt,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store.putEntity(entity).then(result => {
      resolve(result);
    })
    .catch(err => {
      console.log(err);
      reject(err);
    })
  });
}
module.exports.createCouponCode = createCouponCode;

/**
 * Get messages
 * @param {text} ns
 * @param {text} RID 
 * @param {int} mtime
 * @param {text} eqsign ('lt','gt','eq','le','ge') 
 * @param {int} qty
 */
const getOwnCouponCodes = (ns, cid, wid) => {
  return new Promise((resolve, reject) => {
    //set namespace
    store.datastore.namespace = ns;
    //set query
    let query = store.datastore
      .createQuery(ds_conf.KIND.COUPON_CODE)
      .filter('hmt_id', '=', wid);
    if (cid) {
      query = query.filter('coupon_id', '=', cid);
    }

    //run query
    store.datastore.runQuery(query)
      .then(results => {
        const entities = results[0];
        resolve(entities);
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    });
}
module.exports.getOwnCouponCodes = getOwnCouponCodes;
/**
 * Get messages
 * @param {text} ns
 * @param {text} RID 
 * @param {int} mtime
 * @param {text} eqsign ('lt','gt','eq','le','ge') 
 * @param {int} qty
 */
const getEmptyCouponCodes = (ns, cid, qty=1) => {
  return new Promise((resolve, reject) => {
    //set namespace
    store.datastore.namespace = ns;
    //set query
    let query = store.datastore
      .createQuery(ds_conf.KIND.COUPON_CODE)
      .filter('coupon_id', '=', cid)
      .filter('hmt_id', '=', null)
      .limit(qty);

    //run query
    store.datastore.runQuery(query)
      .then(results => {
        const entities = results[0];
        resolve(entities);
      }).catch(err => {
        console.log(err);
        reject(err);
      })
    });
}
module.exports.getEmptyCouponCodes = getEmptyCouponCodes;
/**
 * Get Coupon Code
 * @param {text} ns
 * @param {*} session
 * @param {*} addProp
 * @param {*} dflg
 */
const getCouponCode = async (ns, cid, wid) => {
  const coupon_codes = await getOwnCouponCodes(ns, cid, wid);
  if (coupon_codes && coupon_codes.length) {
    return coupon_codes[0];
  }

  //transaction start
  const tran = store.datastore.transaction();
  await tran.run();
  
  const empty_coupons = await getEmptyCouponCodes(ns, cid);
  if (!empty_coupons || !empty_coupons.length) {
    await tran.rollback();
    return null;
  }
  const empty_coupon = empty_coupons[0];

  //Set key
  const key = tran.datastore.key({
    namespace: ns,
    path: [
      ds_conf.KIND.COUPON,
      cid,
      ds_conf.KIND.COUPON_CODE,
      Number(empty_coupon[store.datastore.KEY].id)
    ],
  });
  
  //keep session
  const [search] = await tran.get(key);
  if (!search) {
    await tran.rollback();
    throw Error('fail to assign coupon code.', JSON.stringify(key));
  }
  const dt = new Date();
  const data = [
    // ***** GENGERAL *****
    {
      name: 'coupon_id',
      value: empty_coupon.coupon_id,
    },
    {
      name: 'code',
      value: empty_coupon.code,
    },
    {
      name: 'hmt_id',
      value: wid,
    },
    {
      name: 'site_url',
      value: empty_coupon.site_url || null,
    },
    {
      name: 'udt',
      value: dt,
    },
    {
      name: 'cdt',
      value: empty_coupon.cdt,
    },
  ];
  //set entity
  const entity = {
    key: key,
    data: data,
  };

  //put entity
  return new Promise((resolve, reject) => {
    store.putEntity(entity, tran).then(result => {
      tran.commit();
      resolve(parseDataObject(result));
    })
    .catch(err => {
      tran.rollback();
      reject(err);
    })
  });
};
module.exports.getCouponCode = getCouponCode;
