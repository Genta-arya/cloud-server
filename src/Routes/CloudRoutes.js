import express from "express";


import { upload } from "../Config/Multer.js";
import { handleDelete, handleUpload } from "../Controller/Cloud.controller.js";


export const Routes = express.Router();
// handle keduanya: 'file' (single) dan 'file[]' (array)
Routes.post('/uploads.php', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'file[]', maxCount: 10 },
]), handleUpload);



Routes.post('/delete', handleDelete);

