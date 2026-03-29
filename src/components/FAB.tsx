import { Camera } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

const FAB = ({ onClick }: FABProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-lg flex items-center justify-center md:hidden transition-transform duration-150 z-40 touch-manipulation"
      aria-label="Nuevo momento"
    >
      <Camera className="w-6 h-6" />
    </button>
  );
};

export default FAB;
