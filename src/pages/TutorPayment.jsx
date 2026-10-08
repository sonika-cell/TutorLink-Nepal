import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

function TutorPayment() {
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);
  const [application, setApplication] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  // Fetch application + placement + create payment
  useEffect(() => {
    const setup = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        // 1. Get tutor's applications
        const appsRes = await fetch(
          "http://localhost:8080/api/applications/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const appsData = await appsRes.json();
        const app = (appsData.applications || []).find(
          (a) => a.id === parseInt(applicationId)
        );

        if (!app) {
          setError("Application not found");
          setLoading(false);
          return;
        }

        setApplication(app);

        // 2. Get placements
        const placementsRes = await fetch(
          "http://localhost:8080/api/placements/tutor",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const placementsData = await placementsRes.json();
        const pl = (placementsData.placements || []).find(
          (p) => p.application_id === parseInt(applicationId)
        );

        if (!pl) {
          setError("Placement not found");
          setLoading(false);
          return;
        }

        setPlacement(pl);

        // 3. Create payment (or fetch existing pending)
        const payRes = await fetch(
          "http://localhost:8080/api/payments/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              placement_id: pl.id,
              provider: "eSewa",
            }),
          }
        );

        const payData = await payRes.json();

        if (payRes.ok) {
          setPayment(payData.payment);
        } else {
          setError(payData.error || "Could not create payment");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, [applicationId, navigate]);

  // Handle "I've Paid"
  const handleConfirm = async () => {
    if (!payment) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8080/api/payments/${payment.id}/confirm`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        showToast("✅ Payment confirmed! You can now schedule the demo class.", "success");
        navigate("/tutor/dashboard");
      } else {
        showToast(data.error || "Could not confirm payment", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Handle "Payment Failed"
  const handleFail = async () => {
    if (!payment) return;

    if (!window.confirm("Mark this payment as failed? You can retry later.")) {
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8080/api/payments/${payment.id}/fail`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        showToast("Payment marked as failed. Return to dashboard to try again.", "error");
        navigate("/tutor/dashboard");
      } else {
        showToast(data.error || "Could not update payment", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
          <p className="text-slate-500 font-medium">Loading payment page...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            ❌
          </div>
          <h2 className="text-xl font-bold text-red-600">{error}</h2>
          <button
            onClick={() => navigate("/tutor/dashboard")}
            className="mt-6 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fee = payment?.amount || placement?.amount || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Success Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎉</span>
            <div>
              <h1 className="text-2xl font-extrabold">You've been hired!</h1>
              <p className="mt-1 text-sm text-teal-50">
                Complete the placement fee to unlock scheduling
              </p>
            </div>
          </div>
        </div>

        {/* Tuition Details */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-[#10243e]">
            📋 Tuition Details
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Tuition Post
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                #{application?.tuition_post_id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Application
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                #{application?.id}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600 capitalize">
                {application?.status}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Placement
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">
                {placement?.status?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="mb-6 rounded-2xl border-2 border-teal-500 bg-white p-6 shadow-sm">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400">
            Placement Fee
          </p>
          <p className="mt-2 text-center text-5xl font-extrabold text-teal-600">
            Rs. {fee}
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            One-time fee · 25% of monthly budget
          </p>
        </div>

        {/* QR Codes */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-center text-lg font-extrabold text-[#10243e]">
            📱 Pay via QR Code
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* eSewa QR */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TutorLink-eSewa-Rs${fee}`}
                alt="eSewa QR"
                className="mx-auto h-40 w-40 rounded-lg bg-white p-2"
              />
              <p className="mt-3 text-sm font-bold text-emerald-600">eSewa</p>
            </div>

            {/* Khalti QR */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TutorLink-Khalti-Rs${fee}`}
                alt="Khalti QR"
                className="mx-auto h-40 w-40 rounded-lg bg-white p-2"
              />
              <p className="mt-3 text-sm font-bold text-purple-600">Khalti</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">
              How to pay:
            </p>
            <ol className="space-y-1 text-sm text-blue-700">
              <li>1. Open your eSewa or Khalti app</li>
              <li>2. Scan the QR code above</li>
              <li>3. Pay <strong>Rs. {fee}</strong></li>
              <li>4. Click <strong>"I've Paid"</strong> below</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleConfirm}
            disabled={processing || !payment}
            className="flex-1 rounded-xl bg-teal-500 py-4 text-base font-bold text-white shadow-md transition hover:bg-teal-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "✅ I've Paid"}
          </button>

          <button
            onClick={handleFail}
            disabled={processing || !payment}
            className="flex-1 rounded-xl border-2 border-red-200 bg-white py-4 text-base font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "❌ Payment Failed"}
          </button>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate("/tutor/dashboard")}
          className="mt-4 w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  );
}

export default TutorPayment;