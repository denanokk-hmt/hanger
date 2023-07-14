'use strict';

//Datastore
const ds_conf = require('./config_keel');
const store = ds_conf.store


/**
 * Insert survey
 * @param {*} ns 
 * @param {*} messages 
 */
const createSurvey = (ns, hmt_id, item_id, item_name, item_value, sid, qid, question) => {
  const dt = new Date();
  //entity生成
  const key = store.datastore.key({
    namespace : ns,
    path: [ ds_conf.KIND.SURVEY ],
  });
  const data = [
    {
      name: 'hmt_id',
      value: hmt_id,
    },
    {
      name: 'survey_id',
      value: sid,
    },
    {
      name: 'question_id',
      value: qid,
    },
    {
      name: 'question',
      value: question,
    },
    {
      name: 'item_id',
      value: item_id || null,
    },
    {
      name: 'item_name',
      value: item_name,
    },
    {
      name: 'item_value',
      value: item_value,
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
module.exports.createSurvey = createSurvey;
