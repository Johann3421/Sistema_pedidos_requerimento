import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-card shadow-card p-5 flex items-start gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        {Icon && <Icon size={22} style={{ color }} />}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-display font-bold text-gray-800 mt-0.5">{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
      </div>
    </motion.div>
  );
}
