import express from "express";
import { addNewFile, getFile, removeFile, renameFile } from "../controllers/file.controller.js";
const router = express.Router();

router.get("/:fileId", getFile)
router.patch("/:fileId", renameFile)
router.post('/:dirId',addNewFile)
router.delete("/:fileId", removeFile)

export default router;