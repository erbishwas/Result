import { useEffect } from 'react';
import { 
  
  XCircle, 
  X, 
  Check, 
 
} from 'lucide-react';
import { Transition } from '@headlessui/react';

export default function Toast({ 
  type, 
  message, 
  onClose 
}: { 
  type: 'success' | 'error'; 
  message: string; 
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      iconBg: 'bg-green-600',
      icon: <Check className="w-6 h-6" />,
    },
    error: {
      bg: 'bg-red-500',
      border: 'border-red-600',
      iconBg: 'bg-red-600',
      icon: <XCircle className="w-6 h-6" />,
    },
  };

  const style = config[type];

  return (
    <div className="fixed inset-0 flex items-start justify-center z-[100] pt-20 px-4 pointer-events-none">
      <Transition
        show={true}
        enter="transition-all duration-300 ease-out"
        enterFrom="opacity-0 translate-y-[-100px] scale-90"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition-all duration-200 ease-in"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-[-50px] scale-95"
      >
        <div className={`pointer-events-auto max-w-md w-full ${style.bg} border ${style.border} text-white rounded-xl shadow-2xl overflow-hidden`}>
          <div className="flex items-center gap-4 p-5">
            <div className={`flex-shrink-0 w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center`}>
              {style.icon}
            </div>
            <div className="flex-1 text-lg font-medium">{message}</div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}
