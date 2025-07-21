
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Camera, Check, X, Loader2, Cloud } from 'lucide-react';
import GooglePhotoPicker from '@/components/GooglePhotoPicker';
import { APP_CONFIG } from '@/config/constants';

interface AddMomentFormProps {
  onSave: (moment: { title: string; note: string; date: Date; photo?: string }) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

const AddMomentForm = ({ onSave, onCancel, isCreating = false }: AddMomentFormProps) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<string | undefined>();
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [photoSource, setPhotoSource] = useState<'device' | 'google' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isCreating) {
      console.log('📝 Enviando nuevo momento desde el formulario');
      onSave({
        title: title.trim(),
        note: note.trim(),
        date: new Date(date),
        photo
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
        setPhotoSource('device');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGooglePhotoSelected = (base64Photo: string) => {
    setPhoto(base64Photo);
    setPhotoSource('google');
    setShowGooglePicker(false);
  };

  const removePhoto = () => {
    setPhoto(undefined);
    setPhotoSource(null);
  };

  // Cliente ID temporal - el usuario debe configurar esto
  const googleClientId = APP_CONFIG.GOOGLE_PICKER.CLIENT_ID || '';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full max-w-md bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in rounded-t-2xl sm:rounded-xl rounded-b-none sm:rounded-b-xl max-h-[95vh] sm:max-h-none overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          {/* Header optimizado para móvil */}
          <div className="flex items-center justify-between sm:block">
            <div className="text-center flex-1 sm:mb-0">
              <h2 className="text-xl sm:text-xl font-serif-elegant text-sage-800 mb-1 sm:mb-2">
                Nuevo momento
              </h2>
              <p className="text-sm text-sage-600 handwritten hidden sm:block">
                Captura este instante especial
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="sm:hidden h-9 w-9 p-0 text-sage-500 touch-manipulation"
              disabled={isCreating}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                ¿Qué momento quieres recordar?
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Primera sonrisa, primer diente..."
                className="bg-cream-50 border-sage-200 focus:border-rose-300 text-base h-12 sm:h-10 touch-manipulation"
                required
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                Fecha
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-cream-50 border-sage-200 focus:border-rose-300 text-base h-12 sm:h-10 touch-manipulation"
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                Notas (opcional)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe este momento especial..."
                className="bg-cream-50 border-sage-200 focus:border-rose-300 resize-none text-base min-h-[100px] sm:min-h-[80px] touch-manipulation"
                rows={4}
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                Foto (opcional)
              </label>
              
              {/* Mostrar foto seleccionada */}
              {photo && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img 
                      src={photo} 
                      alt="Vista previa" 
                      className="w-24 h-24 sm:w-20 sm:h-20 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      disabled={isCreating}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {photoSource === 'google' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                        <Cloud className="w-3 h-3" />
                        Desde Google
                      </span>
                    )}
                    {photoSource === 'device' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                        <Camera className="w-3 h-3" />
                        Desde dispositivo
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Botones para seleccionar fuente de foto */}
              {!photo && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Desde dispositivo */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                        disabled={isCreating}
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`flex flex-col items-center justify-center gap-2 p-4 border border-sage-200 rounded-lg bg-cream-50 ${
                          !isCreating ? 'cursor-pointer hover:bg-cream-100' : 'opacity-50 cursor-not-allowed'
                        } transition-colors touch-manipulation text-center h-20`}
                      >
                        <Camera className="w-5 h-5 text-sage-500" />
                        <span className="text-xs text-sage-600">
                          Dispositivo
                        </span>
                      </label>
                    </div>

                    {/* Desde Google */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowGooglePicker(true)}
                      disabled={isCreating}
                      className="flex flex-col items-center justify-center gap-2 p-4 h-20 border-sage-200 bg-cream-50 hover:bg-cream-100 text-sage-600"
                    >
                      <Cloud className="w-5 h-5" />
                      <span className="text-xs">
                        Google
                      </span>
                    </Button>
                  </div>

                  <p className="text-xs text-sage-500 text-center">
                    Selecciona desde tu dispositivo o desde Google Drive/Photos
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-3 sm:pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-sage-300 text-sage-600 hover:bg-sage-50 h-12 sm:h-11 text-base hidden sm:flex touch-manipulation"
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 sm:h-11 text-base touch-manipulation disabled:opacity-50"
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Google Photo Picker Modal */}
      <GooglePhotoPicker
        isOpen={showGooglePicker}
        onClose={() => setShowGooglePicker(false)}
        onPhotoSelected={handleGooglePhotoSelected}
        clientId={googleClientId}
      />
    </div>
  );
};

export default AddMomentForm;
