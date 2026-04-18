import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a file buffer to S3
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {{ key: string, url: string }}
 */
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  // Create a unique key: notes/<timestamp>-<sanitized-filename>
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `notes/${Date.now()}-${sanitized}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // Server-side encryption (SSE-S3)
    ServerSideEncryption: "AES256",
  });

  await s3Client.send(command);

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { key, url };
};

/**
 * Delete a file from S3
 * @param {string} key - The S3 object key
 */
export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Generate a signed download URL (valid for 1 hour)
 * @param {string} key - The S3 object key
 * @returns {string} Signed URL
 */
export const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};
