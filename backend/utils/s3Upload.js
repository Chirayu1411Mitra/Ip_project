import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET;

/**
 * Uploads a file buffer to S3 and returns the generated key
 */
export const uploadFileToS3 = async (fileBuffer, originalName, mimetype) => {
  const fileExtension = originalName.split(".").pop();
  const randomName = crypto.randomBytes(16).toString("hex");
  const s3Key = `notes/${randomName}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);
  return s3Key;
};

/**
 * Generates a presigned URL for viewing/downloading an object
 */
export const getPresignedUrl = async (s3Key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  // URL valid for 1 hour by default
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};

/**
 * Deletes an object from S3
 */
export const deleteFileFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  await s3Client.send(command);
};
