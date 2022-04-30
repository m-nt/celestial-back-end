const express = require("express");
const multipart = require("multer");
const upload = multipart();
const {
  GenRandomToken,
  GetMerkleProof,
  getMerkleRootHash,
  RemoveFromWhitelist,
  AddToWhitelist,
  TOTAL_CELESTIAL,
} = require("../tools/utils");
const { IsAuthenticated } = require("../config/Auth");
const Excluded = require("../models/Excluded");
const Whitelist = require("../models/Whitelist");
const router = express.Router();

router.post("/getwhitelists", upload.none(), IsAuthenticated, (req, res) => {
  Whitelist.find({})
    .then((list) => {
      let obj = [];
      if (list.length > 0) {
        obj = list[0].list;
      }
      return res.send({ message: "Whitelist: ", whitelist: obj, code: "ok" });
    })
    .catch((err) => {
      return res.send({ message: err, code: "nok" });
    });
});

router.delete("/resetexcludes", upload.none(), IsAuthenticated, (req, res) => {
  Excluded.find({})
    .then((list) => {
      let obj = { 1: TOTAL_CELESTIAL };
      if (list.length > 0) {
        Excluded.findOneAndUpdate({ _id: list[0]._id }, { excludeJson: obj })
          .then((res) => {
            return res.send({ message: "Exclude List has been reset", code: "ok" });
          })
          .catch((err) => {
            return res.send({ message: err, code: "nok" });
          });
      } else {
        return res.send({ message: "Exclude List has been reset", code: "ok" });
      }
    })
    .catch((err) => {
      return res.send({ message: err, code: "nok" });
    });
});

router.post("/getmerkleroot", upload.none(), IsAuthenticated, (req, res) => {
  getMerkleRootHash(_address, (merkleProof) => {
    return res.send({ message: "merkle root hash:", code: "ok", merkleProof: merkleProof });
  });
});

router.post("/getmerkleproof", upload.none(), (req, res) => {
  const { _address } = req.body;
  if (!_address) {
    return res.send({ message: "address must be included", code: "nok" });
  }
  GetMerkleProof(_address, (merkleProof) => {
    return res.send({ message: "merkle proof:", code: "ok", merkleProof: merkleProof });
  });
});

router.put("/whitelist", upload.none(), IsAuthenticated, (req, res) => {
  const { _address } = req.body;
  if (!_address) {
    return res.send({ message: "address must be included", code: "nok" });
  }
  AddToWhitelist(_address, (response) => {
    if (response) {
      GetMerkleProof(_address, (merkleProof) => {
        return res.send({ message: "address successfully added to whitelist", code: "ok", merkleProof: merkleProof });
      });
    } else {
      return res.send({ message: "address didn't added to whitelist", code: "nok" });
    }
  });
});
router.delete("/whitelist", upload.none(), IsAuthenticated, (req, res) => {
  const { _address } = req.body;
  if (!_address) {
    return res.send({ message: "address must be included", code: "nok" });
  }
  RemoveFromWhitelist(_address, (response) => {
    if (response) {
      return res.send({ message: "address successfully removed from whitelist", code: "ok" });
    } else {
      return res.send({ message: "address didn't removed from whitelist", code: "nok" });
    }
  });
});
router.post("/requesttoken", upload.none(), (req, res) => {
  const { owner } = req.body;
  //ganarate tokenIds
  if (!owner) {
    return res.send({ message: "owner address must ne included !", code: "nok" });
  }
  let tokenIds = 0;
  let celestialTypes = 0;
  //for (let i = 0; i < qty; i++) {
  GenRandomToken((tokenId, celestialType) => {
      tokenIds = tokenId;
      celestialTypes = celestialType;
      //if (i == qty - 1) {
      //get whitelist merkle proof
      GetMerkleProof(owner, (merkleProof) => {
        return res.send({
          message: "Request was seccussfull",
          code: "ok",
          tokenId: tokenIds,
          celestialType: celestialTypes,
          merkleProof: merkleProof,
        });
      }); 
    
    //}
  });
  //}
});

module.exports = router;
