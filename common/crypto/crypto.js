'use strict';
const crypto = require('crypto');

//conifg
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status
const keys = require(`./keys`);

/**
 * Hash mac
 * @param {*} id 
 * @param {*} pw 
 */
const hashMac = (id, pw) => {

  //////////////////////////////////////////////////////
  //Sampler
  //  const client = req.query.client.replace(/\r?\n/g,"");
  //  const secret = `${client}${Math.floor(Math.random()*Math.floor(100000))}`;
  //  const text = crypto.randomBytes(8).toString('hex');
  //////////////////////////////////////////////////////
  try {
    const secret = String(id);
    const text = String(pw);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.write(text); // write in to the stream
    hmac.end();       // can't read from the stream until you call end()
    const hash = hmac.read().toString('hex'); // read out hmac digest
    return { 
      type : 'Token(Hash)',
      token : `${hash}`,
      status_code : code.SUCCESS_ZERO,
      status_msg : "Hash issue success",
      issue : true,
    };
  } catch(err) {
    console.log(err)
    return {
      type : 'Token(Hash)',
      status_code : code.ERR_S_TOKEN_905,
      status_msg : status.ERR_S_TOKEN_905,
      token : null,
      issue : false,
    }
  }
};
module.exports.hashMac = hashMac;

/**
 * Crypting encode or dedocde
 * @param {*} text data
 * @param {*} kind 'e': encrypt or 'd': decrypt
 * @param {*} algorithm 'aes-256-gcm'
 * @param {*} input_encoding 'utf8', 'ascii' or 'binary'
 * @param {*} output_encoding 'binary', 'base64' or 'hex'が指定できる
 */
const crypting = (text, kind, algorithm='aes-256-gcm', input_encoding='utf8', output_encoding='base64') => {
  try {
    const key = new Buffer.from(keys.key, 'utf8');//鍵256bit
    const iv = new Buffer.from(keys.iv, 'utf8');//初期化ベクトル128bit

    //暗号化
    if (kind == 'e') {
      var cipher = crypto.createCipheriv(algorithm, key, iv);
      var encoded = cipher.update(text, input_encoding, output_encoding); //utf8-->base64
      encoded += cipher.final(output_encoding);
      return encoded
    } else {
      //復号化
      var decipher = crypto.createDecipheriv(algorithm, key, iv);
      var decoded = decipher.update(text, output_encoding, input_encoding); //base64-->utf8
      return decoded
    }
  } catch(err) {
    throw new Error(err)
  }
}
module.exports.crypting = crypting;

/**
 * 
 * @param {*} text 
 */
const hashing = (text, argo) => {
  let hash = crypto.createHash(argo);
  hash.update(text)
  return hash.digest('hex')
}
module.exports.hashing = hashing;

/**
 * Make seed
 */
const seedRandom8 = () => {
  return Math.random().toString(36).slice(-8);
}
module.exports.seedRandom8 = seedRandom8;

/**
 * Make seed
 */
const seedRandom16 = () => {
  const front8 = Math.random().toString(36).slice(-8);
  const back8 = Math.random().toString(36).slice(-8);
  return `${front8}${back8}`
}
module.exports.seedRandom16 = seedRandom16;

/**
 * Encryption
 * @param {*} text 
 */
const encrypt = (text) => {
  try {
    const crypted = crypting(text, 'e')
    return { 
      type : 'Crypting(encode)',
      crypt : crypted,
      status_code : code.SUCCESS_ZERO,
      status_msg : "Encrypt success",
      issue : true,
    };
  } catch(err) {
    return {
      type : 'Crypting(encode)',
      crypt : null,
      status_code : code.ERR_S_TOKEN_905,
      status_msg : status.ERR_S_TOKEN_905,
      issue : false,
    }
  }
}
module.exports.encrypt = encrypt

/**
 * Decryption
 * @param {*} text 
 */
const decrypt = (text) => {
  try {
    const crypted = crypting(text, 'd')
    return { 
      type : 'Crypting(decode)',
      crypt : crypted,
      status_code : code.SUCCESS_ZERO,
      status_msg : "Decrypt success",
      issue : true,
    };
  } catch(err) {
    return {
      type : 'Crypting(decode)',
      crypt : null,
      status_code : code.ERR_S_TOKEN_905,
      status_msg : status.ERR_S_TOKEN_905,
      issue : false,
    }
  }
};
module.exports.decrypt = decrypt