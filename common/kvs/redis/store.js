'use strict'

const dateformat = require('dateformat');

//Redis Server
const HOST = 'localhost';
const PORT = '6379';
var redis = require('redis');
var redis_client = redis.createClient(PORT, HOST);

//Redis connect checking
redis_client.on("error", function(err) {
  console.log("Error " + err);
});
redis_client.set('start', 'starting redis...');
redis_client.get('start', function(err, data){
  console.log(data);
});
module.exports.redis_client = redis_client;


////////////////////////////////////////////////////////////
// Common
////////////////////////////////////////////////////////////
/**
 * put hset entity
 * @param {*} entity 
 */
function putEntity(entity) {
  const hkey = entity.key;
  var value = JSON.stringify(entity.data);
  return new Promise(resolve => {
    redis_client.hset(hkey , "value", value, function(err, val) {
      if (err) reject(err);
      resolve(val);
    });
  });
}
module.exports.putEntity = putEntity;

/**
 * Get value by key name
 * @param {*} kind 
 * @param {*} key_name (room_id, user_id..)
 * @param {*} prop_name (unixtime, type)
 */
function getValueByKeyName(kind, key_name, prop_name) {
  const hkey = kind + '-' + key_name;
  return new Promise((resolve, reject) => {
    redis_client.hget(hkey, 'value', function(err, val) {
      if (err) reject(err);
      const result = JSON.parse(val);
      //console.log(result);
      if (result) {
        resolve(result[prop_name]);
      } else {
        resolve(null);
      }
    });
  });
}
module.exports.getValueByKeyName = getValueByKeyName;


////////////////////////////////////////////////////////////
// OK-SKY User type
////////////////////////////////////////////////////////////
/**
 * Set user type entity for insert to datastore.
 * @param {*} kind:kind
 * @param {*} user_id:key
 * @param {*} user_type:property
 */
function setInsertEntityUserType(kind, user_id, user_type) {
  const now = new Date();
  const df = dateformat(now, 'yyyymmdd-HHMMss');
  const hashKey = kind + '-' + user_id;
  const entity = {
    key: hashKey,
    data: {
      type: user_type,
      updated_at: df,
      created_at: df,
    },
  };
  return entity;
}
module.exports.setInsertEntityUserType = setInsertEntityUserType;

/**
 * Get User Type by KeyName
 * @param {*} kind 
 * @param {*} key_name(user_id) 
 */
/*function getUserTypeByKeyName(kind, key_name) {
  const hkey = kind + '-' + key_name;
  return new Promise((resolve, reject) => {
    redis_client.hget(hkey, 'value', function(err, val) {
      if (err) reject(err);
      const result = JSON.parse(val);
      resolve(result.type);
    });
  });
}
module.exports.getUserTypeByKeyName = getUserTypeByKeyName;*/


////////////////////////////////////////////////////////////
// Session
////////////////////////////////////////////////////////////
/**
 * Set session entity for insert to datastore.
 * @param {*} kind 
 * @param {*} key_name 
 * @param {*} zero 
 */
function setInsertEntitySession(kind, key_name, zero=false) {
  const now = new Date();
  let ut = Math.round(now.getTime()/1000);
  if (zero) {
    const ut = 0;
  }  
  const df = dateformat(now, 'yyyymmdd-HHMMss');
  const hashKey = kind + '-' + key_name;
  const entity = {
    key: hashKey,
    data: {
      unixtime: ut,
      updated_at: df,
      created_at: df,
    },
  };
  return entity;
}
module.exports.setInsertEntitySession = setInsertEntitySession;

/**
 * Get session(unixtime)
 * @param {*} kind 
 * @param {*} key_name 
 */
/*function getSessionByKeyName(kind, key_name) {
  const hkey = kind + '-' + key_name;
  return new Promise((resolve, reject) => {
    redis_client.hget(hkey, 'value', function(err, val) {
      if (err) reject(err);
      const result = JSON.parse(val);
      resolve(result.unixtime);
    });
  });
}
module.exports.getSessionByKeyName = getSessionByKeyName;*/


////////////////////////////////////////////////////////////
// Config
////////////////////////////////////////////////////////////
/**
 * Set config client id entity.
 * @param {*} kind 
 * @param {*} client_id 
 */
function setInsertEntityClientId(kind, client_id) {
  const now = new Date();
  const df = dateformat(now, 'yyyymmdd-HHMMss');
  const listKey = kind;
  const entity = {
    key: listKey,
    data: {
      description: "client_id",
      value : Number(client_id),
      updated_at: df,
      created_at: df,
    },
  }
  return entity;
}
module.exports.setInsertEntityClientId = setInsertEntityClientId;

/**
 * Insert config client id list.
 * @param {*} entity 
 */
function insertConfigClientIdList(entity) {
  const listkey = entity.key;
  console.log(listkey);
  var value = JSON.stringify(entity.data);
  return new Promise(resolve => {
    redis_client.rpush(listkey , value, function(err, val) {
      if (err) reject(err);
      resolve(val);
    });
  });
}
module.exports.insertConfigClientIdList = insertConfigClientIdList;

/**
 * Get config client id lists.
 * @param {*} kind 
 */
function getConfigClientIdList(kind) {
  return new Promise((resolve, reject) => {
    redis_client.lrange(kind, 0, -1, function(err, val) {
      if (err) reject(err);
      var arr = [];
      for ( var i = 0;  i < val.length;  i++ ) {
        let list = JSON.parse(val[i]);
        if (list.description == 'client_id') {
          arr.push(list.value);
        }
      }
      resolve(arr);      
    });
  });
}
module.exports.getConfigClientIdList =getConfigClientIdList;


////////////////////////////////////////////////////////////
// Watson Response context
////////////////////////////////////////////////////////////
/**
 * Set response context entity.
 * @param {*} kind 
 * @param {*} key_name 
 * @param {*} res_context 
 */
function setInsertEntityResContext(kind, key_name, res_context) {
  const now = new Date();
  const df = dateformat(now, 'yyyymmdd-HHMMss');
  const hashKey = kind + '-' + key_name;
  const entity = {
    key: hashKey,
    data: {
      response_context: res_context,
      updated_at: df,
      created_at: df,
    },
  }
  return entity;
}
module.exports.setInsertEntityResContext = setInsertEntityResContext;

/* 
 * Get response context
 * @room_id
*/
/*function getResposeContextByKeyName(kind, key_name) {
  const hkey = kind + '-' + key_name;
  return new Promise((resolve, reject) => {
    redis_client.hget(hkey, 'value', function(err, val) {
      if (err) reject(err);
      const result = JSON.parse(val);
      resolve(result.unixtime);
    });
  });
}
module.exports.getResposeContextByKeyName = getResposeContextByKeyName;*/