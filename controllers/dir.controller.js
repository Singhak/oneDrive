import { randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import folderDB from '../db/dirDB.json' with { type: 'json' };
import fileDB from '../db/fileDB.json' with { type: 'json' };
import path from "node:path";

export const createFolder = async (req, res) => {
    const parentDirId = req.params.dirId || 'root';
    try {
        const { dirname } = req.body
        const id = randomUUID()
        const parentFolderDetail = folderDB.find(
            (folder) => {
                return folder.id === parentDirId
            });
        if (!parentDirId) {
            return res.status(404).json({ message: 'Unable to create folder', success: false, data: null })
        }
        const folderMeta = {
            id,
            name: dirname,
            files: [],
            parent: parentDirId,
            subfolder: []
        }
        parentFolderDetail['subfolder'].push(id)
        folderDB.push(folderMeta);
        await writeFile('./db/dirDB.json', JSON.stringify(folderDB));
        return res.status(200).json({ message: 'Folder Created successfully', success: true, data: null })
    } catch (error) {
        console.log('dir.controller.js - createFolder', error)
        return res.status(500).json({ message: 'Unable to create folder', success: false, data: null })
    }
}

export const removeFolder = async (req, res) => {
    const { dirId } = req.params;
    if (!dirId) {
        return res.status(400).json({ message: 'Folder is not provide to delete', success: false, data: null });
    }

    try {
        const folderToDelete = folderDB.find((folder) => folder.id === dirId);
        const folderIdsToDelete = [folderToDelete.id, ...folderToDelete.subfolder];
        const parentFolderIndex = folderDB.findIndex((folder) => folder.id === folderToDelete.parent)
        folderDB[parentFolderIndex].subfolder = folderDB[parentFolderIndex].subfolder.filter((sub) => sub === folderToDelete.id)
        for (let folderId of folderIdsToDelete) {
            const folderIndex = folderDB.findIndex((folder) => folder.id === folderId);
            const [deletedFolders] = folderDB.splice(folderIndex, 1);
            for (const fileId of deletedFolders.files) {
                const fileIndex = fileDB.findIndex((file) => file.id == fileId);
                const [deletedFile] = fileDB.splice(fileIndex, 1)
                await rm(`./storage/${fileId}${path.extname(deletedFile.name)}`, { recursive: true });
            }
        }
        await writeFile('./db/dirDB.json', JSON.stringify(folderDB, { space: 4 }));
        await writeFile('./db/fileDB.json', JSON.stringify(fileDB, { space: 4 }));
        return res.status(200).json({ message: 'Folder deleted successfully', success: true, data: null })
    } catch (error) {
        console.log('dir.controller.js', error)
        return res.status(500).json({ message: 'Unable to delete folder', success: false, data: null });
    }
}