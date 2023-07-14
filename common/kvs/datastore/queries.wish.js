'use strict';

// Datastore
const ds = require('./config_wish');
const store = ds.store;

/**
 * Insert Wish data.
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 *
 * @return {string} keyName || null
 */
const createWish = async ({ ns, hmt_id }) => {
  const key = store.datastore.key({ namespace: ns, path: [ds.KIND.WISH, hmt_id] });
  const date = new Date();
  const data = [
    {
      name: 'cdt',
      value: date,
    },
    {
      name: 'udt',
      value: date,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  const wishResult = await store.putEntity(entity);
  return wishResult?.key?.name ?? null;
};

/**
 * Insert AttachmentItem data.
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} parentKey Entity group parent key
 * @param {string} item_id Attachment商品ID
 *
 * @return {Promise}
 */
const createWishAttachmentItem = ({ ns, parentKey, item_id }) => {
  const key = store.datastore.key({
    namespace: ns,
    path: [ds.KIND.WISH, parentKey, ds.KIND.WISH_ATTACHMENT_ITEM],
  });
  const date = new Date();
  const data = [
    {
      name: 'item_id',
      value: item_id,
    },
    {
      name: 'cdt',
      value: date,
    },
    {
      name: 'udt',
      value: date,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store
      .putEntity(entity)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

/**
 * Retrieve Wish Key name.
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 *
 * @returns {string} wishKeyName || null
 */
const getWishKey = async ({ ns, hmt_id }) => {
  const wishResult = await store.getEntityByKey({ ns, kind: ds.KIND.WISH, key: hmt_id, customNm: true });

  if (!wishResult || !wishResult[0] || !wishResult[0][store.datastore.KEY]) {
    return null;
  }

  return wishResult[0][store.datastore.KEY].name ?? null;
};

/**
 * Get 1 AttachmentItem by item_id
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} item_id Attachment商品ID
 *
 * @return {Object} attachmentItems
 */
const findAttachmentItem = async ({ ns, hmt_id, item_id }) => {
  // Set namespace
  store.datastore.namespace = ns;
  const parentKey = store.datastore.key({ namespace: ns, path: [ds.KIND.WISH, hmt_id] });
  const query = store.datastore
    .createQuery(ds.KIND.WISH_ATTACHMENT_ITEM)
    .hasAncestor(parentKey)
    .filter('item_id', '=', item_id)
    .limit(1);

  // put entity
  return await store.datastore
    .runQuery(query)
    .then((results) => {
      let entities = results[0];
      if (!entities[0]) {
        return null;
      }
      entities[0]['key_id'] = entities[0][store.datastore.KEY].id;
      return entities[0];
    })
    .catch((err) => {
      throw err;
    });
};

/**
 * Create Wish and AttachmentItem
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} item_id Attachment商品ID
 *
 * @return {Boolean} is created flag
 */
const createWishForAttachment = async ({ ns, hmt_id, item_id }) => {
  try {
    // get wish data from parent kind
    let parentKey = await getWishKey({ ns, hmt_id });
    // Check if Wish data exists. If it doesn't exist, insert a new Wish data.
    if (!parentKey) {
      parentKey = await createWish({ ns, hmt_id });
    }
    if (!parentKey) {
      return false;
    }
    const wishResult = await createWishAttachmentItem({ ns, parentKey, item_id });
    const isCreated = wishResult?.key ? true : false;
    return isCreated;
  } catch (err) {
    throw err;
  }
};

/**
 * Get AttachmentItem list by hmt_id
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 *
 * @return {Object} attachment items
 */
const getAttachmentItemList = async ({ ns, hmt_id }) => {
  const wishKey = store.datastore.key({ namespace: ns, path: [ds.KIND.WISH, hmt_id] });
  //Set namespace
  store.datastore.namespace = ns;
  const query = store.datastore.createQuery(ds.KIND.WISH_ATTACHMENT_ITEM).hasAncestor(wishKey);

  // put entity
  return await store.datastore
    .runQuery(query)
    .then((results) => {
      const entities = results[0];
      const itemIds = entities.reduce((itemIdList, entity) => {
        itemIdList.push({
          item_id: entity.item_id,
          cdt: entity.cdt,
          udt: entity.udt,
        });
        return itemIdList;
      }, []);
      return itemIds;
    })
    .catch((err) => {
      throw err;
    });
};

/**
 * Delete AttachmentItem
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} item_id Attachment商品ID
 *
 * @return {Boolean} is deleted flag
 */
const deleteAttachmentItem = async ({ ns, hmt_id, item_id }) => {
  try {
    const wishAttachmentItem = await findAttachmentItem({ ns, hmt_id, item_id });
    const id = wishAttachmentItem.key_id;
    // Key生成
    const key = store.datastore.key({
      namespace: ns,
      path: [ds.KIND.WISH, hmt_id, ds.KIND.WISH_ATTACHMENT_ITEM, Number(id)],
    });

    const isDeleted = await store
      .deleteEntity(key)
      .then((key) => {
        if (key) {
          return true;
        }
        return false;
      })
      .catch((err) => {
        throw err;
      });
    return isDeleted;
  } catch (err) {
    throw err;
  }
};

/**
 * Insert SpecialTagItem data.
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} parent_key Entity group parent key
 * @param {string} specialtag_item_key SpecialTag商品のkey
 * @param {string} tag_id
 *
 * @return {Promise}
 */
 const createWishSpecialTagItem = ({ ns, parent_key, specialtag_item_key, tag_id }) => {
  const key = store.datastore.key({
    namespace: ns,
    path: [ds.KIND.WISH, parent_key, ds.KIND.WISH_SPECIALTAG_ITEM],
  });
  const date = new Date();
  const data = [
    {
      name: 'specialtag_item_key',
      value: specialtag_item_key,
    },
    {
      name: 'tag_id',
      value: tag_id,
    },
    {
      name: 'cdt',
      value: date,
    },
    {
      name: 'udt',
      value: date,
    },
  ];
  const entity = {
    key: key,
    data: data,
  };
  return new Promise((resolve, reject) => {
    store
      .putEntity(entity)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

/**
 * Get 1 SpecialTagItem by SpecialTagItemID
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} specialtag_item_key SpecialTag商品Key
 *
 * @return {Object} SpecialTagItems
 */
const findSpecialTagItem = async ({ ns, hmt_id, specialtag_item_key }) => {
  // Set namespace
  store.datastore.namespace = ns;
  const parent_key = store.datastore.key({ namespace: ns, path: [ds.KIND.WISH, hmt_id] });
  const query = store.datastore
    .createQuery(ds.KIND.WISH_SPECIALTAG_ITEM)
    .hasAncestor(parent_key)
    .filter('specialtag_item_key', '=', specialtag_item_key)
    .limit(1);

  // put entity
  return await store.datastore
    .runQuery(query)
    .then((results) => {
      let entities = results[0];
      if (!entities[0]) {
        return null;
      }
      entities[0]['key_id'] = entities[0][store.datastore.KEY].id;
      return entities[0];
    })
    .catch((err) => {
      throw err;
    });
};

/**
 * Get SpecialTagItem list by hmt_id
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 *
 * @return {Object} specialTag items
 */
const getSpecialTagItemList = async ({ ns, hmt_id }) => {
  const wish_key = store.datastore.key({ namespace: ns, path: [ds.KIND.WISH, hmt_id] });
  //Set namespace
  store.datastore.namespace = ns;
  const query = store.datastore.createQuery(ds.KIND.WISH_SPECIALTAG_ITEM).hasAncestor(wish_key);

  // put entity
  return await store.datastore
    .runQuery(query)
    .then((results) => {
      const item_keys = results[0].reduce((key_list, entity) => {
        key_list.push({
          item_key: entity.specialtag_item_key,
          tag_id: entity.tag_id,
          cdt: entity.cdt,
          udt: entity.udt,
        });
        return key_list;
      }, []);
      return item_keys;
    })
    .catch((err) => {
      throw err;
    });
};

/**
 * Add SpecialTag item to Wish
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} specialtag_item_key SpecialTag商品ID
 * @param {string} tag_id
 *
 * @return {Boolean} is created flag
 */
const createSpecialTag = async ({ ns, hmt_id, specialtag_item_key, tag_id }) => {
  try {
    // get wish data from parent kind
    let parent_key = await getWishKey({ ns, hmt_id });
    // Check if Wish data exists. If it doesn't exist, insert a new Wish data.
    if (!parent_key) {
      parent_key = await createWish({ ns, hmt_id });
    }
    if (!parent_key) {
      return false;
    }
    const result = await createWishSpecialTagItem({ ns, parent_key, specialtag_item_key, tag_id });
    const isCreated = result?.key ? true : false;
    return isCreated;
  } catch (err) {
    throw err;
  }
};

/**
 * Delete SpecialTagItem
 *
 * @param {Object} {*}
 * @param {string} ns namespace
 * @param {string} hmt_id
 * @param {string} specialtag_item_key SpecialTag商品ID
 *
 * @return {Boolean} is deleted flag
 */
const deleteSpecialTag = async ({ ns, hmt_id, specialtag_item_key }) => {
  try {
    const wish_specialtag_item = await findSpecialTagItem({ ns, hmt_id, specialtag_item_key });
    const id = wish_specialtag_item.key_id;
    // Key生成
    const key = store.datastore.key({
      namespace: ns,
      path: [ds.KIND.WISH, hmt_id, ds.KIND.WISH_SPECIALTAG_ITEM, Number(id)],
    });

    const is_deleted = await store
      .deleteEntity(key)
      .then((key) => {
        if (key) {
          return true;
        }
        return false;
      })
      .catch((err) => {
        throw err;
      });
    return is_deleted;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createWishForAttachment,
  findAttachmentItem,
  getAttachmentItemList,
  deleteAttachmentItem,
  findSpecialTagItem,
  getSpecialTagItemList,
  createSpecialTag,
  deleteSpecialTag,
};
