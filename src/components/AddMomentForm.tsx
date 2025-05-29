import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Camera, BookOpen, Check, ArrowLeft } from 'lucide-react';

interface AddMomentFormProps {
  onSave: (moment: { title: string; note: string; date: Date; photo?: string }) => void;
  onCancel: () => void;
}

const AddMomentForm = ({ onSave, onCancel }: AddMomentFormProps) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
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
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-serif-elegant text-sage-800 mb-2">
              Nuevo momento
            </h2>
            <p className="text-sm text-sage-600 handwritten">
              Captura este instante especial
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                ¿Qué momento quieres recordar?
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Primera sonrisa, primer diente..."
                className="bg-cream-50 border-sage-200 focus:border-rose-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Fecha
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-cream-50 border-sage-200 focus:border-rose-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Notas (opcional)
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe este momento especial..."
                className="bg-cream-50 border-sage-200 focus:border-rose-300 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-2">
                Foto (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex-1 flex items-center justify-center gap-2 p-3 border border-sage-200 rounded-lg bg-cream-50 cursor-pointer hover:bg-cream-100 transition-colors"
                >
                  <Camera className="w-4 h-4 text-sage-500" />
                  <span className="text-sm text-sage-600">
                    {photo ? 'Cambiar foto' : 'Agregar foto'}
                  </span>
                </label>
              </div>
              
              {photo && (
                <div className="mt-2">
                  <img 
                    src={photo} 
                    alt="Vista previa" 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-sage-300 text-sage-600 hover:bg-sage-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-rose-400 hover:bg-rose-500 text-white"
              disabled={!title.trim()}
            >
              <Check className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddMomentForm;
