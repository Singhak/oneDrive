import express from "express";
import { addNewFile, getFile, renameFile } from "../controllers/file.controller.js";
const router = express.Router();

router.get("/:fileId", getFile)
router.patch("/:fileId", renameFile)
router.post('/:dirId',addNewFile)

export default router;