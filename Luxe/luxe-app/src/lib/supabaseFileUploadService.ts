import { getSupabaseClient } from './supabase';

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
      const supabase = getSupabaseClient();
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
    propertyId?: string
  ): Promise<UploadResult[]> {
    const options: Partial<FileUploadOptions> = {
      bucket: 'luxe-properties',
      path: propertyId ? `properties/${propertyId}` : 'properties',
      allowedTypes: ['image/*']
    };
    
    return this.uploadMultipleFiles(files, options);
  }

  /**
   * Upload destination images
   */
  async uploadDestinationImages(
    files: File[],
    destinationId?: string
  ): Promise<UploadResult[]> {
    const options: Partial<FileUploadOptions> = {
      bucket: 'luxe-destinations',
      path: destinationId ? `destinations/${destinationId}` : 'destinations',
      allowedTypes: ['image/*']
    };
    
    return this.uploadMultipleFiles(files, options);
  }

  /**
   * Upload banner images/videos
   */
  async uploadBannerMedia(
    files: File[]
  ): Promise<UploadResult[]> {
    const options: Partial<FileUploadOptions> = {
      bucket: 'luxe-banners',
      path: 'banners',
      allowedTypes: ['image/*', 'video/*']
    };
    
    return this.uploadMultipleFiles(files, options);
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(
    filePath: string,
    bucket: string = 'luxe-media'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return { success: false, error: error.message };
      }

      console.log('File deleted successfully:', filePath);
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
   * Get file URL
   */
  getFileUrl(
    filePath: string,
    bucket: string = 'luxe-media'
  ): string {
    try {
      const supabase = getSupabaseClient();
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(
    filePath: string,
    bucket: string = 'luxe-media',
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, url: data.signedUrl };

    } catch (error) {
      console.error('Signed URL generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown signed URL error'
      };
    }
  }

  /**
   * List files in a bucket/folder
   */
  async listFiles(
    bucket: string = 'luxe-media',
    folder?: string
  ): Promise<{ success: boolean; files?: any[]; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder || '');

      if (error) {
        console.error('List files error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, files: data };

    } catch (error) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown list files error'
      };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, config: FileUploadOptions): { success: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSize!) {
      return {
        success: false,
        error: `File size (${file.size} bytes) exceeds maximum allowed size (${config.maxSize} bytes)`
      };
    }

    // Check file type
    const isAllowedType = config.allowedTypes!.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2);
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      return {
        success: false,
        error: `File type (${file.type}) is not allowed. Allowed types: ${config.allowedTypes!.join(', ')}`
      };
    }

    return { success: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }
}
