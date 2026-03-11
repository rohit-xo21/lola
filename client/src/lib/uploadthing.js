import { generateReactHelpers } from '@uploadthing/react';

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/uploadthing`,
});
