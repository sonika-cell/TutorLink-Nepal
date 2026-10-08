import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPlacements: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    confirmedPlacements: 0,
  });

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (user.role !== "admin") {
          setError("Access denied. Admin only.");
          setLoading(false);
          return;
        }

        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (placementsRes.ok) {
          const placementsData = await placementsRes.json();
          const allPlacements = placementsData.placements || [];
          setPlacements(allPlacements);

          const totalRevenue = allPlacements
            .filter((p) => p.status === "paid" || p.status === "confirmed")
            .reduce((sum, p) => sum + p.amount, 0);

          const pendingPayments = allPlacements.filter(
            (p) => p.status === "pending_payment"
          ).length;

          const confirmedPlacements = allPlacements.filter(
            (p) => p.status === "paid" || p.status === "confirmed"
          ).length;

          setStats({
            totalPlacements: allPlacements.length,
            totalRevenue,
            pendingPayments,
            confirmedPlacements,
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Loading
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
            <p className="text-sm font-medium text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error
  if (error) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>
          <p className="font-semibold text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Heading */}
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          Overview
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10243e]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of TutorLink Nepal platform
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Placements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-xl text-teal-500">
            ♙
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Total Placements
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#10243e]">
            {stats.totalPlacements}
          </p>
          <p className="mt-1 text-xs text-slate-400">All time</p>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl font-bold text-emerald-500">
            Rs
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Total Revenue
          </p>
          <p className="mt-1 text-3xl font-extrabold text-emerald-500">
            Rs. {stats.totalRevenue}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Placement fees collected
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-500">
            ◷
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Pending Payments
          </p>
          <p className="mt-1 text-3xl font-extrabold text-amber-500">
            {stats.pendingPayments}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Awaiting tutor payment
          </p>
        </div>

        {/* Confirmed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl text-purple-500">
            ✓
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
            Confirmed Placements
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#10243e]">
            {stats.confirmedPlacements}
          </p>
          <p className="mt-1 text-xs text-slate-400">Successfully paid</p>
        </div>
      </div>

      {/* All Placements Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-lg">
              ▣
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#10243e]">
                All Placements
              </h2>
              <p className="text-xs text-slate-400">
                Manage placement records
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            {placements.length} records
          </span>
        </div>

        {placements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
              📭
            </div>
            <h3 className="font-bold text-slate-700">No placements yet</h3>
            <p className="mt-1 text-sm text-slate-400">
              Placements will appear here when parents confirm hires.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Parent ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Tutor ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {placements.map((placement) => (
                  <tr
                    key={placement.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 font-bold text-[#10243e]">
                      #{placement.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {placement.parent_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {placement.tutor_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#10243e]">
                      Rs. {placement.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                          placement.status === "pending_payment"
                            ? "bg-amber-100 text-amber-700"
                            : placement.status === "pending_verification"
                            ? "bg-blue-100 text-blue-700"
                            : placement.status === "paid" ||
                              placement.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {placement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(placement.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;