export class DocumentsService {
  createPresignedUploadUrl(fileName: string, mimeType: string) {
    if (!fileName || !mimeType) throw new Error('INVALID_FILE_REQUEST');
    return {
      uploadUrl: `https://object-storage.example.com/upload/${encodeURIComponent(fileName)}`,
      objectKey: `cases/${Date.now()}-${fileName}`,
      expiresIn: 600
    };
  }
}
