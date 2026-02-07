import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const requirements = [
    { label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
    { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Contains special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const passedRequirements = requirements.filter(req => req.test(password)).length;
  const strength = (passedRequirements / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 100) return 'bg-green-500';
    if (strength >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthLabel = () => {
    if (strength === 100) return 'Strong';
    if (strength >= 60) return 'Medium';
    return 'Weak';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Password Strength:</span>
        <span className={`text-sm font-semibold ${
          strength === 100 ? 'text-green-400' : strength >= 60 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {getStrengthLabel()}
        </span>
      </div>

      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength}%` }}
        />
      </div>

      <div className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {passed ? (
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passed ? 'text-green-400' : 'text-slate-500'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
