'use strict';

const KIND = {
  RESPONSIES : `Responsies`,  //Response格納用
};
module.exports.KIND = KIND;

const store = require(`./store`)
module.exports.store = store

const responsies = require(`./queries.responsies`)
module.exports.responsies = responsies

const worthwords = require(`./queries.worthwords`)
module.exports.worthwords = worthwords

