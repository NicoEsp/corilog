
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image } from 'lucide-react';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
}

interface MomentCardProps {
  moment: Moment;
  onClick: () => void;
}

const MomentCard = ({ moment, onClick }: MomentCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="bg-card paper-texture rounded-xl p-6 gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-sage-200/30"
    >
      <div className="flex items-start gap-4">
        {moment.photo ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-sage-100 flex-shrink-0">
            <img 
              src={moment.photo} 
              alt={moment.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
            <Image className="w-6 h-6 text-sage-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-serif-elegant text-lg text-sage-800 mb-2 leading-snug">
            {moment.title}
          </h3>
          
          <p className="text-sage-600 text-sm mb-3 line-clamp-2">
            {moment.note}
          </p>
          
          <time className="text-xs text-sage-500 handwritten">
            {format(moment.date, "d 'de' MMMM, yyyy", { locale: es })}
          </time>
        </div>
      </div>
    </div>
  );
};

export default MomentCard;
