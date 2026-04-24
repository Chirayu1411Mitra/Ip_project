import multer from "multer";

// Use memory storage — file stays in buffer, we upload to S3 directly
const storage = multer.memoryStorage();

// Allow common file types for announcements
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, Word, Excel, PowerPoint, images, and text files are allowed"
      ),
      false
    );
  }
};

const announcementUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max for announcements
    files: 10, // Max 10 files per announcement
  },
});

export default announcementUpload;
