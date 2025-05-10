import {
  BlobWriter,
  ZipWriter,
} from '@zip.js/zip.js';

export class ZipCompressor {
  static async compressFiles(files: File[]): Promise<Blob> {
    try {
      // Create a BlobWriter for the zip file
      const zipWriter = new ZipWriter(new BlobWriter());

      // Add each file to the zip file
      const promises = files.map(async (file) => {
        const fileStream = file.stream();
        await zipWriter.add(file.name, fileStream);
      });

      // Wait for all files to be added
      await Promise.all(promises);

      // Close the zip writer
      return await zipWriter.close();
    } catch (error) {
      console.error('Error al comprimir archivos:', error);
      throw error;
    }
  }
}
