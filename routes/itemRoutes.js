const { getItem, getItems, createnewItem, updateExisting, deleteExisting } = require( "../controllers/itemController");
const express = require("express")

const router = express.Router()

router.get("/get", getItems)
router.get("/get/:id", getItem)
router.post("/create", createnewItem)
router.put("/update/:id", updateExisting)
router.delete("/delete/:id", deleteExisting)

module.exports = router;