import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from './Icon';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const Toast = ({ toast }: ToastProps) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: 50, opacity: 0, transition: { duration: 0.2 } }}
          className="fixed bottom-[140px] left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm"
        >
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'error' ? 'bg-error/90 border-error/20 text-white' : 
            toast.type === 'info' ? 'bg-secondary/90 border-secondary/20 text-white' : 
            'bg-primary/90 border-primary/20 text-white'
          }`}>
            <Icon 
              name={toast.type === 'error' ? 'report' : toast.type === 'info' ? 'info' : 'check_circle'} 
              size="text-lg" 
            />
            <p className="text-[11px] font-black tracking-tight leading-tight">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
