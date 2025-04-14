import fs, { rm } from 'node:fs/promises'
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import fileDB from '../db/fileDB.json' with { type: 'json' };
import folderDB from '../db/dirDB.json' with { type: 'json' };

export const getFile = (req, res) => {
    const { fileId } = req.params;
    if (!fileId) {
        return res.status(404).json({ message: 'File not found', success: false, data: null })
    }

    try {
        const fileData = fileDB.find((file) => fileId === file.id);
        const extn = path.extname(fileData['name'])
        res.status(200).sendFile(`${process.cwd()}/storage/${fileId}${extn}`)
    } catch (error) {
        return res.status(404).json({ message: 'File not found', success: false })
    }
}

export const renameFile = (req, res) => {
    const { fileId } = req.params;
    const { newName } = req.body;
    if (!fileId) {
        return res.status(404).json({ message: 'File not found for rename', success: false, data: null })
    }
    try {
        const fileData = fileDB.find((file) => fileId === file.id);
        fileData['name'] = newName
        fs.writeFile('./db/fileDB.json', JSON.stringify(fileDB, { space: 4 }))
        return res.status(200).json({ message: 'File renamed successfully', success: true, data: null })
    } catch (error) {
        return res.status(404).json({ message: 'File not found for rename', success: false, data: null })
    }
}

export const addNewFile = (req, res) => {
    try {
        const parentDirId = req.params.dirId || 'root';
        const id = randomUUID();
        const filename = req.headers.filename || 'untitled';
        const extension = path.extname(filename);
        const fullFileName = `${id}${extension}`;
        const writeStream = createWriteStream(`./storage/${fullFileName}`);
        req.pipe(writeStream);
        req.on('end', async () => {
            const fileMeta = {
                id,
                folder: parentDirId,
                name: filename
            }
            const folder = folderDB.find((folder) => folder.id === parentDirId);
            folder.files.push(id);
            fileDB.push(fileMeta)
            await fs.writeFile('./db/dirDB.json', JSON.stringify(folderDB, { space: 4 }))
            await fs.writeFile('./db/fileDB.json', JSON.stringify(fileDB, { space: 4 }))
            res.status(200).json({ message: 'File uploaded successfully', success: true, data: null })
        })
    } catch (error) {
        return res.status(404).json({ message: 'Unable to upload file', success: false, data: null })
    }
}

export const removeFile = async (req, res) => {
    const { fileId } = req.params;
    if (!fileId) {
        return res.status(400).json({ message: 'File is not provide to delete', success: false, data: null });
    }
    const fileIndex = fileDB.findIndex((file) => file.id === fileId);
    if (fileIndex == -1) {
        return res.status(404).json({ message: 'File not found to remove', success: false, data: null });
    }
    try {
        const [deletedFile] = fileDB.splice(fileIndex, 1);
        const extension = path.extname(deletedFile.name);

        const folder = folderDB.find((folder) => folder.id === deletedFile.folder);
        folder.files = folder.files.filter((file) => file !== deletedFile.id);

        await fs.writeFile('./db/dirDB.json', JSON.stringify(folderDB, { space: 4 }));
        await fs.writeFile('./db/fileDB.json', JSON.stringify(fileDB, { space: 4 }));
        await rm(`./storage/${deletedFile.id}${extension}`, { recursive: true });
        res.status(200).json({ message: 'File remove successfully', success: true, data: null });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to remove file', success: false, data: null });
    }
}