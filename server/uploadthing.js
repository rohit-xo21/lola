const { createUploadthing } = require('uploadthing/express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

const f = createUploadthing();

const auth = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Unauthorized');
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: decoded.id };
  } catch {
    throw new Error('Unauthorized');
  }
};

const uploadRouter = {
  // Handles images and PDFs (blob covers all binary files incl. PDFs)
  fileUploader: f({
    image: { maxFileSize: '32MB', maxFileCount: 1 },
    blob: { maxFileSize: '32MB', maxFileCount: 1 },
  })
    .middleware(({ req }) => auth(req))
    .onUploadComplete(({ metadata, file }) => {
      console.log('[UploadThing] Upload complete for userId:', metadata.userId);
      console.log('[UploadThing] File URL:', file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
};

module.exports = { uploadRouter };
