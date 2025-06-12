
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
import { Copy, Check, Share2, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareMomentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  momentId: string;
  momentTitle: string;
}

const ShareMomentDialog = ({ open, onOpenChange, momentId, momentTitle }: ShareMomentDialogProps) => {
  const { user } = useAuth();
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState('');

  const generateShareLink = async () => {
    if (!user) {
      setError('Debes estar autenticado para generar enlaces');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    console.log('Generando enlace para momento:', momentId);
    
    try {
      const sharedMoment = await ShareService.createShareLink(user.id, momentId);

      if (sharedMoment) {
        const link = `${window.location.origin}/shared/${sharedMoment.share_token}`;
        console.log('Enlace generado:', link);
        setShareLink(link);
        toast({
          title: "¡Enlace generado!",
          description: "Ya puedes compartir este momento con quien quieras",
        });
      } else {
        setError('No se pudo generar el enlace. Inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al generar el enlace');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace está listo para compartir",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `¡Mira este momento especial que quiero compartir contigo! "${momentTitle}" ${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    setShareLink('');
    setLinkCopied(false);
    setError('');
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
            Genera un enlace para compartir "{momentTitle}" con quien quieras.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {!shareLink ? (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-rose-500" />
              </div>
              <p className="text-sage-600 text-sm">
                Genera un enlace único para compartir este momento por WhatsApp, email o cualquier otra forma.
              </p>
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
                  className="border-sage-200 bg-sage-50 text-sm"
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
            
            <div className="flex gap-2">
              <Button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Compartir por WhatsApp
              </Button>
              <Button
                onClick={copyLink}
                variant="outline"
                className="border-sage-200 text-sage-700 hover:bg-sage-100"
                size="sm"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar enlace
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <Share2 className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium">¡Enlace listo para compartir!</p>
                  <p className="text-blue-600 mt-1">
                    Cualquier persona con este enlace podrá ver el momento, sin necesidad de registrarse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="border-sage-200 text-sage-600 hover:bg-sage-50">
            {shareLink ? 'Cerrar' : 'Cancelar'}
          </AlertDialogCancel>
          {!shareLink && (
            <AlertDialogAction
              onClick={generateShareLink}
              disabled={isGenerating}
              className="bg-rose-400 hover:bg-rose-500 text-white"
            >
              {isGenerating ? 'Generando enlace...' : 'Generar enlace'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareMomentDialog;
