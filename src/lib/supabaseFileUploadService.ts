import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export interface FileUploadOptions {
  bucket: string;
  path?: string;
  public?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export class SupabaseFileUploadService {
  private readonly defaultOptions: FileUploadOptions = {
    bucket: 'luxe-media',
    public: true,
    maxSize: 10 * 1024 * 1024, // 10MB default
    allowedTypes: ['image/*', 'video/*', 'application/pdf']
  };

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    options: Partial<FileUploadOptions> = {}
  ): Promise<UploadResult> {
    try {
      const config = { ...this.defaultOptions, ...options };
      
      // Validate file
      const validation = this.validateFile(file, config);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      // Generate unique filename
      const fileName = this.generateFileName(file);
      const filePath = options.path ? `${options.path}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL if public access is enabled
      let publicUrl = '';
      if (config.public) {
        const { data: urlData } = supabase.storage
          .from(config.bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      console.log('File uploaded successfully:', { path: filePath, url: publicUrl });
      
      return {
        success: true,
        url: publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: Partial<FileUploadOptions> = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload property images
   */
  async uploadPropertyImages(
    files: File[],
    propertyId: string
  ): Promise<UploadResult[]> {
    return this.uploadMultipleFiles(files, {
      bucket: 'luxe-properties',
      path: `properties/${propertyId}/images`,
      allowedTypes: ['image/*']
    });
  }

  /**
   * Upload destination images
   */
  async uploadDestinationImages(
    files: File[],
    destinationId: string
  ): Promise<UploadResult[]> {
    return this.uploadMultipleFiles(files, {
      bucket: 'luxe-destinations',
      path: `destinations/${destinationId}/images`,
      allowedTypes: ['image/*']
    });
  }

  /**
   * Upload banner media (images/videos)
   */
  async uploadBannerMedia(
    file: File,
    bannerId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'luxe-banners',
      path: `banners/${bannerId}`,
      allowedTypes: ['image/*', 'video/*']
    });
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(
    bucket: string,
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Supabase delete error:', error);
        return { success: false, error: error.message };
      }

      console.log('File deleted successfully:', path);
      return { success: true };

    } catch (error) {
      console.error('File deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deletion error'
      };
    }
  }

  /**
   * Get file URL (public or signed)
   */
  async getFileUrl(
    bucket: string,
    path: string,
    signed: boolean = false,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      if (signed) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);

        if (error) {
          console.error('Signed URL error:', error);
          return null;
        }

        return data.signedUrl;
      } else {
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(path);

        return data.publicUrl;
      }
    } catch (error) {
      console.error('Get file URL error:', error);
      return null;
    }
  }

  /**
   * List files in a bucket/folder
   */
  async listFiles(
    bucket: string,
    path: string = ''
  ): Promise<{ name: string; size: number; updated_at: string }[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      return data.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        updated_at: file.updated_at
      }));

    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: FileUploadOptions): { success: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize!) {
      return {
        success: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(options.maxSize! / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const isAllowed = options.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        };
      }
    }

    return { success: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Create storage buckets if they don't exist
   * Note: This requires admin privileges
   */
  async createStorageBuckets(): Promise<void> {
    const buckets = [
      { name: 'luxe-media', public: true },
      { name: 'luxe-properties', public: true },
      { name: 'luxe-destinations', public: true },
      { name: 'luxe-banners', public: true },
      { name: 'luxe-documents', public: false }
    ];

    for (const bucket of buckets) {
      try {
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.public ? ['image/*', 'video/*'] : ['application/pdf', 'text/*'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        });

        if (error && error.message !== 'Bucket already exists') {
          console.warn(`Could not create bucket ${bucket.name}:`, error.message);
        } else {
          console.log(`Bucket ${bucket.name} ready`);
        }
      } catch (error) {
        console.warn(`Could not create bucket ${bucket.name}:`, error);
      }
    }
  }
}

// Export singleton instance
export const supabaseFileUploadService = new SupabaseFileUploadService();
