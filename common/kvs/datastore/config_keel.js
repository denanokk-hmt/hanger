'use strict';

/**
 * @enum
 */
const KIND = {
  ID :              `ID`,              //ID採番用
  SEED :            `Seed`,            //Seed格納用
  SESSION :         `Session`,         //Session情報格納用
  ROOM :            `Room`,            //Room情報格納用
  MESSAGE :         `Message`,         //Message報格納用
  USER_UID  :       `UserUID`,         //UserGroup UID格納用
  USER_USER :       `UserUser`,        //UserGroup User情報格納用
  USER_ROOM :       `UserRoom`,        //UserGroup Room情報格納用
  USER_RESCONTXT :  `UserResContext`,  //UserGroup ResponContext格納用
  USER_STATUS_PROPS:`UserStatusProps`, //UserStatusを廃止APP-APP-668bug改修→UserUIDグループ外)
  EVENTS :          `Events`,          //Events情報格納用
  ASKER_HOSTNAMES : `Hostnames`,       //Asker server hostname情報格納用
  RESPONSIES :      `Responsies`,      //Asker or Newest server Response情報格納用
  ANSWERS :         `Answers`,         //Asker server Answers情報格納用
  OPERATOR :        `Operator`,        //Operator情報格納用
  USER_SNS :        `UserSNS`,         //UserGroup SNS格納用
  COUPON :          `Coupon`,          //Coupon情報格納用
  COUPON_CODE :     `CouponCode`,      //Couponコード格納用
  SURVEY :          `Survey`,          //Survey情報格納用
  ANALYSIS :        `Analysis`,        //Analysis情報格納用
  RB_REVISION :     `RbRevision`,     //RulebaseFAQ世代管理用
  SYSMSG:           `Sysmsg`,          //Sysmsg格納用
  MC_MASTER:        `McMaster`,        //MessageContainerトランザクション
  MC_RESPONSIES:    `McResponcies`,    //MessageContainer Response情報格納用
  DIALOG_MASTER:    `DialogMaster`,        //Dialogトランザクション
  DIALOG_RESPONSIES:`DialogResponcies`,    //Dialog Response情報格納用
};
module.exports.KIND = KIND;


const store = require(`./store`)
module.exports.store = store

const session = require(`./queries.session`)
module.exports.session = session

const room = require(`./queries.room`)
module.exports.room = room

const user = require(`./queries.user`)
module.exports.user = user

const message = require(`./queries.message`)
module.exports.message = message

const asker_hostnames = require(`./queries.asker.hostnames`)
module.exports.asker_hostnames = asker_hostnames

const common = require(`./queries.common`)
module.exports.common = common

const responsies = require(`./queries.responsies`)
module.exports.responsies = responsies

const answers = require(`./queries.answers`)
module.exports.answers = answers

const newest = require(`./queries.newest`)
module.exports.newest = newest

const operator = require(`./queries.operator`)
module.exports.operator = operator

const sns = require(`./queries.sns`)
module.exports.sns = sns

const coupon = require(`./queries.coupon`)
module.exports.coupon = coupon

const survey = require('./queries.survey')
module.exports.survey = survey

const analysis = require('./queries.analysis')
module.exports.analysis = analysis

const rulebase = require('./queries.rulebase')
module.exports.rulebase = rulebase

const sysmsg = require('./queries.sysmsg')
module.exports.sysmsg = sysmsg

const message_container = require('./queries.message_container')
module.exports.message_container = message_container

const dialog = require('./queries.dialog')
module.exports.dialog = dialog
