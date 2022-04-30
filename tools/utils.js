const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// DB MODELS
const Excluded = require("../models/Excluded");
const Whitelist = require("../models/Whitelist");
const { json } = require("express/lib/response");
const { findOneAndUpdate } = require("../models/Excluded");

// CONSTANT
const TOTAL_CELESTIAL = 17;
const CELESTIAL_TYPES = { 1: 10, 2: 15, 3: 16 };

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
        console.log(`obj:${obj} - index:${index}`);
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
      if (addresses.length > 0) {
        obj = address[0].list;
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
      UpdateExclude(min, tokenId, (res) => {
        if (res) {
          callback(tokenId, celestialType);
        } else {
          callback(null, null);
        }
      });
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

function UpdateExclude(key, random, callback) {
  Excluded.find({})
    .then((result) => {
      let obj = {};
      if (result.length > 0) {
        obj = result[0].excludeJson;
      } else {
        obj[1] = TOTAL_CELESTIAL;
      }
      let value = Number(obj[key]);
      delete obj[key];

      if (random - key > 0) {
        obj[key] = random;
      }
      if (value - (random + 1) > 0) {
        obj[random + 1] = value;
      }

      if (result.length > 0) {
        Excluded.findOne({ excludeJson: result[0].excludeJson })
          .then((res) => {
            if (res) {
              callback(false);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        Excluded.findOneAndUpdate({ _id: result[0]._id }, { excludeJson: obj })
          .then((res) => {
            callback(true);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        const exclude = new Excluded({
          excludeJson: obj,
        });
        exclude.save();
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  GenRandomToken,
  GetMerkleProof,
  getMerkleRootHash,
  TOTAL_CELESTIAL,
  AddToWhitelist,
  RemoveFromWhitelist,
};
