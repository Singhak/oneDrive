import express from "express";
import { createFolder, removeFolder } from "../controllers/dir.controller.js";

const router = express.Router();
router.post('/:dirId', createFolder)
router.delete('/:dirId', removeFolder)

export default router