const express = require("express");
const multipart = require("multer");
const upload = multipart();
const {
  GenRandomToken,
  GetMerkleProof,
  getMerkleRootHash,
  RemoveFromWhitelist,
  AddToWhitelist,
} = require("../tools/utils");
const { IsAuthenticated } = require("../config/Auth");
const Excluded = require("../models/Excluded");
const router = express.Router();

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
    if (tokenId) {
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
    } else {
      return res.send({ message: "Resulted with Error", code: "nok" });
    }
    //}
  });
  //}
});

module.exports = router;
