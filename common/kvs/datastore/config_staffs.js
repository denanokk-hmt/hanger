'use strict';

/**
 * @enum
 */
const KIND = {
  STAFFS: `Staffs`, //Staffs格納用
};
module.exports.KIND = KIND;

const store = require(`./store`)
module.exports.store = store

const staffs = require(`./queries.staffs`)
module.exports.staffs = staffs
