import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarBlank,
  CheckCircle,
  CircleNotch,
  Clock,
  Coins,
  Receipt,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import { SYSTEM_API_BASE_URL } from "../utils/apiConfig";
import { authenticatedFetch, jsonOrError } from "../lib/api";
import {
  checkoutRequestKey,
  clearCheckoutIntent,
  clearCheckoutRequestKey,
} from "../lib/checkoutIntent";
import { openRazorpayCheckout } from "../lib/razorpay";

const money = paise => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format((paise || 0) / 100);

const date = value => value
  ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  : "Not available";

const statusTone = status => {
  if (["paid", "active", "authenticated"].includes(status)) return "bg-lime-950/50 text-lime-300 border-lime-900";
  if (["failed", "halted", "refunded"].includes(status)) return "bg-red-950/50 text-red-300 border-red-900";
  return "bg-zinc-800 text-zinc-300 border-zinc-700";
};

const BillingSkeleton = () => (
  <div className="space-y-6 animate-pulse" aria-label="Loading billing information">
    <div className="h-40 rounded-xl bg-cloud-2" />
    <div className="h-28 rounded-xl bg-cloud-2" />
    <div className="h-52 rounded-xl bg-cloud-2" />
  </div>
);

const BillingPage = ({ initialPlanCode, onWalletChange }) => {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const resumedPlanRef = useRef("");

  const finishCheckoutIntent = planCode => {
    clearCheckoutIntent();
    clearCheckoutRequestKey(planCode);
    window.history.replaceState({}, document.title, "/studio");
  };

  const loadBilling = useCallback(async () => {
    setError("");
    try {
      const [summaryResponse, paymentsResponse, plansResponse] = await Promise.all([
        authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/billing/summary`),
        authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/billing/transactions`),
        fetch(`${SYSTEM_API_BASE_URL}/v1/plans`),
      ]);
      const [nextSummary, nextPayments, nextPlans] = await Promise.all([
        jsonOrError(summaryResponse),
        jsonOrError(paymentsResponse),
        jsonOrError(plansResponse),
      ]);
      setSummary(nextSummary);
      setPayments(nextPayments.items || []);
      setPlans(nextPlans || []);
    } catch (loadError) {
      setError(loadError.message || "Could not load billing information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const confirmPayment = async (checkout, response) => {
    setAction("confirming");
    const result = await jsonOrError(await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/billing/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkout_id: checkout.checkout_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        razorpay_order_id: response.razorpay_order_id || null,
        razorpay_subscription_id: response.razorpay_subscription_id || null,
      }),
    }));
    finishCheckoutIntent(checkout.plan_code);
    if (result.status === "paid") {
      setNotice("Payment confirmed. Your credits are ready to use.");
      await Promise.all([loadBilling(), onWalletChange?.()]);
    } else {
      setNotice("Payment is being captured. Billing will update when Razorpay confirms it.");
    }
    setAction("");
  };

  const startCheckout = useCallback(async planCode => {
    if (!planCode || action) return;
    setAction(`checkout:${planCode}`);
    setError("");
    setNotice("");
    try {
      const checkout = await jsonOrError(await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": checkoutRequestKey(planCode),
        },
        body: JSON.stringify({ plan_code: planCode }),
      }));
      await openRazorpayCheckout({
        checkout,
        onSuccess: response => confirmPayment(checkout, response).catch(confirmError => {
          setError(confirmError.message || "Payment confirmation failed.");
          setAction("");
        }),
        onDismiss: message => {
          finishCheckoutIntent(planCode);
          setAction("");
          if (message) setError(message);
          else setNotice("Checkout closed. No credits were added.");
        },
      });
    } catch (checkoutError) {
      setError(checkoutError.message || "Could not start checkout.");
      setAction("");
    }
  }, [action, loadBilling, onWalletChange]);

  useEffect(() => {
    if (!loading && initialPlanCode && resumedPlanRef.current !== initialPlanCode) {
      resumedPlanRef.current = initialPlanCode;
      startCheckout(initialPlanCode);
    }
  }, [initialPlanCode, loading, startCheckout]);

  const cancelSubscription = async () => {
    setAction("cancel");
    setError("");
    try {
      await jsonOrError(await authenticatedFetch(`${SYSTEM_API_BASE_URL}/v1/billing/subscription/cancel`, {
        method: "POST",
      }));
      setNotice("Cancellation scheduled. Your plan remains active through the paid period.");
      setConfirmCancel(false);
      await loadBilling();
    } catch (cancelError) {
      setError(cancelError.message || "Could not schedule cancellation.");
    } finally {
      setAction("");
    }
  };

  const subscription = summary?.subscription;
  const cancellable = subscription && ["active", "authenticated", "pending", "halted"].includes(subscription.status);

  return (
    <div className="relative z-10 mx-auto max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Billing</h1>
          <p className="text-slate">Payments, expiring credits, and subscription status for your account.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate">
          <ShieldCheck size={18} className="text-accent" weight="fill" />
          Secure checkout by Razorpay
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
          <WarningCircle size={20} className="shrink-0" /> {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mb-6 flex gap-3 rounded-xl border border-lime-900 bg-lime-950/40 p-4 text-sm text-lime-200">
          <CheckCircle size={20} className="shrink-0" weight="fill" /> {notice}
        </div>
      )}

      {loading ? <BillingSkeleton /> : (
        <div className="space-y-8">
          <section className="rounded-xl border border-line bg-paper p-5 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-slate mb-2">Current subscription</p>
                {subscription ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-ink">{subscription.plan_name}</h2>
                      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${statusTone(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate flex items-center gap-2">
                      <CalendarBlank size={17} />
                      {subscription.cancel_at_period_end ? "Ends" : "Renews"} {date(subscription.current_period_end)}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-ink mb-2">No monthly plan</h2>
                    <p className="text-sm text-slate">Choose a plan below or buy credits that stay valid for six months.</p>
                  </>
                )}
              </div>

              {cancellable && !subscription.cancel_at_period_end && (
                <div className="flex flex-col items-start lg:items-end gap-2">
                  {!confirmCancel ? (
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(true)}
                      className="px-4 py-2 rounded-lg border border-line-2 text-sm font-semibold text-ink hover:bg-cloud"
                    >
                      Cancel subscription
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-slate">Cancel at period end?</span>
                      <button type="button" onClick={cancelSubscription} disabled={action === "cancel"} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60">
                        {action === "cancel" ? "Scheduling…" : "Yes, cancel"}
                      </button>
                      <button type="button" onClick={() => setConfirmCancel(false)} className="px-3 py-2 rounded-lg border border-line text-sm font-semibold">Keep plan</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Credits</h2>
                <p className="text-sm text-slate mt-1">Soonest-expiring credits are used first.</p>
              </div>
              <div className="text-right">
                <strong className="text-2xl text-ink tabular-nums">{summary?.available_credits?.toLocaleString() || 0}</strong>
                <p className="text-xs text-slate">available</p>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-paper divide-y divide-line">
              {summary?.credit_grants?.length ? summary.credit_grants.map((grant, index) => (
                <div key={`${grant.source_type}-${grant.expires_at}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center"><Coins size={19} weight="fill" /></div>
                    <div>
                      <p className="font-medium text-ink">{grant.source_type === "payg" ? "Pay-as-you-go" : grant.source_type === "subscription_cycle" ? "Monthly plan" : "Credit balance"}</p>
                      <p className="text-xs text-slate">Expires {date(grant.expires_at)}</p>
                    </div>
                  </div>
                  <div className="sm:text-right tabular-nums">
                    <p className="font-semibold text-ink">{grant.available_credits.toLocaleString()} available</p>
                    {grant.reserved_credits > 0 && <p className="text-xs text-slate">{grant.reserved_credits.toLocaleString()} reserved</p>}
                  </div>
                </div>
              )) : (
                <div className="p-6 text-sm text-slate">No credits yet. Choose a package below to begin.</div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink mb-4">Choose a package</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map(plan => {
                const working = action === `checkout:${plan.code}`;
                return (
                  <div key={plan.code} className={`rounded-xl bg-paper p-5 ${plan.code === "pro" ? "border-2 border-accent" : "border border-line"}`}>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h3 className="font-semibold text-ink">{plan.name}</h3>
                      {plan.code === "pro" && <span className="text-[11px] font-semibold text-accent">Popular</span>}
                    </div>
                    <p className="text-2xl font-bold text-ink tabular-nums">{money(plan.final_price_paise)}</p>
                    <p className="text-xs text-slate mt-1">{plan.recurring ? "per month" : "one-time · valid 6 months"}</p>
                    <p className="text-sm text-ink-2 mt-4 mb-5">{plan.included_credits.toLocaleString()} credits</p>
                    <button
                      type="button"
                      onClick={() => startCheckout(plan.code)}
                      disabled={Boolean(action)}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${plan.code === "pro" ? "bg-accent text-paper hover:bg-accent-ink" : "border border-line-2 text-ink hover:bg-cloud"}`}
                    >
                      {working && <CircleNotch size={17} className="animate-spin" />}
                      {working ? "Opening…" : plan.code === "payg" ? "Buy credits" : `Buy ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Payment history</h2>
                <p className="text-sm text-slate mt-1">GST is included in every displayed total.</p>
              </div>
              <Receipt size={22} className="text-slate" />
            </div>
            <div className="rounded-xl border border-line bg-paper overflow-x-auto">
              {payments.length ? (
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-cloud text-slate border-b border-line">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Package</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">GST</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td className="px-5 py-4 text-slate">{date(payment.captured_at || payment.created_at)}</td>
                        <td className="px-5 py-4 font-medium text-ink">{payment.plan_name}</td>
                        <td className="px-5 py-4 text-ink tabular-nums">{money(payment.total_amount_paise)}</td>
                        <td className="px-5 py-4 text-slate tabular-nums">{money(payment.gst_amount_paise)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold capitalize ${statusTone(payment.status)}`}>
                            {payment.status}
                          </span>
                          {payment.review_required && <span className="ml-2 text-xs text-amber-400">Review required</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 flex items-center gap-3 text-sm text-slate"><Clock size={20} /> No payments recorded yet.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
