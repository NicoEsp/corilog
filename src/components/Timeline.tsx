
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';

interface TimelineProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const Timeline = ({ moments, onMomentClick }: TimelineProps) => {
  // Agrupar momentos por año
  const momentsByYear = moments.reduce((acc, moment) => {
    const year = moment.date.getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(moment);
    return acc;
  }, {} as Record<number, Moment[]>);

  const years = Object.keys(momentsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (moments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sage-500 handwritten">
          Tu línea de tiempo aparecerá aquí cuando tengas momentos guardados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="relative">
          {/* Año */}
          <div className="sticky top-20 z-10 mb-6">
            <div className="bg-background/95 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-sage-200/50 shadow-sm">
              <h3 className="font-serif-elegant text-lg text-sage-800">{year}</h3>
            </div>
          </div>

          {/* Línea vertical */}
          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-sage-300 to-transparent"></div>

          {/* Momentos del año */}
          <div className="space-y-6 pl-16">
            {momentsByYear[year].map((moment, index) => (
              <div key={moment.id} className="relative">
                {/* Punto en la línea */}
                <div className="absolute -left-16 top-4 w-3 h-3 bg-rose-400 rounded-full border-2 border-background shadow-sm"></div>

                {/* Card del momento */}
                <Card 
                  className="bg-card paper-texture gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border-sage-200/50 group"
                  onClick={() => onMomentClick(moment)}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {moment.photo ? (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-sage-100 flex-shrink-0">
                          <img 
                            src={moment.photo} 
                            alt={moment.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                          <Image className="w-5 h-5 sm:w-6 sm:h-6 text-sage-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-serif-elegant text-base sm:text-lg text-sage-800 leading-snug line-clamp-2">
                            {moment.title}
                          </h4>
                          <time className="text-xs text-sage-500 handwritten flex-shrink-0">
                            {format(moment.date, "d MMM", { locale: es })}
                          </time>
                        </div>
                        
                        <p className="text-sage-600 text-sm line-clamp-2 whitespace-pre-wrap">
                          {moment.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
