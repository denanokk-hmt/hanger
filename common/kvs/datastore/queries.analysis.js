'use strict';

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store

/**
 * Insert analysis
 * @param {*} ns 
 * @param {*} messages 
 */
const _createAnalysis = (ns, hmt_id, item_id, item_name, item_value, aid, a_name, qid, question, a_result) => {
  const dt = new Date();
  //entity生成
  const key = store.datastore.key({
    namespace : ns,
    path: [ ds_conf.KIND.ANALYSIS ],
  });
  const data = [
    {
      name: 'hmt_id',
      value: hmt_id,
    },
    {
      name: 'analysis_id',
      value: aid,
    },
    {
      name: 'analysis_name',
      value: a_name || null,
    },
    {
      name: 'question_id',
      value: qid || null,
    },
    {
      name: 'question',
      value: question || null,
    },
    {
      name: 'item_id',
      value: item_id || null,
    },
    {
      name: 'item_name',
      value: item_name || null,
    },
    {
      name: 'item_value',
      value: item_value || null,
    },
    {
      name: 'result',
      value: a_result || null,
      excludeFromIndexes: true,
    },
    {
      name: 'rflg',
      value: !!(a_result),
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
const createAnalysis = (ns, hmt_id, item_id, item_name, item_value, aid, qid, question) => {
  return _createAnalysis(ns, hmt_id, item_id, item_name, item_value, aid, null, qid, question, null);
}
const createAnalysisResult = (ns, hmt_id, aid, a_name, a_result) => {
  return _createAnalysis(ns, hmt_id, null, null, null, aid, a_name, null, null, a_result);
}

module.exports.createAnalysis = createAnalysis;
module.exports.createAnalysisResult = createAnalysisResult;
