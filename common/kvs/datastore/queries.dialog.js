'use strict';

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store;

/**
 * getRevision
 * Revisionを取得する
 * @param {String} ns
 * @param {Boolean} testing
 * @returns {Number} Revision番号 or null
 */
const getRevision = async (ns, testing=false) => {
  const master = await store.getEntityByKey({
    ns,
    kind: ds_conf.KIND.DIALOG_MASTER,
    key: ds_conf.KIND.DIALOG_MASTER,
    customNm: true
  });
  return ((testing && testing !== 'false') ? master?.[0]?.testing_rev : master?.[0]?.main_rev) || null;
}
/**
 * generateResponseKey
 * ResponseのKey値を取得する
 * @param {String} response_id
 * @param {Number} rev
 * @returns {String} ResponseのKey値
 */
 const generateResponseKey = (response_id, rev) => {
  return rev ? (response_id + `-${rev}`) : response_id
}
/**
 * getResponseKey
 * ResponseのKey値を取得する
 * @param {String} ns
 * @param {String} response_id
 * @param {Boolean} testing
 * @returns {String} ResponseのKey値
 */
const getResponseKey = async (ns, response_id, testing) => {
  const rev = await getRevision(ns, testing);
  return generateResponseKey(response_id, rev);
}

/**
 * getDialog
 * dflg=falseのDialogを取得する
 * @param {String} ns
 * @param {Boolean} testing
 * @returns {Array} response一覧
 */
const getDialog = async (ns, testing) => {
  try {
    const rev = await getRevision(ns, testing);

    store.datastore.namespace = ns;
    const query = store.datastore
      .createQuery([ds_conf.KIND.DIALOG_RESPONSIES])
      .filter('dflg', '=', false);
    if (rev) {
      query.filter('rev', '=', rev);
    }

    const results = await store.datastore.runQuery(query);
    let data = results[0] || [];
    if (!rev) {
      // 初回リリース後にmainを取得した際の対応（main=null, testing=1）
      data = data.filter(r => !r.rev);
    }
    console.log(`========= ns: ${ns} =========get dialog /get ${data.length} results. testing: ${testing}`);
    return data;
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get dialog. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getDialog = getDialog;

/**
 * getDialog
 * dflg=trueのDialogを取得する
 * @param {String} ns
 * @param {Boolean} testing
 * @returns {Array} response一覧
 */
const getDialogDeleted = async (ns, testing) => {
  try {
    const rev = await getRevision(ns, testing);

    store.datastore.namespace = ns;
    const query = store.datastore
      .createQuery([ds_conf.KIND.DIALOG_RESPONSIES])
      .filter('dflg', '=', true);
    if (rev) {
      query.filter('rev', '=', rev);
    }

    const results = await store.datastore.runQuery(query);
    let data = results[0] || [];
    if (!rev) {
      // 初回リリース後にmainを取得した際の対応（main=null, testing=1）
      data = data.filter(r => !r.rev);
    }
    console.log(`========= ns: ${ns} =========get deleted dialog /get ${data.length} results. testing: ${testing}`);
    return data;
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get deleted dialog. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getDialogDeleted = getDialogDeleted;

/**
 * getDialogMessage
 * 指定されたIDのDialogを取得する
 * @param {String} ns
 * @param {Boolean} testing
 * @returns {Array} response
 */
const getDialogMessage = async (ns, response_id, testing) => {
  let response_key = response_id;
  try {
    response_key = await getResponseKey(ns, response_id, testing);

    const result = await store.getEntityByKey({
      ns,
      kind: ds_conf.KIND.DIALOG_RESPONSIES,
      key: response_key,
      customNm: true
    });
    if (!result?.length || result[0].dflg) { return null; }
    console.log(`========= ns: ${ns} =========get dialog /get ${result[0].length} results. testing: ${testing}`);
    return result[0];
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get dialog by key:${response_key}. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getDialogMessage = getDialogMessage;

/**
 * getDialogHeads
 * head=trueのDialogを取得する
 * @param {String} ns
 * @param {Boolean} testing
 * @returns {Array} response一覧
 */
const getDialogHeads = async (ns, testing) => {
  try {
    const rev = await getRevision(ns, testing);

    store.datastore.namespace = ns;
    const query = store.datastore
      .createQuery(ds_conf.KIND.DIALOG_RESPONSIES)
      .filter('dflg', '=', false)
      .filter('head', '=', true);  
    if (rev) {
      query.filter('rev', '=', rev);
    }
  
    const results = await store.datastore.runQuery(query);
    let data = results[0] || [];
    if (!rev) {
      // 初回リリース後にmainを取得した際の対応（main=null, testing=1）
      data = data.filter(r => !r.rev);
    }
    console.log(`========= ns: ${ns} =========get dialog heads /get ${data.length} results. testing: ${testing}`);
    return data;
  }
  catch (err) {
    console.error(`========= ns: ${ns} =========failed to get dialog heads. err: ${JSON.stringify(err)}`);
    throw err;
  }
};
module.exports.getDialogHeads = getDialogHeads;

/**
 * updateDialog
 * DialogのResponsesをupsertする
 * ※ 更新対象はDialogMaster.TestingRevが指すRev
 * @param {String} ns
 * @param {String} client
 * @param {object} data
 */
const updateDialog = async (ns, client, data) => {

  const dt = new Date();
  console.log(`=========ns: ${ns} =========update dialog.`);

  try {
    const tran = store.datastore.transaction();

    const tranKey = tran.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.DIALOG_MASTER,
        ds_conf.KIND.DIALOG_MASTER,
      ]
    });
    const [search] = await tran.get(tranKey);
    const testing_rev = search?.testing_rev || null;

    // insert dialog master
    tran.upsert({
      key: tranKey,
      data: [
        {
          name: "main_rev",
          value: search?.main_rev || null,
        },
        {
          name: "testing_rev",
          value: testing_rev,
        },
        {
          name: "committer",
          value: search?.committer || null,
        },
        {
          name: "rdt",
          value: search?.rdt || null
        },
        {
          name: "udt",
          value: dt
        },
        {
          name: "cdt",
          value: search?.cdt || dt
        },
      ]
    });

    //get current data
    const dataKeys = data.map(row => {
      const response_id = row?.response_id || null;
      if (!response_id) { return null; }

      const response_key = generateResponseKey(response_id, testing_rev);
      return store.datastore.key({
        namespace: ns,
        path: [
          ds_conf.KIND.DIALOG_RESPONSIES,
          response_key,
        ]
      });
    }).filter(d => !!d);
    if (!dataKeys?.length) {
      console.error(`========= ns: ${ns} =========failed insert responsies for dialog. /err: no valid response_id`);
      return;
    }
    const [currents] = await store.datastore.get(dataKeys);

    //insert dialog
    const inputData = data.map(row => {
      const response_id = row?.response_id || null;
      if (!response_id) { return null; }

      const response_key = generateResponseKey(response_id, testing_rev);
      const current = currents.find(m => m.response_id === response_id);
      return {
        key: store.datastore.key({
          namespace: ns,
          path: [
            ds_conf.KIND.DIALOG_RESPONSIES,
            response_key,
          ]
        }),
        data: [
          {
            name: "response_id",
            value: response_id
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
            value: current?.cdt || dt
          },
          {
            name: "udt",
            value: dt
          },
          {
            name: "committer",
            value: row?.committer || null
          },
          {
            name: "rev",
            value: current?.rev || testing_rev
          },
        ]
      }
    }).filter(d => !!d);
    if (!inputData?.length) {
      console.error(`========= ns: ${ns} =========failed insert responsies for dialog. /err: no valid data`);
      return;
    }
    await store.datastore.upsert(inputData);

    await tran.commit();
    console.log(`========= ns: ${ns} =========success insert ${inputData.length} responsies for dialog.`);

    return;
  } catch (err) {
    const err_msg = err.message || err;
    console.error(`========= ns: ${ns} =========failed insert responsies for dialog. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }
};
module.exports.updateDialog = updateDialog;

/**
 * deleteDialog
 * 指定されたmessageのエンティティを物理削除する
 * ※ 削除対象はDialogMaster.TestingRevが指すRev
 * @param {String} ns
 * @param {Object} messages
 */
const deleteDialog = async (ns, messages) => {

  const dt = new Date();
  console.log(`=========ns: ${ns} =========update dialog.`);

  try {
    const tran = store.datastore.transaction();

    const tranKey = tran.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.DIALOG_MASTER,
        ds_conf.KIND.DIALOG_MASTER,
      ]
    });
    const [search] = await tran.get(tranKey);
    const testing_rev = search?.testing_rev || null;

    // insert dialog master
    tran.upsert({
      key: tranKey,
      data: [
        {
          name: "main_rev",
          value: search?.main_rev || null,
        },
        {
          name: "testing_rev",
          value: testing_rev,
        },
        {
          name: "committer",
          value: search?.committer || null,
        },
        {
          name: "rdt",
          value: search?.rdt || null
        },
        {
          name: "udt",
          value: dt
        },
        {
          name: "cdt",
          value: search?.cdt || dt
        },
      ]
    });

    //delete dialog
    const response_key = generateResponseKey(message?.response_id, testing_rev);
    const target = messages.map(message => store.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.DIALOG_RESPONSIES,
        response_key
      ],
    }))
    const result = await store.datastore.delete(target)

    await tran.commit();
    const deleted = result[0]?.mutationResults?.length || 0
    console.log(`========= ns: ${ns} =========success delete ${deleted} responsies from dialog.`);

    return deleted;
  } catch (err) {
    const err_msg = err.message || err;
    console.error(`========= ns: ${ns} =========failed delete responsies from dialog. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }
};
module.exports.deleteDialog = deleteDialog;

/**
 * releaseDialog
 * DialogのResponsesをリリース（Testing -> Main）する
 * ※ DialogMaster.TestingRevが指すRevを複製し、TestingRev/MainRevをインクリメント
 * @param {String} ns
 * @param {String} client
 * @param {Number} base_rev
 * @param {String} committer
 */
 const releaseDialog = async (ns, client, base_rev, committer) => {

  const dt = new Date();
  console.log(`=========ns: ${ns} =========release dialog.`);

  try {
    const tran = store.datastore.transaction();

    const tranKey = tran.datastore.key({
      namespace: ns,
      path: [
        ds_conf.KIND.DIALOG_MASTER,
        ds_conf.KIND.DIALOG_MASTER,
      ]
    });
    const [search] = await tran.get(tranKey);
    const org_testing_rev = search?.testing_rev || null;
    // check base rev is testing rev.
    if ((base_rev || null) !== org_testing_rev) {
      return false;
    }

    const testing_rev = org_testing_rev ? org_testing_rev + 1 : 1;
    const main_rev    = org_testing_rev;

    // insert dialog master
    tran.upsert({
      key: tranKey,
      data: [
        {
          name: "main_rev",
          value: main_rev,
        },
        {
          name: "testing_rev",
          value: testing_rev,
        },
        {
          name: "committer",
          value: committer || null,
        },
        {
          name: "rdt",
          value: dt
        },
        {
          name: "udt",
          value: dt
        },
        {
          name: "cdt",
          value: search?.cdt || dt
        },
      ]
    });

    // get current testing responsies
    const data = await getDialog(ns, true);

    //insert dialog
    const inputData = data.map(row => {
      const response_id = row?.response_id || null;
      const response_key = generateResponseKey(response_id, testing_rev);
      return {
        key: store.datastore.key({
          namespace: ns,
          path: [
            ds_conf.KIND.DIALOG_RESPONSIES,
            response_key,
          ]
        }),
        data: [
          {
            name: "response_id",
            value: response_id
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
            value: row?.udt || dt
          },
          {
            name: "committer",
            value: row?.committer || null
          },
          {
            name: "rev",
            value: testing_rev
          },
        ]
      }
    }
    )
    await store.datastore.upsert(inputData);

    await tran.commit();
    console.log(`========= ns: ${ns} =========success release ${data.length} responsies for dialog. rev:${main_rev}, testing:${testing_rev}`);

    return true;
  } catch (err) {
    const err_msg = err.message || err;
    console.error(`========= ns: ${ns} =========failed release responsies for dialog. /err: ${JSON.stringify(err_msg)}`);
    throw err;
  }
};
module.exports.releaseDialog = releaseDialog;
