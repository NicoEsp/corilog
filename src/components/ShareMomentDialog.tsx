import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareService } from '@/services/shareService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Mail } from 'lucide-react';

interface ShareMomentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentId: string;
  momentTitle: string;
}

const ShareMomentDialog = ({ open, onOpenChange, momentId, momentTitle }: ShareMomentDialogProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = async () => {
    if (!user || !email.trim()) return;

    setIsSharing(true);
    
    // Get user profile for sender name
    const { data: profile } = await user.identities?.[0] 
      ? { data: null } 
      : await supabase.from('user_profiles').select('display_name').eq('id', user.id).single();
    
    const senderName = profile?.display_name || user.email?.split('@')[0] || 'Un amigo';

    const sharedMoment = await ShareService.createShare(user.id, {
      moment_id: momentId,
      shared_with_email: email.trim()
    }, senderName);

    if (sharedMoment) {
      const link = `${window.location.origin}/shared/${sharedMoment.share_token}`;
      setShareLink(link);
    }
    setIsSharing(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleClose = () => {
    setEmail('');
    setShareLink('');
    setLinkCopied(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-card paper-texture border-sage-200/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif-elegant text-sage-800">
            Compartir momento
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sage-600">
            Comparte "{momentTitle}" con alguien especial. Se enviará una invitación por email automáticamente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!shareLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sage-700">
                Email del destinatario
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-sage-200 focus:border-sage-400"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-sage-500 bg-sage-50 p-3 rounded-lg">
              <Mail className="w-4 h-4" />
              <span>Se enviará una invitación automáticamente por email</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sage-700">
                Enlace para compartir
              </Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="border-sage-200 bg-sage-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  className="border-sage-200 hover:bg-sage-100"
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Check className="w-4 h-4" />
                <span className="font-medium">¡Invitación enviada!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Se ha enviado una invitación por email a {email}. También puedes copiar el enlace arriba.
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="border-sage-200 text-sage-600 hover:bg-sage-50">
            {shareLink ? 'Cerrar' : 'Cancelar'}
          </AlertDialogCancel>
          {!shareLink && (
            <AlertDialogAction
              onClick={handleShare}
              disabled={!email.trim() || isSharing}
              className="bg-rose-400 hover:bg-rose-500 text-white"
            >
              {isSharing ? 'Enviando invitación...' : 'Compartir y Enviar Email'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareMomentDialog;
