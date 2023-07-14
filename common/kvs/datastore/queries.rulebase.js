'use strict'

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store

const { v4 } = require('uuid');

const queryLogger = (query, results, log_id=null) => {
  return JSON.stringify({
    log_id: log_id,
    namespace: query?.namespace,
    kind: query?.kinds,
    filtes: query?.filters,
    results: results
  })
}
/**
 * getRevision
 * @param {String} ns
 * @param {String} log_id
 * @returns {Object} {rev: 0, id: id, cdt: cdt, comment: comment}
 */
const getRevision = async (ns, log_id=null) => {

  store.datastore.namespace = ns;

  const query = store.datastore
    .createQuery([ds_conf.KIND.RB_REVISION]);

  const results = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get latest RbRevision err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to get latest RbRevision"
    };
  })
  
  if (results[0]?.length === 0) {
    console.log(`=========${log_id} ns: ${ns} =========no RbRevision.`);
    console.log(queryLogger(query, results, log_id))
    return null
  }
  console.log(`=========${log_id} ns: ${ns} =========get latest RbRevision rev: ${results[0][0].rev} `);
  return {
      rev: results[0][0].rev,
      id: results[0][0][store.datastore.KEY].id,
      cdt: results[0][0].cdt,
      comment: results[0][0]?.comment || null
  }
}
module.exports.getRevision = getRevision;

/**
 * getAllRulebases
 * 最新Revisionを親に持つ全てのルールベースを取得する
 * @param {String} ns
 * @param {String} log_id
 * @returns {Array} response一覧
 */
const getRulebases = async (ns, log_id=null) => {

  const revResult = await getRevision(ns, log_id);
  if (!revResult) {
    return {
      result: [],
      comment: null
    }
  }

  store.datastore.namespace = ns;
  const query = store.datastore
    .createQuery(ds_conf.KIND.RESPONSIES)
    .filter('rev', '=', revResult.rev);

  const results = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get all rulebases. rev ${revResult.rev} /err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to get all rulebases."
    };
  })

  if (results[0]?.length === 0) {
    console.log(`=========${log_id} ns: ${ns} =========no rulebases rev: ${revResult.rev}`);
    console.log(queryLogger(query, results, log_id))
  }

  console.log(`=========${log_id} ns: ${ns} =========get all rulebases rev: ${revResult.rev} /get ${results[0].length} results.`);
  return {
    result: results[0],
    comment: revResult?.comment
  }
}
module.exports.getRulebases = getRulebases;

/**
 * getRulebaseResponses
 * ルールベースの回答を取得する
 * @param {String} ns
 * @param {String} response_id
 * @param {String} log_id
 * @returns {Array} response一覧
 */
const getRulebaseResponses = async (ns, response_id, log_id=null) => {

  const revResult = await getRevision(ns, log_id);
  if (!revResult) {
    return []
  }
  const rev = revResult.rev;

  store.datastore.namespace = ns;
  const query = store.datastore
    .createQuery(ds_conf.KIND.RESPONSIES)
    .filter('rev', '=', rev)
    .filter('response_id', '=', response_id);

  const results = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get rulebase responses. rev ${rev} /err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to get rulebase responses."
    };
  })

  if (results[0]?.length === 0) {
    console.log(`=========${log_id} ns: ${ns} =========no rulebase responses rev: ${rev}`); 
    console.log(queryLogger(query, results, log_id))
  }

  console.log(`=========${log_id} ns: ${ns} =========get rulebase responses rev: ${rev} /get ${results[0].length} results.`);
  return results[0];
}
module.exports.getRulebaseResponses = getRulebaseResponses;

/**
 * getRulebaseList
 * ルールベースの質問リストを取得する
 * @param {String} ns
 * @param {String} parent_id
 * @param {String} log_id
 * @returns {Array} response list
 */
const getRulebaseList = async (ns, parent_id = null, log_id=null) => {

  const revResult = await getRevision(ns, log_id);
  if (!revResult) {
    return {
      result: [],
      comment: null
    }
  }
  const rev = revResult.rev;

  store.datastore.namespace = ns;
  const query = store.datastore
    .createQuery(ds_conf.KIND.RESPONSIES)
    .filter('rev', '=', rev)
    .filter('parent_id', "=", parent_id);

  const results = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get rulebases list. rev ${rev} /err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to get rulebases list."
    };
  });

  if (results[0]?.length === 0) {
    console.log(`=========${log_id} ns: ${ns} =========no rulebases list rev: ${rev}`);
    console.log(queryLogger(query, results, log_id))
  }
  console.log(`=========${log_id} ns: ${ns} =========get rulebases list rev: ${rev} /get ${results[0].length} results.`);
  return {
    result: results[0],
    comment: revResult?.comment
  }
};
module.exports.getRulebaseList = getRulebaseList;

/**
 * getRulebaseScenario
 * 指定されたシナリオIDを持つエンティティのresponse_idを取得する
 * @param {String} ns
 * @param {String} scenario_id
 * @param {String} log_id
 * @returns {Array} response_id
 */
const getRulebaseScenario = async (ns, scenario_id = null, log_id=null) => {

  const revResult = await getRevision(ns, log_id);
  if (!revResult) {
    return []
  }
  const rev = revResult.rev;

  store.datastore.namespace = ns;
  const query = store.datastore
    .createQuery(ds_conf.KIND.RESPONSIES)
    .filter('rev', '=', rev)
    .filter('scenario_id', "=", scenario_id);

  const results = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get rulebases scenario. rev ${rev} /err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to get rulebases scenario."
    };
  });

  if (results[0]?.length === 0) {
    console.log(`=========${log_id} ns: ${ns} =========no rulebases scenario rev: ${rev}`);
    console.log(queryLogger(query, results, log_id))
  }
  console.log(`=========${log_id} ns: ${ns} =========get rulebases scenario rev: ${rev} /get ${results[0].length} results.`);
  return {
    result: results[0]
  }
};
module.exports.getRulebaseScenario = getRulebaseScenario;

/**
 * updatePostRulebases
 * 既存のRulebaseのエンティティを全件削除して新たにエンティティをinsertする
 * @param {String} ns
 * @param {object} data
 * @param {String} client
 * @param {String} comment
 * @param {String} log_id
 * @returns {number} newRev
 */
const updateRulebases = async (ns, data, client, comment=null, log_id=null) => {

    const dt = new Date();

    const newRev = v4();
    console.log(`=========${log_id} ns: ${ns} =========update rev for ${newRev}`);

  try {
    //insert rulebases
    for (let i = 0; i < data.length; i++) {
      const key = store.datastore.key({
        namespace: ns,
        path: [ ds_conf.KIND.RESPONSIES ]
      });
      const inputData = [{
        name: "parent_id",
        value: data[i].parent_id
      }, {
        name: "response_id",
        value: data[i].response_id
      }, {
        name: "message",
        value: data[i].message
      }, {
        name: "response",
        value: data[i].response
      }, {
        name: "conditions",
        value: data[i].conditions
      }, {
        name: "content",
        value: data[i].content
      }, {
        name: "cdt",
        value: dt
      }, {
        name: "udt",
        value: dt
      }, {
        name: "rev",
        value: newRev
      },{
        name: "client",
        value: client
      },{
        name: "scenario_id",
        value: data[i].scenario?.id || null
      },{
        name: "scenario_title",
        value: data[i].scenario?.title || null
      },{
        name: "scenario_comment",
        value: data[i].scenario?.comment || null
      },{
        name: "scenario_is_hide",
        value: data[i].scenario?.is_hide || false
      }]
      await store.datastore.insert({
        key: key,
        data: inputData
      });
    }
    console.log(`=========${log_id} ns: ${ns} =========success insert ${data.length} responsies rev: ${newRev}`);
  } catch (err) {
    const err_msg = err.message || err
    console.error(`=========${log_id} ns: ${ns} =========failed insert responsies for rulebase. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }

  const tran = store.datastore.transaction();
  try {
    //revision update
    await tran.run();
    console.log(`=========${log_id} ns: ${ns} =========start update rulebases rev: ${newRev}`);
    
    // get latest RevId
    const revResult = await getRevision(ns, log_id);
    let revKey = tran.datastore.key({namespace: ns, path: [ds_conf.KIND.RB_REVISION]});

    if (revResult) {
      // update rb revision
      revKey = tran.datastore.key({namespace: ns, path: [ds_conf.KIND.RB_REVISION, Number(revResult.id)]});
      await tran.get(revKey)
    }

    // upsert rb revision
    const revData = [{
      name: "rev",
      value: newRev
    },{
      name: "udt",
      value: dt
    },{
      name: "cdt",
      value: revResult ? revResult.cdt : dt
    },{
      name: "comment",
      value: comment
    }]

    tran.upsert({
      key: revKey,
      data: revData
    });
    
    await tran.commit();
    console.log(`=========${log_id} ns: ${ns} =========success update rev: ${newRev}`);

    return 'success';
  } catch (err) {
    tran.rollback();
    const err_msg = err.message || err
    console.error(`=========${log_id} ns: ${ns} =========failed update revision for rulebase. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }
}
module.exports.updateRulebases = updateRulebases;

/**
 * deleteRulebases
 * 指定Revisionに関連するResponsiesを全件削除する
 * 指定Revisionが最新の場合は異常終了する
 * @param {String} ns
 * @param {Number} rev
 * @param {String} log_id
 * @returns {null}
 * 
 */
const deleteRulebases = async (ns, rev, log_id=null) => {

  //getRevision
  const revision = await getRevision(n, null);
  if (!revResult) {
    return null
  }
  const nowRev = Number(revision.rev);
  if (nowRev == rev) {
    console.error(`=========${log_id} ns: ${ns} =========failed to delete rulebases. Can't delete latest revision. rev: ${rev}`);
    throw {
      message: "failed to delete rulebases. Can't delete latest revision."
    };
  }

  store.datastore.namespace = ns;
  const query = store.datastore
    .createQuery(ds_conf.KIND.RESPONSIES)
    .filter('rev', '=', Number(rev));

  const deleteTarget = await store.datastore.runQuery(query).catch((err) => {
    console.error(`=========${log_id} ns: ${ns} =========failed to get rulebases. target rev ${rev} /err: ${JSON.stringify(err)}`);
    throw {
      message: "failed to delete rulebases."
    };
  })
  let key, rbkey;
  for (let i = 0; i < deleteTarget[0].length; i++) {
    rbkey = deleteTarget[0][i]
    key = store.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.RESPONSIES,
        Number(rbkey[store.datastore.KEY].id)
      ]
    });
    await store.datastore.delete(key).catch(err => {
      console.error(`=========${log_id} ns: ${ns} =========failed to delete rulebases rev: ${rev}`);
      throw {
        message: "failed to delete rulebases."
      };
    })
  }
  console.log(`=========${log_id} ns: ${ns} =========delete rulebases rev: ${rev} / ${deleteTarget[0].length} results.`);
  return 'success';
}
module.exports.deleteRulebases = deleteRulebases;
