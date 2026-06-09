import { motion } from 'motion/react';

export default function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center min-h-screen py-2 ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}
