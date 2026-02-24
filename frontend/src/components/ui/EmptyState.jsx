import { motion } from 'framer-motion';

export default function EmptyState({ title, description, image, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {image && (
        <div className="w-64 h-48 rounded-2xl overflow-hidden mb-6 shadow-soft">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-6 text-center max-w-md">{description}</p>}
      {action}
    </motion.div>
  );
}
