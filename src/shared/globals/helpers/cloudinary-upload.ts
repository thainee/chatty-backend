import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse
} from 'cloudinary';

export async function uploadToCloudinary(
  file: string,
  options: {
    public_id?: string;
    overwrite?: boolean;
    invalidate?: boolean;
  } = {}
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      options,
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}
