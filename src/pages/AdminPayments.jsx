import AdminLayout from "../components/AdminLayout";

function AdminPayments() {
  return (
    <AdminLayout>
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Payments
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          View all payment transactions
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
          💰
        </div>
        <h3 className="text-lg font-bold text-slate-700">Payments Management</h3>
        <p className="mt-2 text-sm text-slate-400">
          Payment management features coming soon.
        </p>
      </div>
    </AdminLayout>
  );
}

export default AdminPayments;