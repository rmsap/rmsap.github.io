function StatsCard({ icon: IconComponent, value, label, colorClass }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
      <IconComponent className={`w-8 h-8 ${colorClass} mb-2`} />
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

export default StatsCard;
