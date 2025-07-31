import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Mail, Send } from 'lucide-react';
import { SharedMomentService } from '@/services/sharedMomentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
}

interface ShareMomentModalProps {
  moment: Moment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShareMomentModal = ({ moment, open, onOpenChange }: ShareMomentModalProps) => {
  const { user } = useAuth();
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [expiration, setExpiration] = useState('30days');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!email1.trim()) {
      toast({
        title: "Email requerido",
        description: "Debes ingresar al menos un email",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email1.trim())) {
      toast({
        title: "Email inválido",
        description: "El primer email no tiene un formato válido",
        variant: "destructive",
      });
      return;
    }

    if (email2.trim() && !emailRegex.test(email2.trim())) {
      toast({
        title: "Email inválido",
        description: "El segundo email no tiene un formato válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculate expiration date
      let expiresAt: Date | undefined;
      if (expiration !== 'never') {
        const days = expiration === '7days' ? 7 : 30;
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      // Create shared moment
      const sharedMoment = await SharedMomentService.createSharedMoment(user.id, {
        moment_id: moment.id,
        recipient_email_1: email1.trim(),
        recipient_email_2: email2.trim() || undefined,
        expires_at: expiresAt,
      });

      if (sharedMoment) {
        // Send invitations
        const recipientEmails = [email1.trim()];
        if (email2.trim()) {
          recipientEmails.push(email2.trim());
        }

        const senderName = user.user_metadata?.display_name || user.email || 'Alguien especial';

        const success = await SharedMomentService.sendInvitations(
          sharedMoment.share_token,
          recipientEmails,
          moment.title,
          senderName
        );

        if (success) {
          onOpenChange(false);
          // Reset form
          setEmail1('');
          setEmail2('');
          setExpiration('30days');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al compartir el momento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sage-800">
            <Mail className="w-5 h-5" />
            Compartir Momento
          </DialogTitle>
          <DialogDescription className="text-sage-600">
            Comparte este momento especial enviando un enlace privado por email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
            <h4 className="font-serif-elegant text-sm text-sage-700 mb-2">
              {moment.title}
            </h4>
            <p className="text-xs text-sage-600">
              Este momento será compartido de forma privada
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email1" className="text-sage-700">
                Email 1 (requerido)
              </Label>
              <Input
                id="email1"
                type="email"
                value={email1}
                onChange={(e) => setEmail1(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email2" className="text-sage-700">
                Email 2 (opcional)
              </Label>
              <Input
                id="email2"
                type="email"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                placeholder="correo2@ejemplo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expiration" className="text-sage-700">
                Expiración del enlace
              </Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 días</SelectItem>
                  <SelectItem value="30days">30 días</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-rose-600 hover:bg-rose-700"
              disabled={isLoading}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Compartir'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareMomentModal;