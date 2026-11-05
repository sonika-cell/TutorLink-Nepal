import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get("pidx");
      const khaltiStatus = searchParams.get("status");
      const txnId = searchParams.get("transaction_id");

      if (!pidx) {
        setStatus("error");
        setMessage("No payment reference found.");
        return;
      }

      // If Khalti says User canceled
      if (khaltiStatus && khaltiStatus !== "Completed") {
        setStatus("error");
        setMessage(
          `Payment ${khaltiStatus}. You can retry from your dashboard.`
        );
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          "http://localhost:8080/api/payments/khalti/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pidx }),
          }
        );

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Payment verified! Redirecting to dashboard...");
          setTimeout(() => navigate("/tutor/dashboard"), 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("Could not verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-xl">

        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-purple-500" />
            <h2 className="text-xl font-bold text-slate-800">
              Verifying Payment...
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we confirm with Khalti.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
              ✅
            </div>
            <h2 className="text-xl font-bold text-emerald-600">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
              ❌
            </div>
            <h2 className="text-xl font-bold text-red-600">
              Payment Failed
            </h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <button
              onClick={() => navigate("/tutor/dashboard")}
              className="mt-6 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Back to Dashboard
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default PaymentSuccess;