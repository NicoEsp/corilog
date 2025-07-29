
import { useState, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Camera, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { validateDate, createSafeDate, sanitizeTitle, sanitizeNote } from '@/utils/inputSanitization';
import { handleFormError } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/utils/performance';

interface AddMomentFormProps {
  onSave: (moment: { title: string; note: string; date: Date; photo?: string }) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

const AddMomentForm = memo(({ onSave, onCancel, isCreating = false }: AddMomentFormProps) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [photo, setPhoto] = useState<string | undefined>();
  const [errors, setErrors] = useState<{ title?: string; date?: string; general?: string }>({});
  const { toast } = useToast();

  // Memoizar validación para evitar recálculos
  const validateForm = useCallback((): boolean => {
    const newErrors: { title?: string; date?: string; general?: string } = {};
    
    // Validate title
    const sanitizedTitle = sanitizeTitle(title);
    if (!sanitizedTitle.trim()) {
      newErrors.title = 'El título es requerido';
    }

    // Validate date
    if (!date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      // Check if date is in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (date > today) {
        newErrors.date = 'No puedes crear momentos con fechas futuras';
      } else if (!validateDate(date)) {
        newErrors.date = 'Debes seleccionar una fecha válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, date]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) return;

    try {
      // Clear previous errors
      setErrors({});

      // Validate form
      if (!validateForm()) {
        toast({
          title: "Error en el formulario",
          description: "Por favor corrige los errores antes de continuar",
          variant: "destructive",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedTitle = sanitizeTitle(title);
      const sanitizedNote = sanitizeNote(note);
      const safeDate = createSafeDate(date);

      console.log('📝 Enviando nuevo momento desde el formulario');
      
      onSave({
        title: sanitizedTitle,
        note: sanitizedNote,
        date: safeDate,
        photo
      });

    } catch (error) {
      const errorMessage = handleFormError(error, 'AddMomentForm.handleSubmit');
      setErrors({ general: errorMessage });
      
      toast({
        title: "Error al guardar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isCreating, validateForm, title, note, date, photo, onSave, toast]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setPhoto(reader.result as string);
        };
        reader.onerror = () => {
          toast({
            title: "Error al cargar imagen",
            description: "No se pudo procesar la imagen seleccionada",
            variant: "destructive",
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          title: "Error al cargar imagen",
          description: "Ocurrió un error inesperado al procesar la imagen",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleDateSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Clear date error if it exists
      if (errors.date) {
        setErrors(prev => ({ ...prev, date: undefined }));
      }
    } else {
      // If date is cleared, use current date as fallback
      setDate(new Date());
    }
  }, [errors.date]);

  // Callbacks optimizados para inputs
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  }, [errors.title]);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  }, []);

  // Memoizar clases CSS para prevenir recálculos
  const titleInputClassName = useMemo(() => {
    const baseClasses = "bg-cream-50 border-sage-200 focus:border-rose-300 text-base h-12 sm:h-10 touch-manipulation";
    return errors.title ? `${baseClasses} border-red-500 focus:border-red-500` : baseClasses;
  }, [errors.title]);

  const photoLabelClassName = useMemo(() => {
    const baseClasses = "flex-1 flex items-center justify-center gap-3 p-4 sm:p-3 border border-sage-200 rounded-lg bg-cream-50 transition-colors touch-manipulation h-12 sm:h-auto";
    return !isCreating ? `${baseClasses} cursor-pointer hover:bg-cream-100` : `${baseClasses} opacity-50 cursor-not-allowed`;
  }, [isCreating]);

  const isFormValid = useMemo(() => title.trim().length > 0, [title]);

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

          {/* General error display */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                ¿Qué momento quieres recordar? *
              </label>
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Primera sonrisa, primer diente..."
                className={titleInputClassName}
                required
                disabled={isCreating}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                Fecha *
              </label>
              <DatePicker
                date={date}
                onSelect={handleDateSelect}
                placeholder="Seleccionar fecha del momento"
                disabled={isCreating}
                error={!!errors.date}
                allowClear={false} // Don't allow clearing since date is required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-base sm:text-sm font-medium text-sage-700 mb-3 sm:mb-2">
                Notas (opcional)
              </label>
              <Textarea
                value={note}
                onChange={handleNoteChange}
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
              <div className="flex gap-2">
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
                  className={photoLabelClassName}
                >
                  <Camera className="w-5 h-5 sm:w-4 sm:h-4 text-sage-500" />
                  <span className="text-base sm:text-sm text-sage-600">
                    {photo ? 'Cambiar foto' : 'Agregar foto'}
                  </span>
                </label>
              </div>
              
              {photo && (
                <div className="mt-3">
                  <img 
                    src={photo} 
                    alt="Vista previa" 
                    className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
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
              disabled={!isFormValid || isCreating}
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
    </div>
  );
});

AddMomentForm.displayName = 'AddMomentForm';
export default AddMomentForm;
