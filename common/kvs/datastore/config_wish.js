'use strict';

/**
 * @enum
 */
const KIND = {
  WISH: 'Wish', // Wishes格納用
  WISH_ATTACHMENT_ITEM: 'WishAttachmentItem', // AttachmentItems情報格納用
  WISH_SPECIALTAG_ITEM: 'WishSpecialTagItem', // SpecialTagItems情報格納用
};
module.exports.KIND = KIND;

const store = require(`./store`);
module.exports.store = store;

const wish = require(`./queries.wish`)
module.exports.wish = wish
