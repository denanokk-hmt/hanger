'use strict';

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store;

/**
 * getMessageContainer
 * 全てのMessageContainerを取得する
 * @param {String} ns
 * @returns {Array} response一覧
 */
const getMessageContainer = async (ns) => {
  try {
    store.datastore.namespace = ns;
    const query = store.datastore
      .createQuery([ds_conf.KIND.MC_RESPONSIES]);
  
    const results = await store.datastore.runQuery(query);
    console.log(`========= ns: ${ns} =========get message container /get ${results[0].length} results.`);
    return results[0];
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get message container. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getMessageContainer = getMessageContainer;

/**
 * getMessageContainerById
 * 指定されたIDのMessageContainerを取得する
 * @param {String} ns
 * @returns {Array} response一覧
 */
const getMessageContainerById = async (ns, response_id) => {
  try {
    const result = await store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.MC_RESPONSIES,
      key: response_id,
      customNm: true
    });
    if (!result?.[0] || result[0].dflg) { return null; }
    return result[0];
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get message container by key:${response_id}. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getMessageContainerById = getMessageContainerById;

/**
 * getMessageContainerHeads
 * head=trueのMessageContainerを取得する
 * @param {String} ns
 * @returns {Array} response一覧
 */
const getMessageContainerHeads = async (ns) => {
  try {
    store.datastore.namespace = ns;
    const query = store.datastore
      .createQuery(ds_conf.KIND.MC_RESPONSIES)
      .filter('dflg', '=', false)
      .filter('head', '=', true);
  
    const results = await store.datastore.runQuery(query);
    console.log(`========= ns: ${ns} =========get message container heads /get ${results[0].length} results.`);
    return results[0];
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get message container heads. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getMessageContainerHeads = getMessageContainerHeads;

/**
 * updateMessageContainer
 * MessageContainerのResponsesをupsertする
 * @param {String} ns
 * @param {object} data
 * @param {String} client
 * @param {String} comment
 * @param {String} log_id
 * @returns {number} newRev
 */
const updateMessageContainer = async (ns, client, data) => {

  const dt = new Date();
  console.log(`=========ns: ${ns} =========update message container.`);

  try {
    const tran = store.datastore.transaction();

    const tranKey = tran.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.MC_MASTER,
        ds_conf.KIND.MC_MASTER,
      ]
    });
    const [search] = await tran.get(tranKey);
    // insert mc master
    tran.upsert({
      key: tranKey,
      data: [
        {
          name: "udt",
          value: dt
        },{
          name: "cdt",
          value: search?.cdt || dt
        },
      ]
    });

    //insert message container
    for (let i = 0; i < data.length; i++) {
      let row = data[i];
      let key = store.datastore.key({
        namespace: ns,
        path: [
          ds_conf.KIND.MC_RESPONSIES,
          row?.response_id,
        ]
      });
      let inputData = [
        {
          name: "response_id",
          value: row?.response_id
        },
        {
          name: "client",
          value: client
        },
        {
          name: "head",
          value: row?.head || false
        },
        {
          name: "title",
          value: row?.title || null
        },
        {
          name: "talk",
          value: row?.talk || null,
          excludeFromIndexes: true,
        },
        {
          name: "dflg",
          value: row?.dflg || false
        },
        {
          name: "cdt",
          value: row?.cdt || dt
        },
        {
          name: "udt",
          value: dt
        },
        {
          name: "committer",
          value: row?.committer || null
        },
      ];
      await store.datastore.upsert({
        key: key,
        data: inputData
      });
    }

    await tran.commit();
    console.log(`========= ns: ${ns} =========success insert ${data.length} responsies for message container.`);

    return;
  } catch (err) {
    const err_msg = err.message || err;
    console.error(`========= ns: ${ns} =========failed insert responsies for message container. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }
};
module.exports.updateMessageContainer = updateMessageContainer;
