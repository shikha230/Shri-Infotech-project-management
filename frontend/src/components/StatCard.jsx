function StatCard({ title, value, icon }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          {icon}
        </div>

        {/* Small indicator */}
        <span className="text-xs font-medium text-emerald-600">
          Overview
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default StatCard;