const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// DB MODELS
const Excluded = require("../models/Excluded");
const Whitelist = require("../models/Whitelist");

// CONSTANT
const TOTAL_CELESTIAL = 10001;
const CELESTIAL_TYPES = { 1: 8000, 2: 9950, 3: 10000 };

function AddToWhitelist(_address, callback) {
  Whitelist.find({})
    .then((list) => {
      let obj = [];
      if (list.length > 0) {
        obj = list[0].list;
        index = obj.indexOf(_address);
        if (index < 0) {
          obj.push(_address);
        }
        Whitelist.findByIdAndUpdate({ _id: list[0]._id }, { list: obj }).catch((err) => {
          console.log(err);
        });
        callback(true);
      } else {
        obj.push(_address);
        const whitelist = new Whitelist({
          list: obj,
        });
        whitelist.save();
        callback(true);
      }
    })
    .catch((err) => {
      console.log(err);
      callback(false);
    });
}
function RemoveFromWhitelist(_address, callback) {
  Whitelist.find({})
    .then((list) => {
      let obj = [];
      if (list.length > 0) {
        obj = list[0].list;
        index = obj.indexOf(_address);
        obj.splice(index, 1);
        Whitelist.findByIdAndUpdate({ _id: list[0]._id }, { list: obj }).catch((err) => {
          console.log(err);
        });
        callback(true);
      } else {
        callback(false);
      }
    })
    .catch((err) => {
      console.log(err);
      callback(false);
    });
}
function GetMerkleProof(_address, callback) {
  Whitelist.find({})
    .then((addresses) => {
      let obj = [];
      if (addresses.length > 0) {
        obj = addresses[0].list;
      }
      const leafNode = obj.map((addr) => keccak256(addr));
      const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
      const address = keccak256(_address);
      const merkeProof = merkleTree.getHexProof(address);
      callback(merkeProof);
    })
    .catch((err) => {
      callback(null);
      console.log(err);
    });
}
function getMerkleRootHash(callback) {
  Whitelist.find({})
    .then((adresses) => {
      let obj = [];
      if (adresses.length > 0) {
        obj = adresses[0].list;
      }
      const leafNode = obj.map((addr) => keccak256(addr));
      const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
      const rootHash = merkleTree.getRoot();
      callback(rootHash);
    })
    .catch((err) => {
      callback(null);
      console.log(err);
    });
}

function GenRandomToken(callback) {
  Excluded.find({})
    .then((result) => {
      let obj = {};
      if (result.length > 0) {
        obj = result[0].excludeJson;
      } else {
        obj[1] = TOTAL_CELESTIAL;
      }
      let length = Object.keys(obj).length;
      let random = Math.floor(Math.random() * length);
      let min = Number(Object.keys(obj)[random]);
      let max = Number(obj[min]);
      let tokenId = Math.floor(Math.random() * (max - min) + min);
      let celestialType = GetType(tokenId);
      callback(tokenId, celestialType);

    })
    .catch((err) => {
      console.log(err);
    });
}

function GetType(tokenId) {
  if (tokenId <= CELESTIAL_TYPES[1]) {
    return 1;
  } else if (tokenId <= CELESTIAL_TYPES[2]) {
    return 2;
  } else {
    return 3;
  }
}

function GetChunkByTokenId(tokenId,obj){
  let filtered = Object.entries(obj).filter(([key,value])=>tokenId >= key && tokenId < value)
  return filtered[0]
}

function UpdateExclude(tokenId, callback) {
  Excluded.find({})
    .then((result) => {
      let obj = {};
      if (result.length > 0) {
        obj = result[0].excludeJson;
      } else {
        obj[1] = TOTAL_CELESTIAL;
      }
      let chunk = GetChunkByTokenId(tokenId,obj)
      let [key,value] = chunk;
      key = Number(key)
      value = Number(value)
      delete obj[key];

      if (tokenId - key > 0) {
        obj[key] = tokenId;
      }
      if (value - (tokenId + 1) > 0) {
        obj[tokenId + 1] = value;
      }

      if (result.length > 0) {
        Excluded.findOneAndUpdate({ _id: result[0]._id }, { excludeJson: obj })
          .then((res) => {
            callback(true);
          })
          .catch((err) => {
            console.log(err);
            callback(false)
          });
      } else {
        const exclude = new Excluded({
          excludeJson: obj,
        });
        exclude.save();
      }
    })
    .catch((err) => {
      callback(false)
    });
}

module.exports = {
  GenRandomToken,
  GetMerkleProof,
  getMerkleRootHash,
  TOTAL_CELESTIAL,
  AddToWhitelist,
  RemoveFromWhitelist,
  UpdateExclude
};
