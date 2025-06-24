
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Mail, Lock, AlertTriangle } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

interface AuthFormFieldsProps {
  isLogin: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  emailError: string;
  passwordError: string;
  setEmailError: (error: string) => void;
  setPasswordError: (error: string) => void;
}

const AuthFormFields = ({
  isLogin,
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  passwordError,
  setEmailError,
  setPasswordError
}: AuthFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-sage-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="tu@email.com"
            className={`pl-10 bg-cream-50 border-sage-200 focus:border-rose-300 ${
              emailError ? 'border-red-300' : ''
            }`}
            required
            autoComplete="email"
          />
        </div>
        {emailError && (
          <p className="text-xs text-red-600 mt-1 handwritten">
            {emailError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-sage-400 z-10" />
          <PasswordInput
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError('');
            }}
            placeholder="••••••••"
            className={`pl-10 bg-cream-50 border-sage-200 focus:border-rose-300 ${
              passwordError ? 'border-red-300' : ''
            }`}
            required
            minLength={isLogin ? 6 : 12}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>
        {passwordError && (
          <p className="text-xs text-red-600 mt-1 handwritten">
            {passwordError}
          </p>
        )}
        
        {/* Password strength indicator for registration */}
        {!isLogin && password && (
          <div className="mt-2">
            <PasswordStrengthIndicator password={password} />
          </div>
        )}
        
        {/* Security notice for registration */}
        {!isLogin && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 handwritten">
                Tu contraseña debe tener al menos 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFormFields;
