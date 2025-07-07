import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Share, Calendar, Star, Image } from 'lucide-react';

interface WelcomeScreenProps {
  onAddMoment: () => void;
  isCreating: boolean;
}

const WelcomeScreen = ({ onAddMoment, isCreating }: WelcomeScreenProps) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Camera,
      title: "Captura momentos",
      description: "Guarda esos instantes especiales con fotos y notas personales",
      color: "text-rose-600"
    },
    {
      icon: Calendar,
      title: "Organiza por fechas",
      description: "Ve tus momentos organizados cronológicamente en una línea de tiempo",
      color: "text-blue-600"
    },
    {
      icon: Star,
      title: "Destaca lo importante",
      description: "Marca tus momentos favoritos para encontrarlos fácilmente",
      color: "text-amber-600"
    },
    {
      icon: Share,
      title: "Comparte memorias",
      description: "Envía momentos especiales a tus seres queridos de forma privada",
      color: "text-green-600"
    }
  ];

  return (
    <div className="text-center py-8 sm:py-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8 sm:mb-12">
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose-100 to-sage-100 flex items-center justify-center mx-auto mb-6 animate-gentle-bounce">
          <img 
            src="/lovable-uploads/85d5ae8c-6ff4-4291-91ed-ebfbc6b3c907.png" 
            alt="Corilog Logo" 
            className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
          />
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-elegant text-sage-800 mb-4 px-4">
          Bienvenido a Corilog
        </h1>
        
        <p className="text-sage-600 mb-8 max-w-2xl mx-auto leading-relaxed px-4 text-base sm:text-lg font-medium">
          Tu diario personal para atesorar momentos únicos. Captura, organiza y revive tus memorias más preciadas.
        </p>
        
        <Button 
          onClick={onAddMoment}
          disabled={isCreating}
          className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-12 px-8 text-base touch-manipulation mb-8 sm:mb-12"
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          {isCreating ? 'Creando...' : 'Crear mi primer momento'}
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className={`bg-card paper-texture gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer border-sage-200/50 group ${
              hoveredCard === index ? 'scale-[1.02]' : ''
            }`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4 sm:p-6 text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white to-sage-50 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.color}`} />
              </div>
              
              <h3 className="font-serif-elegant text-lg sm:text-xl text-sage-800 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sage-600 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 sm:mt-12 px-4">
        <div className="bg-gradient-to-r from-sage-50 to-cream-50 rounded-2xl p-6 sm:p-8 border border-sage-200/50">
          <div className="flex items-center justify-center mb-4">
            <Image className="w-6 h-6 text-sage-500 mr-2" />
            <span className="text-sage-600 font-medium">¿Listo para empezar?</span>
          </div>
          <p className="text-sage-500 text-sm sm:text-base mb-4">
            Cada momento cuenta una historia. Comienza la tuya hoy.
          </p>
          <Button 
            onClick={onAddMoment}
            disabled={isCreating}
            variant="outline"
            className="border-sage-300 text-sage-700 hover:bg-sage-100 h-10 px-6"
          >
            {isCreating ? 'Creando momento...' : 'Empezar ahora'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
