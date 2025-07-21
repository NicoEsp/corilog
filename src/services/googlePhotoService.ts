
import { APP_CONFIG } from '@/config/constants';

export interface GooglePickerFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export class GooglePhotoService {
  private static instance: GooglePhotoService;

  static getInstance(): GooglePhotoService {
    if (!GooglePhotoService.instance) {
      GooglePhotoService.instance = new GooglePhotoService();
    }
    return GooglePhotoService.instance;
  }

  /**
   * Descarga una imagen desde Google Drive/Photos y la convierte a base64
   */
  async downloadImageAsBase64(file: GooglePickerFile): Promise<string> {
    try {
      console.log('📸 Descargando imagen desde Google:', file.name);
      
      if (!file.webContentLink) {
        throw new Error('No se encontró el enlace de descarga para esta imagen');
      }

      // Hacer la petición con el token de acceso
      const token = window.gapi?.auth2?.getAuthInstance()?.currentUser?.get()?.getAuthResponse()?.access_token;
      
      if (!token) {
        throw new Error('No se encontró el token de acceso de Google');
      }

      const response = await fetch(file.webContentLink, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar la imagen: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Validar el tipo de archivo
      if (!APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(blob.type)) {
        throw new Error(`Tipo de archivo no permitido: ${blob.type}`);
      }

      // Validar el tamaño del archivo
      if (blob.size > APP_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande: ${(blob.size / (1024 * 1024)).toFixed(1)}MB`);
      }

      // Convertir a base64
      const base64 = await this.blobToBase64(blob);
      console.log('✅ Imagen convertida a base64 exitosamente');
      
      return base64;
    } catch (error) {
      console.error('❌ Error al descargar imagen desde Google:', error);
      throw error;
    }
  }

  /**
   * Convierte un Blob a base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Error al convertir imagen a base64'));
      };
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Comprime una imagen si excede el tamaño máximo
   */
  async compressImage(base64: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevo tamaño manteniendo proporción
        const maxWidth = 1920;
        const maxHeight = 1080;
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

        // Convertir a base64 comprimido
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };

      img.src = base64;
    });
  }
}

export const googlePhotoService = GooglePhotoService.getInstance();
