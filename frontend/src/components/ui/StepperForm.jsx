import { Check } from 'lucide-react';

export default function StepperForm({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${idx < currentStep
                  ? 'bg-primary text-white'
                  : idx === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
            >
              {idx < currentStep ? <Check size={16} /> : idx + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${idx <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-2 ${idx < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
