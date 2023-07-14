'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status

//System modules
const crypto = require(`./crypto/crypto`)
const ds = require('./kvs/datastore/config_boarding');


/**
 * OAuth
 * @param {*} ns
 * @param {*} client
 * @param {*} id
 * @param {*} pw
 * @param {*} token
 * @param {*} force_token
 * @param {*} dflg session delete (boarding:noneed)
 * @param {*} logiD
 * id, pwがNull, tokenはあり→ID連携なし
 * id, pw、tokenあり→ID連携あり
 * force_tokenあり→session replace
 */
const oAuth =  async ({ns, client, id, pw, token, force_token, dflg, logiD}) => {

  let hashIdPw, seed, session_id, session
  try {

    //Set session_id
    if (force_token) { 
      session_id = force_token //case of expire session or forget pw
    } else {

      //Get id & pw hash value
      if (!id && !pw && token) {
        //anonymous user sign in. Get hash of decrypt value.
        hashIdPw = await getHash(token, client)
      } else {
        //Session user. Get hash from ID & PW
        hashIdPw = await setHash(id, pw)
      }  

      //Search seed ,search session id
      const seeds = await ds.store.getEntityByKey({ns, kind: ds.KIND.SEED, key: hashIdPw, customNm: true})
      seed = (seeds)? seeds[0].seed : null
      if (seed) {
        const crypted = await crypto.encrypt(`${seed}${hashIdPw}`) //seed+hashIdPw-->crypto==session_id
        session_id = crypted.crypt
      }
    }
    console.log(`==OAUTH==${logiD} <<seeds & HashIdPw, session_id>>`, `${seed}|${hashIdPw}|${session_id}`)

    //Get session entity
    if (session_id) {
      session = await ds.store.getEntityByKey({ns, kind: ds.KIND.SESSION, key: session_id, customNm: true})
      console.log(`==OAUTH==${logiD} <<ns>>:${ns} <<session>>`, `${JSON.stringify(session)}`)
    }

    let status_code, status_msg
    let approval = true

    //Case OAuth error --> set return values 
    if (!session) {
      //No session
      status_code = (seed)? code.ERR_A_OAUTH_NONHUMAN_305 : code.ERR_A_OAUTH_NON_303
      status_msg = (seed)? status.ERR_A_OAUTH_NONHUMAN_305 : status.ERR_A_OAUTH_NON_303
      approval = false
    } else if (session[0].dflg) {
      //settion is, but dflg
      status_code = code.ERR_A_OAUTH_DEL_304
      status_msg = status.ERR_A_OAUTH_DEL_304
      approval = false
    } else if (conf.env_client[client]?.session_expire?.required) {
      //Session expired(Boarding only)
      if (!force_token && session[0].uut + conf?.expire_time[client] < new Date().getTime()) {
        status_code = code.WAR_EXPIRED_SESS_102
        status_msg = status.WAR_EXPIRED_SESS_102
        approval = false
      }
    }

    //Return OAuth error
    if (!approval) {
      const result = {
        type : "OAuth",
        token : session_id,
        approval : false,
        status_code, status_msg, client, logiD,
      }
      console.log(JSON.stringify(result))
      return result
    }
  } catch(err) {
    throw err
  }

  //Set additional properties
  const addProp = {
    op_system: session[0].op_system,
    op_access_token: session[0].op_access_token,
    op_rid: session[0].op_rid,
    op_cust_uid: session[0].op_cust_uid,
    op_ope_uid: session[0].op_ope_uid,
    op_session: session[0].op_session
  }

  console.log(`=========${logiD} OAUTH ADDPROPS:${JSON.stringify(addProp)}`)
  console.log(`=========${logiD} OAUTH session[0]:${JSON.stringify(session[0])}`)

  //Update session
  return ds.session.putSession({ns, session: session[0], addProp, dflg})
    .then(result => {
      console.log(`=========${logiD} OAUTH PUT RESULT:${JSON.stringify(result)}`)
      return {
        type : "OAuth",
        status_code : code.SUCCESS_ZERO,
        status_msg : "OAuth Success.",
        token : session_id,
        rid: session[0].rid,
        uid: session[0].uid,
        op_system: session[0].op_system,
        op_access_token: session[0].op_access_token,
        op_rid: session[0].op_rid,
        op_cust_uid: session[0].op_cust_uid,
        op_ope_uid: session[0].op_ope_uid,
        op_session: session[0].op_session,
        approval : true,
      }
    })
    .catch(err => {
      throw err
    })

};
module.exports.func = oAuth;

/**
 * Get id & pw Hash
 * @param {string} token
 * @param {string} client
 */
 const getHash =  async (token, client) => {

  //Get hash id & pw for seed search key
  const decrypt = await crypto.decrypt(token)
  if (!decrypt.issue) {
    express_res.func(res, decrypt);
    return 'Decrypt error'
  }
  //expired=true --> front 8 strings is seed
  const hashIdPw = (conf.expire_time[client])? decrypt.crypt.slice(8,) : decrypt.crypt.slice(0,)
  return hashIdPw
};
module.exports.getHash = getHash;

/**
 * Set hash by id & pw 
 * @param {*} id
 * @param {*} pw
 */
 const setHash =  async (id, pw) => {

  //Session user. Get hash from ID & PW
  const hash = await crypto.hashMac(id, pw)
  if (!hash.issue) {
    express_res.func(res, hash);
    return 'Hash issue Error.';
  }
  return hash.token
};
module.exports.setHash = setHash;