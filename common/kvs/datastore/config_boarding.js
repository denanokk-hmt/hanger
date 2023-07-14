'use strict';

/**
 * @enum
 */
const KIND = {
  SETTING   : `Setting`, //Seed格納用
  SEED      : `Seed`,    //Seed格納用
  SESSION   : `Session`, //Session情報格納用
  DAUSTATUS : `DauStatus`, //DauStatus情報格納用
  MAUSTATUS : `MauStatus`, //MauStatus情報格納用
};
module.exports.KIND = KIND;

const store = require(`./store`)
module.exports.store = store

const session = require(`./queries.session`)
module.exports.session = session

const restriction = require(`./queries.restriction`)
module.exports.restriction = restriction
