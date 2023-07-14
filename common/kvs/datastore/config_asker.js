'use strict';

//const NAMESPACE = `${env.kvs.service}-${env.client}-${env.environment}`
//module.exports.NAMESPACE = NAMESPACE

const KIND = {
  ANSWERS         : `Answers`,  //Answers(credentials, config)格納用
  ASKER_HOSTNAMES : `Hostnames`,
  RESPONSIES      : `Responsies`,  //Response格納用
};
module.exports.KIND = KIND;


const store = require(`./store`)
module.exports.store = store

const answers = require(`./queries.answers`)
module.exports.answers = answers

const hostnames = require(`./queries.asker.hostnames`)
module.exports.hostnames = hostnames

const responsies = require(`./queries.responsies`)
module.exports.responsies = responsies
