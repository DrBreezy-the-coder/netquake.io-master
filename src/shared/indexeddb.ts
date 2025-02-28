import { AssetMeta } from './types/Store';

type DbAssetMeta = {
  fileCount: number
  fileName: string
  game: string
}

const dbName = 'webQuakeAssets',
  metaStoreName = 'meta',
  assetStoreName = 'assets',
  dbVersion = 5;

const indexedDb: IDBFactory = window.indexedDB
const gameAndFileIndex = "game, filename"
const gameIndex = "game"


function open (): Promise<IDBDatabase> {
  return new Promise(function(resolve, reject){
    var openReq: IDBOpenDBRequest = indexedDb.open(dbName, dbVersion);
    openReq.onupgradeneeded = function(event: any) {
      var db = event.target.result as IDBDatabase;
      if (event.oldVersion < 4) {
        db.createObjectStore("meta", { autoIncrement: true });
        db.createObjectStore("assets", { keyPath: 'assetId' });
      }
      if (event.oldVersion < 5) {
        var metaStore = openReq.transaction.objectStore("meta");
        metaStore.createIndex(gameIndex, "game", { unique: false });
        metaStore.createIndex(gameAndFileIndex, ["game", "fileName"], { unique: false });
      }
    };
    openReq.onerror = function(event) {
      alert("Why didn't you allow my web app to use IndexedDB?!");
      reject()
    };
    openReq.onsuccess = function(event: any){
      resolve(event.target.result);
    };
  });
}

const promiseMe = <T>(request: IDBRequest): Promise<T> => {
  return new Promise((resolve, reject) =>  {
    request.onerror = function(e) {
      console.log(e);
      reject(e);
    };
    request.onsuccess = function(event) {
      resolve(request.result as T);
    };
  })
}

const dbOperation = async <T>(storeName: string, fn: (db: IDBObjectStore) => IDBRequest): Promise<T> => {
  const db = await open()
  const store = db
    .transaction([storeName], 'readwrite')
    .objectStore(storeName); 

    return new Promise((resolve, reject) =>  {
      const request = fn(store) as IDBRequest;
        
      request.onerror = function(e) {
        console.log(e);
        reject(e);
      };
      request.onsuccess = function(event) {

      resolve(request.result as T);
    };
  })
}

export const getAllMeta = async (): Promise<Array<AssetMeta>> => {
  const db = await open()

  var transaction = db.transaction(['meta'], 'readonly');
  var meta = transaction.objectStore('meta');

  // Select the first matching record, if any exists, assume game exists
  const allKeys = await promiseMe<number[]>(meta.getAllKeys())
  
  return Promise.all(allKeys.map(async key => {
    const metaObj = await promiseMe<DbAssetMeta>(meta.get(key))

    return {
      ...metaObj,
      assetId: key
    }
  }))
}


export const getAllMetaPerGame = async (game: string): Promise<AssetMeta[]> => {
  const assetMetas = await getAllMeta()
  return assetMetas.filter(meta => meta.game === game.toLowerCase())
}

export const getAllAssets = async () => {
  return dbOperation(assetStoreName, store => store.getAll())
}

export const getAllAssetsPerGame = async (game: string) => {
  const assetMetas = await getAllMetaPerGame(game)
  
  return Promise.all(assetMetas.map(async assetMeta => {
    const asset = await dbOperation<{data: ArrayBuffer}>(assetStoreName, store => store.get(assetMeta.assetId))
    return {
      ...assetMeta,
      ...asset
    }
  }))
}

export const getAsset = async (game: string, fileName : string) => {
  const db = await open()

  var transaction = db.transaction(['assets', 'meta'], 'readonly');
  var meta = transaction.objectStore('meta');
  var assets = transaction.objectStore('assets');
  var index = meta.index(gameAndFileIndex);

  // Select the first matching record
  const assetMeta = await promiseMe<DbAssetMeta>(index.get(IDBKeyRange.only([game.toLowerCase(), fileName.toLowerCase()])))
  if (assetMeta) {
    const assetId = await promiseMe<number>(index.getKey(IDBKeyRange.only([game.toLowerCase(), fileName.toLowerCase()])))
    return {
      ...assetMeta,
      ...(await promiseMe<{data: ArrayBuffer}>(assets.get(assetId)))
    }
  }
  return null
} 

export const saveAsset = async (game: string, fileName: string, fileCount: number, blob: ArrayBuffer) => {
  if (!game || !fileName || blob.byteLength <= 0) {
    throw new Error('Missing data while trying to save asset')
  }
  const metaObj: DbAssetMeta = {
    game: game.toLowerCase(),
    fileName: fileName.toLowerCase(),
    fileCount
  }
  const assetId = await dbOperation(metaStoreName, store => store.put(metaObj))
  await dbOperation(assetStoreName, store => store.put({data: blob, assetId}))
  return assetId
}

export const removeAsset = async (assetId: string): Promise<void> => {
  await dbOperation(metaStoreName, store => store.delete(assetId))
  return await dbOperation(assetStoreName, store => store.delete(assetId))
}

export const hasGame = async (game: string) => {
  const db = await open()

  var transaction = db.transaction(['meta'], 'readonly');
  var meta = transaction.objectStore('meta');
  var index = meta.index(gameIndex);

  // Select the first matching record, if any exists, assume game exists
  const assetMeta = await promiseMe<DbAssetMeta>(index.get(IDBKeyRange.only(game.toLowerCase())))
  return !!assetMeta
}

export const removeGame = async (game: string) => {
  const db = await open()

  var transaction = db.transaction([metaStoreName, assetStoreName], 'readwrite')
  var metas = transaction.objectStore(metaStoreName)
  var assets = transaction.objectStore(assetStoreName)
  var metaGameIndex = metas.index(gameIndex)

  const assetMetaKeys = await promiseMe<number[]>(metaGameIndex.getAllKeys(IDBKeyRange.only(game.toLowerCase())))

  return Promise.all(assetMetaKeys.map((key: number) =>
    Promise.all([
      promiseMe(assets.delete(key)),
      promiseMe(metas.delete(key))
    ])
  ))
}

