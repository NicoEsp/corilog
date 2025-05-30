
import { validatePassword, getPasswordStrengthText } from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

const PasswordStrengthIndicator = ({ password, showFeedback = true }: PasswordStrengthIndicatorProps) => {
  const strength = validatePassword(password);
  const { text, color } = getPasswordStrengthText(strength.score);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength indicator bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              strength.score <= 1 ? 'bg-red-500' :
              strength.score <= 2 ? 'bg-orange-500' :
              strength.score <= 3 ? 'bg-yellow-500' :
              strength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${color}`}>
          {text}
        </span>
      </div>

      {/* Feedback messages */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, index) => (
            <p key={index} className="text-xs text-red-600 handwritten">
              • {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
