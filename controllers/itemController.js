
const ItemModel = require("../models/itemModel.js")

async function getItems (req, res) {
    try{
        const getItem = await ItemModel.getAllItems();
        res.json(getItem)
    }catch (err) {
        res.status(500).json({error: err.message})
    }
}

async function getItem (req,res) {
    try{
        const {id} = req.params;
        const item = await ItemModel.getItemById(id);
        if(!item) {
            return res.status(404).json({error: "Item not found."})
        }
        res.json(item)

    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

async function createnewItem (req,res) {
    try{
        const newItem = await ItemModel.createItem(req.body)
        res.json(newItem)

    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

async function updateExisting (req,res) {
    try{
        
        const updated = await ItemModel.updateItem(req.params.id, req.body)
        if(!updated) {
            return res.status(404).json({error:"Item not found"})
        }
        res.json(updated)

    } catch (err) {
        res.status(500).json({})
    }
}

async function deleteExisting (req,res) {
    try{
        const {id} = req.params;
        await ItemModel.deleteItem(id)
        res.json({message: "Item deleted successfully."})

    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = {
    getItems,
    getItem,
    createnewItem,
    updateExisting,
    deleteExisting
}