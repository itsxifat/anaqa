// Shared wrapper that gives every admin page a consistent header + card layout.
// Usage:
//   <AdminPageWrapper title="Orders" subtitle="Manage all customer orders">
//     {children}
//   </AdminPageWrapper>

export default function AdminPageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-manrope pt-16 lg:pt-0">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bodoni text-2xl lg:text-3xl font-bold text-gray-900 tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-manrope">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>

      {/* Page Body */}
      <div className="px-6 lg:px-10 py-8">
        {children}
      </div>
    </div>
  );
}
