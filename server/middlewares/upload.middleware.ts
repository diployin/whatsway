import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { createDOClient } from "../config/digitalOceanConfig";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const allowedTypes = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg",
  "image/x-icon", "image/vnd.microsoft.icon",
  "video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov",
  "audio/mp3", "audio/wav", "audio/ogg", "audio/mpeg", "audio/m4a",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// Extend Express.Multer.File to include cloudUrl for uploaded file info
declare global {
  namespace Express {
    interface Multer {
      File: {
        cloudUrl?: string;
      };
    }
  }
}

// Local storage setup
const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (
  req: Request & { fileFilterError?: string },
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else {
    req.fileFilterError = `Unsupported file type: ${file.mimetype}`;
    cb(null, false);
  }
};

// Multer instance (always store locally first)
export const upload = multer({
  storage: localStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter,
});

// Middleware to upload to DigitalOcean Spaces (if active)
export const handleDigitalOceanUpload = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doClient = await createDOClient();
    if (!doClient) {
      return next(); // fallback to local
    }

    const { s3, bucket } = doClient;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next();
    }

    for (const file of files) {
      const fileBuffer = fs.readFileSync(file.path);
      const fileKey = `uploads/${Date.now()}-${path.basename(file.originalname)}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket!,
          Key: fileKey,
          Body: fileBuffer,
          ACL: "public-read",
          ContentType: file.mimetype,
        })
      );

      // Construct file URL based on endpoint and bucket
      const endpoint = new URL(doClient.endpoint || "");
      file.cloudUrl = `https://${bucket}.${endpoint.host}/${fileKey}`;

      // Remove local file after upload
      fs.unlinkSync(file.path);
    }

    next();
  } catch (error) {
    console.error("❌ DigitalOcean Upload Error:", error);
    next();
  }
};
