/**
 * Servicio para gestión de imágenes de perfil
 * Maneja subida, validación y almacenamiento de imágenes
 */

interface ImageUploadResult {
  url: string;
  publicId?: string;
}

export interface ImageValidationError {
  type: 'size' | 'format' | 'upload' | 'network';
  message: string;
}

export class ImageService {
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private static readonly COMPRESSION_QUALITY = 0.8;
  private static readonly MAX_DIMENSIONS = { width: 400, height: 400 };

  /**
   * Valida un archivo de imagen
   */
  static validateImageFile(file: File): ImageValidationError | null {
    // Validar tipo de archivo
    if (!this.ALLOWED_FORMATS.includes(file.type)) {
      return {
        type: 'format',
        message: 'Solo se permiten archivos JPG, PNG y WebP'
      };
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        type: 'size',
        message: `El archivo debe ser menor a ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    return null;
  }

  /**
   * Comprime y redimensiona una imagen
   */
  static async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const { width: maxWidth, height: maxHeight } = this.MAX_DIMENSIONS;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          file.type,
          this.COMPRESSION_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Sube una imagen al servicio de almacenamiento
   * En producción, esto se conectaría a Cloudinary, AWS S3, etc.
   */
  static async uploadImage(file: File, userId: string): Promise<ImageUploadResult> {
    try {
      // Validar archivo
      const validationError = this.validateImageFile(file);
      if (validationError) {
        throw new Error(validationError.message);
      }

      // Comprimir imagen
      const compressedFile = await this.compressImage(file);

      // Simular subida a servicio externo
      // En producción, aquí se haría la subida real
      const mockUpload = await this.simulateUpload(compressedFile, userId);
      
      return mockUpload;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error al subir la imagen. Por favor, intenta de nuevo.');
    }
  }

  /**
   * Simula la subida de imagen (para demo)
   * En producción, esto sería reemplazado por la integración real
   */
  private static async simulateUpload(file: File, userId: string): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      // Simular tiempo de subida
      const uploadTime = Math.random() * 2000 + 1000; // 1-3 segundos

      setTimeout(() => {
        try {
          // Crear URL temporal para la imagen
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            
            // En producción, esto sería la URL real del servicio
            const mockUrl = dataUrl;
            
            resolve({
              url: mockUrl,
              publicId: `profile_${userId}_${Date.now()}`
            });
          };
          reader.onerror = () => reject(new Error('Error al procesar la imagen'));
          reader.readAsDataURL(file);
        } catch (error) {
          reject(error);
        }
      }, uploadTime);
    });
  }

  /**
   * Elimina una imagen del servicio de almacenamiento
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      // En producción, aquí se eliminaría la imagen del servicio
      console.log(`Deleting image with publicId: ${publicId}`);
      
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting image:', error);
      // No lanzar error para no bloquear otras operaciones
    }
  }

  /**
   * Genera una URL de avatar por defecto basada en las iniciales del usuario
   */
  static generateDefaultAvatar(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);

    // Generar color basado en el nombre
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    const colorIndex = name.length % colors.length;
    const backgroundColor = colors[colorIndex];

    // Crear SVG de avatar
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${backgroundColor}"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" 
              font-weight="bold" fill="white" text-anchor="middle" 
              dominant-baseline="central">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Obtiene la URL del avatar del usuario con fallback
   */
  static getAvatarUrl(user: { name: string; avatar?: string }): string {
    if (user.avatar && user.avatar.startsWith('http')) {
      return user.avatar;
    }
    if (user.avatar && user.avatar.startsWith('data:')) {
      return user.avatar;
    }
    return this.generateDefaultAvatar(user.name);
  }
}