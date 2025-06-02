
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
import { Copy, Check } from 'lucide-react';

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
    const sharedMoment = await ShareService.createShare(user.id, {
      moment_id: momentId,
      shared_with_email: email.trim()
    });

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
            Comparte "{momentTitle}" con alguien especial. La persona necesitará crear una cuenta para ver el momento.
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
            <p className="text-sm text-sage-500">
              Enlace enviado a {email}. También puedes copiarlo y enviarlo manualmente.
            </p>
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
              {isSharing ? 'Compartiendo...' : 'Compartir'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareMomentDialog;
