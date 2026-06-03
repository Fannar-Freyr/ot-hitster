import { AnimatePresence, motion } from 'motion/react';

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen py-2"
    >
      {children}
    </motion.div>
  );
}
