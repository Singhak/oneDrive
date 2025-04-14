import fs from 'node:fs/promises'
import fileDB from '../db/fileDB.json' with { type: 'json' };
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';

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
        return res.status(404).json({ message: 'File renamed successfully', success: true, data: null })
    } catch (error) {
        return res.status(404).json({ message: 'File not found for rename', success: false, data: null })
    }
}

export const addNewFile = (req, res) => {
    try {
        const id = randomUUID();
        const extension = path.extname('bann.jpg');
        const fullFileName = `${id}${extension}`;
        const writeStream = createWriteStream(`./storage/${fullFileName}`);
        req.pipe(writeStream);
        req.on('end', () => {
            res.send()
        })
        // console.log('file.controller.js', req.body, req.params)
        // fs.writeFile('./storage')
    } catch (error) {

    }
}