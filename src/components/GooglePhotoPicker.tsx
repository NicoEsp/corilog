
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGooglePicker } from '@/hooks/useGooglePicker';
import { googlePhotoService, GooglePickerFile } from '@/services/googlePhotoService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Image, CheckCircle } from 'lucide-react';

interface GooglePhotoPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (base64Photo: string) => void;
  clientId: string;
}

const GooglePhotoPicker = ({ 
  isOpen, 
  onClose, 
  onPhotoSelected, 
  clientId 
}: GooglePhotoPickerProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GooglePickerFile | null>(null);

  const handleFileSelected = async (file: GooglePickerFile) => {
    try {
      setIsProcessing(true);
      setSelectedFile(file);
      
      console.log('📸 Procesando archivo seleccionado:', file);
      
      // Descargar y convertir a base64
      const base64Photo = await googlePhotoService.downloadImageAsBase64(file);
      
      // Notificar éxito
      toast({
        title: "Foto seleccionada",
        description: `"${file.name}" se ha cargado exitosamente`,
      });

      // Enviar foto al componente padre
      onPhotoSelected(base64Photo);
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error procesando archivo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al procesar la imagen',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  const {
    openPicker,
    isLoading,
    isAuthenticating,
    error,
    isGoogleLoaded,
  } = useGooglePicker({
    onFileSelected: handleFileSelected,
    clientId,
  });

  const handleOpenPicker = () => {
    if (!clientId) {
      toast({
        title: "Configuración requerida",
        description: "Es necesario configurar el Client ID de Google en la aplicación",
        variant: "destructive",
      });
      return;
    }
    openPicker();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Seleccionar desde Google
          </DialogTitle>
          <DialogDescription>
            Elige una foto desde Google Drive o Google Photos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado de carga inicial */}
          {!isGoogleLoaded && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-sage-600" />
                <p className="text-sm text-sage-600">Cargando Google Picker...</p>
              </div>
            </div>
          )}

          {/* Error de carga */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Google APIs cargadas */}
          {isGoogleLoaded && !error && (
            <div className="space-y-4">
              {/* Estado de procesamiento */}
              {isProcessing && selectedFile && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Procesando imagen
                    </p>
                    <p className="text-sm text-blue-600">
                      Descargando "{selectedFile.name}"...
                    </p>
                  </div>
                </div>
              )}

              {/* Información sobre Google Picker */}
              {!isProcessing && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-sage-50 rounded-lg">
                    <Image className="w-12 h-12 mx-auto text-sage-500 mb-3" />
                    <p className="text-sm text-sage-700">
                      Haz clic en "Abrir Google Picker" para explorar tus fotos de Google Drive y Google Photos
                    </p>
                  </div>

                  <Button
                    onClick={handleOpenPicker}
                    disabled={isLoading || isAuthenticating || isProcessing}
                    className="w-full"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando con Google...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4 mr-2" />
                        Abrir Google Picker
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Configuración requerida */}
          {!clientId && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Configuración requerida
                </p>
                <p className="text-sm text-yellow-600">
                  Es necesario configurar el Client ID de Google para usar esta función
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GooglePhotoPicker;
