'use strict'

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const crypto = moduler.crypto

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


const sysmsgKeys = [
  "op_disconnect",
  "coupons_error",
  "coupons_soldout",
  "coupons_expired"
]

/**
* Update sysmsg entry.
* @param {string} ns
* @param {*} params
* @returns {*} coupon
*/
const updateSysmsg = async (ns, params) => {
  const dt = new Date();

  //entity生成
  const entities = sysmsgKeys.map(k => {
    const data = [
      {
        name: "value",
        value: params.content[k],
      },
      {
        name: 'udt',
        value: dt,
      },
      {
        // Always overwrite (CREATE)
        name: 'cdt',
        value: dt,
      },
      {
        name: "committer",
        value: params.committer
      }
    ];

    const key = store.datastore.key({
      namespace: ns,
      path: [ ds_conf.KIND.SYSMSG, k ],
    })

    return {
      key: key,
      data: data,
    };
  })

  return await store.putEntities(entities);
}
module.exports.updateSysmsg = updateSysmsg;


/**
 * Get system messages.
 * @param {text} ns
 */
const getSysmsg = async (ns) => {
  const results = {};
  for (const k of sysmsgKeys) {
    const ds_result = await store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.SYSMSG,
      key: k,
      customNm: true
    })
    results[k] = ds_result?.[0]
  }
  return results;
}
module.exports.getSysmsg = getSysmsg;

// default SYSMSG for client no having SYSMSG kind.
const defaultSysmsg = {
  "op_disconnect": "【ユーザーの接続が切断されました。】",
  "coupons_expired": "クーポンは有効期限切れです",
  "coupons_error": "クーポンの取得時にエラーになりました",
  "coupons_soldout": "クーポンは配布終了しました"
}

/**
 * Get system message.
 * @param {text} ns
 */
const getSysmsgFor = async (ns, key) => {
  try {
    const [result] = await store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.SYSMSG,
      key,
      customNm: true
    })
    if (result) {
      return result.value;
    } else {
      return defaultSysmsg[key]
    }
  } catch(e) {
    return defaultSysmsg[key]
  }
}
module.exports.getSysmsgFor = getSysmsgFor;
