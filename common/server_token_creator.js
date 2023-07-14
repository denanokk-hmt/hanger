'use strict';

const conf = require(REQUIRE_PATH.configure);
const crypto = require(`./crypto/crypto`)



/**
 * server token
 * @param {*} req 
 */
const server_token = {
  
  createSendToken : (recieveSVC) => {
    try {
      const pw = crypto.seedRandom16()
      const id = `${conf.server_code}_TO_${recieveSVC}_${pw}`
      const hash = crypto.hashMac(id, pw).token
      const token = crypto.encrypt(`${hash}_${pw}`).crypt
      return token
    } catch(err) {
      console.error(err)
    }
  },

  createRecieveToken : (sendSVC, send_token) => {
    try {
      let hash = crypto.decrypt(send_token).crypt
      const pw = hash.split('_')[1]
      const id = `${sendSVC}_TO_${conf.server_code}_${pw}`
      hash = crypto.hashMac(id, pw).token
      const token = crypto.encrypt(`${hash}_${pw}`).crypt
      return token
    } catch(err) {
      console.error(err)
    }
  },
}

module.exports = {
  createSendToken : server_token.createSendToken,
  createRecieveToken : server_token.createRecieveToken,
};