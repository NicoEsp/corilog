
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteMomentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  momentTitle: string;
}

const DeleteMomentDialog = ({ open, onOpenChange, onConfirm, momentTitle }: DeleteMomentDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card paper-texture border-sage-200/50 max-w-sm mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif-elegant text-sage-800">
            ¿Eliminar momento?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sage-600">
            Estás a punto de eliminar permanentemente "{momentTitle}". 
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="border-sage-300 text-sage-600 hover:bg-sage-50">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMomentDialog;
