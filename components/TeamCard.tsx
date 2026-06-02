import { motion } from 'motion/react';
export default function TeamCard({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      layout
      className="m-4 py-2 px-3 bg-white text-black rounded-xl text-3xl"
    >
      {name}
    </motion.div>
  );
}
