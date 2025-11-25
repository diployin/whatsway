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

// Extend Express.Multer.File to include cloudUrl
declare global {
  namespace Express {
    interface Multer {
      File: {
        cloudUrl?: string;
      };
    }
  }
}

// Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Local storage setup with user-specific folders
const localStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as any).user?.id || (req.body?.userId) || "guest";
    const uploadPath = path.join("uploads", userId.toString());
    
    ensureDirectoryExists(uploadPath);
    console.log(`📁 Saving file to local directory: ${uploadPath}`);
    
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log(`📝 Generated filename: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (
  req: Request & { fileFilterError?: string },
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) {
    console.log(`✅ File type accepted: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`❌ File type rejected: ${file.mimetype}`);
    req.fileFilterError = `Unsupported file type: ${file.mimetype}`;
    cb(null, false);
  }
};

// Multer instance
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
    console.log("\n🔍 Checking DigitalOcean Spaces configuration...");
    
    // Check if DO is active
    const doClient = await createDOClient();

    // console.log('doClient:', doClient);
    
    console.log("📊 DO Client Status:", doClient ? "✅ Active" : "❌ Inactive");
    
    // Handle both single file and multiple files
    let files: Express.Multer.File[] = [];
    
    if (req.file) {
      // Single file upload (upload.single())
      files = [req.file];
      console.log("📦 Processing 1 file (single upload)");
    } else if (req.files) {
      // Multiple files upload (upload.array() or upload.fields())
      if (Array.isArray(req.files)) {
        files = req.files;
        console.log(`📦 Processing ${files.length} file(s) (array upload)`);
      } else {
        // upload.fields() returns an object
        files = Object.values(req.files).flat();
        console.log(`📦 Processing ${files.length} file(s) (fields upload)`);
      }
    }

    if (files.length === 0) {
      console.log("⚠️ No files to process");
      return next();
    }

    // If DO is not active, keep files local
    if (!doClient) {
      console.log("💾 DigitalOcean not configured/active, files saved locally");
    console.log(files);
      files.forEach(file => {
        console.log(`   📍 Local path: ${file.path}`);
        console.log(`   🌐 Access URL: /uploads/${path.basename(path.dirname(file.path))}/${file.filename}`);
        file.cloudUrl = `${path.basename(path.dirname(file.path))}/${file.filename}`;
      });
      return next();
    }

    const { s3, bucket, endpoint } = doClient;
    console.log(`☁️ Uploading to DigitalOcean Spaces: ${bucket}`);

    // Upload to DigitalOcean Spaces
    for (const file of files) {
      try {
        console.log(`\n📤 Uploading: ${file.originalname}`);
        console.log(`   Local path: ${file.path}`);
        
        // Check if file exists
        if (!fs.existsSync(file.path)) {
          console.error(`   ❌ File not found: ${file.path}`);
          continue;
        }
        
        // Read file buffer
        const fileBuffer = fs.readFileSync(file.path);
        const { conversationId } = req.params;
        console.log(`   File read successfully: ${file.path} , conversationId: ${conversationId}`);
        const userId = (req as any).user?.id || (req.body?.userId) || conversationId || "guest";
        const fileKey = `uploads/${userId}/${Date.now()}-${path.basename(file.originalname)}`;

        console.log(`   Cloud key: ${fileKey}`);
        console.log(`   File size: ${fileBuffer.length} bytes`);

        // Upload to DO Spaces
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket!,
            Key: fileKey,
            Body: fileBuffer,
            ACL: "public-read",
            ContentType: file.mimetype,
          })
        );

        // Construct cloud URL
        const endpointUrl = new URL(endpoint || "");
        // console.log('endpointUrl:', endpointUrl);
        file.cloudUrl = `https://${bucket}.${endpointUrl.host}/${fileKey}`;

        console.log(`   ✅ Upload successful!`);
        console.log(`   🌐 Cloud URL: ${file.cloudUrl}`);

        // Delete local file after successful upload
        fs.unlinkSync(file.path);
        console.log(`   🗑️ Local file deleted`);
        
      } catch (uploadError) {
        console.error(`   ❌ Upload failed for ${file.originalname}:`, uploadError);
        console.log(`   💾 Keeping local file: ${file.path}`);
        // Keep the local file if upload fails
      }
    }

    next();
  } catch (error) {
    console.error("❌ DigitalOcean Upload Middleware Error:", error);
    console.log("💾 Falling back to local storage");
    // Fallback to local storage on error
    next();
  }
};

// Initialize uploads directory on app start
export const initializeUploadsDirectory = (): void => {
  ensureDirectoryExists("uploads");
  console.log("✅ Uploads directory initialized");
};