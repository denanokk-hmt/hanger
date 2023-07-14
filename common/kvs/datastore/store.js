'use strict'

// Instantiate a datastore client
//gcloud beta emulators datastore start --data-dir /Users/tahi/watson/datastore/emulator_data
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
module.exports.datastore = datastore;


/**
 * Insert/Update session
 * @param {*} entity 
 */
const putEntity = entity => {
  return datastore.save(entity)
    .then(() => {
      return entity;
    })
    .catch(err => {
      return err;
    });
}

module.exports.putEntity = putEntity;

/**
 * Upsert multiple entities in transaction.
 * @param {*} entities
 * @returns 
 */
const putEntities = async (entities) => {
  const transaction = datastore.transaction();
  await transaction.run();
  for (const entity of entities) {
    transaction.upsert(entity);
  }
  try {
    const result = transaction.commit();
    return result;
  } catch(e) {
    transaction.rollback();
    throw e;
  }
}

module.exports.putEntities = putEntities;

/**
 * Update session
 * @param {*} entity
 */
 const updateEntity = entity => {
  return datastore.update(entity)
    .then(() => {
      return entity;
    })
    .catch(err => {
      return err;
    });
};

module.exports.updateEntity = updateEntity;

/**
 * Delete
 * @param {*} entity 
 */
 const deleteEntity = key => {
  return datastore.delete(key)
    .then(() => {
      return key;
    })
    .catch(err => {
      return err;
    });
}
module.exports.deleteEntity = deleteEntity;

/**
 * Get entity by Ancestor key
 * @param {*} pKind 
 * @param {*} key 
 * @param {*} cKind 
 */
const getByAncestorKey = (ns, pKind, key, cKind) => {

  datastore.namespace = ns

  const ancestorKey = datastore.key([ pKind, key, ])
  
  const query = datastore.createQuery(cKind).hasAncestor(ancestorKey);
  
  return datastore.runQuery(query)
    .then((results) => {
      const entities = results[0];
      return entities;
    })
    .catch(err => {
      return err;
    });
}
module.exports.getByAncestorKey = getByAncestorKey;

/**
 * Get entity by key
 * @param {string} ns
 * @param {string} kind 
 * @param {string/int} key
 * @param {boolean} customNm (true/false)
 */
const getEntityByKey = ({ns, kind, key, customNm}) => {  

  const key_val = (customNm)? String(key) : Number(key)

  datastore.namespace = ns  
  const query = datastore
    .createQuery(kind)
    .filter('__key__', '=', datastore.key([kind, key_val]));
  
    return datastore.runQuery(query)
      .then((values) => {
        const entity = values[0];
        if (entity.length == 0) {
          return null;
        } else {
          return entity
        }
      })
      .catch(err => {
        throw err;
      });
}
module.exports.getEntityByKey = getEntityByKey;