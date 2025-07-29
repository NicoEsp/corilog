import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface StreakImageGeneratorProps {
  streakDays: number;
  userDisplayName?: string;
  onImageGenerated: (imageUrl: string) => void;
}

const StreakImageGenerator = ({ 
  streakDays, 
  userDisplayName, 
  onImageGenerated 
}: StreakImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateImage();
  }, [streakDays, userDisplayName]);

  const generateImage = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size for social media sharing (1080x1080)
    canvas.width = 1080;
    canvas.height = 1080;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#fdf2f8'); // rose-50
    gradient.addColorStop(0.5, '#fff7ed'); // amber-50
    gradient.addColorStop(1, '#fef3f2'); // rose-50
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle pattern
    ctx.fillStyle = 'rgba(251, 191, 36, 0.05)'; // amber with opacity
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Main content container
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Title
    ctx.fillStyle = '#1f2937'; // gray-800
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡Felicitaciones!', centerX, centerY - 200);

    // Streak number - large and prominent
    ctx.fillStyle = '#dc2626'; // rose-600
    ctx.font = 'bold 180px system-ui, -apple-system, sans-serif';
    ctx.fillText(streakDays.toString(), centerX, centerY - 50);

    // Days text
    ctx.fillStyle = '#374151'; // gray-700
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    const daysText = streakDays === 1 ? 'día consecutivo' : 'días consecutivos';
    ctx.fillText(daysText, centerX, centerY + 40);

    // Subtitle
    ctx.fillStyle = '#6b7280'; // gray-500
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText('de racha emocional', centerX, centerY + 100);

    // User name if provided
    if (userDisplayName) {
      ctx.fillStyle = '#374151'; // gray-700
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.fillText(`por ${userDisplayName}`, centerX, centerY + 160);
    }

    // Corilog branding
    ctx.fillStyle = '#9ca3af'; // gray-400
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillText('Corilog', centerX, centerY + 280);
    
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Tu diario íntimo digital', centerX, centerY + 320);

    // Decorative elements (flames)
    const drawFlame = (x: number, y: number, size: number) => {
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.3, size * 0.5, 0, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#dc2626'; // rose-600
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.2, size * 0.2, size * 0.3, 0, 0, 2 * Math.PI);
      ctx.fill();
    };

    // Add flame decorations
    drawFlame(centerX - 200, centerY - 50, 30);
    drawFlame(centerX + 200, centerY - 50, 30);
    drawFlame(centerX - 100, centerY + 200, 25);
    drawFlame(centerX + 100, centerY + 200, 25);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        onImageGenerated(imageUrl);
      }
      setIsGenerating(false);
    }, 'image/png', 1.0);
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        className="w-full max-w-sm mx-auto border border-gray-200 rounded-lg shadow-sm"
        style={{ aspectRatio: '1/1' }}
      />
      
      {isGenerating && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin"></div>
            Generando imagen...
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakImageGenerator;