import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  MdBadge,
  MdEmail,
  MdInfoOutline,
  MdLock,
  MdLockOpen,
  MdReceiptLong,
  MdSave,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";

const API = "https://inoptics.in/api";
const BASE_BADGE_RATE = 100;
const LATE_BADGE_RATE = 200;
const LATE_RATE_START = new Date("2026-03-21T00:00:00");

const EMPTY_FORM = {
  company_name: "",
  state: "",
  email: "",
  secondary_emails: "",
  free_badges: "",
  extra_badges: "",
};

const formatCurrency = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

export default function ExhibitorBadgesTab() {
  const { editingExhibitor: ex } = useNavStore();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [savingFree, setSavingFree] = useState(false);
  const [savingExtra, setSavingExtra] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockRequested, setUnlockRequested] = useState(false);

  useEffect(() => {
    if (!ex) {
      setFormData(EMPTY_FORM);
      setIsLocked(false);
      setUnlockRequested(false);
      return;
    }

    setFormData({
      company_name: ex.company_name || "",
      state: ex.state || "",
      email: ex.email || "",
      secondary_emails: ex.secondary_emails || "",
      free_badges: "",
      extra_badges: "",
    });

    fetchBadgeData(ex.company_name, ex);
  }, [ex]);

  const badgeBilling = useMemo(() => {
    const count = Math.max(0, parseInt(formData.extra_badges, 10) || 0);
    const rate = new Date() >= LATE_RATE_START ? LATE_BADGE_RATE : BASE_BADGE_RATE;
    const total = count * rate;
    const isDelhi = (formData.state || "").trim().toLowerCase() === "delhi";
    const cgst = isDelhi ? total * 0.09 : 0;
    const sgst = isDelhi ? total * 0.09 : 0;
    const igst = isDelhi ? 0 : total * 0.18;
    const grandTotal = total + cgst + sgst + igst;

    return {
      count,
      rate,
      total,
      cgst,
      sgst,
      igst,
      grandTotal,
      isDelhi,
    };
  }, [formData.extra_badges, formData.state]);

  if (!ex) return null;

  async function fetchBadgeData(companyName, exhibitor = ex) {
    if (!companyName) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API}/get_Exhibitor_badges.php?company_name=${encodeURIComponent(companyName)}`,
      );
      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        company_name: exhibitor?.company_name || prev.company_name,
        state: exhibitor?.state || prev.state,
        email: exhibitor?.email || prev.email,
        secondary_emails: exhibitor?.secondary_emails || prev.secondary_emails,
        free_badges:
          data?.free_badges !== undefined
            ? String(parseInt(data.free_badges, 10) || 0)
            : prev.free_badges,
        extra_badges:
          data?.extra_badges !== undefined
            ? String(parseInt(data.extra_badges, 10) || 0)
            : prev.extra_badges,
      }));

      setIsLocked(data?.is_locked === "1" || data?.is_locked === 1);
      setUnlockRequested(data?.unlock_requested === "1" || data?.unlock_requested === 1);
    } catch (error) {
      console.error("Badge fetch failed:", error);
      toast.error("Failed to fetch exhibitor badges");
    } finally {
      setLoading(false);
    }
  }

  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpdateFreeExhibitorBadgesSubmit() {
    const value = Number(formData.free_badges);

    if (!formData.free_badges || value <= 0) {
      toast.error("Enter valid free badge count");
      return;
    }

    setSavingFree(true);
    try {
      const res = await fetch(`${API}/update_Exhibitor_Free_badges.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.company_name,
          free_badges: value,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Free badges updated successfully");
        await fetchBadgeData(formData.company_name);
      } else {
        toast.error(data.error || "Failed to update badges");
      }
    } catch (error) {
      console.error("Free badge update failed:", error);
      toast.error("Error updating exhibitor badges");
    } finally {
      setSavingFree(false);
    }
  }

  async function handleExhibitorBadgesSubmit(event) {
    event.preventDefault();

    const extraValue = Number(formData.extra_badges);

    if (extraValue < 0) {
      toast.error("Extra badges cannot be negative");
      return;
    }

    if (Number.isNaN(extraValue)) {
      toast.error("Enter valid extra badge count");
      return;
    }

    setSavingExtra(true);
    try {
      const res = await fetch(`${API}/update_Exhibitor_badges.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.company_name,
          extra_badges: extraValue,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Extra badges updated successfully");
        await fetchBadgeData(formData.company_name);
      } else {
        toast.error(data.error || "Failed to update extra badges");
      }
    } catch (error) {
      console.error("Extra badge update failed:", error);
      toast.error("Error updating exhibitor badges");
    } finally {
      setSavingExtra(false);
    }
  }

  async function handleUnlockBadges() {
    if (!formData.company_name) {
      toast.error("No company selected");
      return;
    }

    if (!window.confirm(`Are you sure you want to unlock badges for ${formData.company_name}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API}/unlock_exhibitor_badges.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: formData.company_name }),
      });

      const data = await res.json();

      if (!(data.status === "success" || data.success)) {
        throw new Error(data.message || "Failed to unlock badges");
      }

      toast.success("Exhibitor badges unlocked successfully");
      setIsLocked(false);
      setUnlockRequested(false);

      try {
        const mailRes = await fetch(`${API}/unlocked_exhibitor_badges_mail.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: formData.company_name,
            template_name: "InOptics 2026 @ Successfully Unlocked Badges Requirement",
          }),
        });

        const mailData = await mailRes.json();
        if (mailData?.success) toast.success("Unlock mail sent successfully");
        else if (mailData) toast.error(mailData.message || "Unlock mail not sent");
      } catch (mailError) {
        console.error("Unlock mail failed:", mailError);
        toast.error("Unlock done, but mail failed");
      }
    } catch (error) {
      console.error("Unlock badges failed:", error);
      toast.error("Error unlocking exhibitor badges");
    }
  }

  async function handleSendBadgeMail() {
    if (isSendingMail) return;
    if (!formData.email) {
      toast.error("Exhibitor email is missing");
      return;
    }
    if (badgeBilling.count <= 0) {
      toast.error("No extra badges requested to send in mail");
      return;
    }

    setIsSendingMail(true);

    try {
      let paymentRecords = [];

      try {
        const paymentRes = await fetch(
          `${API}/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(formData.company_name)}`,
        );
        const paymentData = await paymentRes.json();
        paymentRecords = Array.isArray(paymentData?.records) ? paymentData.records : [];
      } catch (paymentError) {
        console.error("Badge payment fetch failed:", paymentError);
      }

      const html = buildBadgeMailHTML({
        companyName: formData.company_name,
        state: formData.state,
        freeBadges: Number(formData.free_badges || 0),
        extraBadges: badgeBilling.count,
        rate: badgeBilling.rate,
        total: badgeBilling.total,
        cgst: badgeBilling.cgst,
        sgst: badgeBilling.sgst,
        igst: badgeBilling.igst,
        grandTotal: badgeBilling.grandTotal,
        payments: paymentRecords,
      });

      const res = await fetch(`${API}/send_mail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: "InOptics 2026 @ Badge Request Confirmation",
          to: formData.email,
          html,
          company_name: formData.company_name,
          secondary_emails: formData.secondary_emails || "",
        }),
      });

      const data = await res.json();
      if (data.success || data.status === "success") {
        toast.success("Badge confirmation mail sent successfully");
      } else {
        toast.error(data.message || "Failed to send mail");
      }
    } catch (error) {
      console.error("Badge mail failed:", error);
      toast.error("Failed to send badge mail");
    } finally {
      setIsSendingMail(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
       

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <MdInfoOutline size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Badge Policy</h4>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-[13px] leading-6 text-zinc-600">
            <p>
              As per your stall size, you will receive{" "}
              <span className="font-semibold text-zinc-900">{Number(formData.free_badges || 0)}</span>{" "}
              complimentary badge{Number(formData.free_badges || 0) === 1 ? "" : "s"} for the exhibition.
            </p>
            <p>
              Additional badges can be requested at a cost of{" "}
              <span className="font-semibold text-zinc-900">{formatCurrency(BASE_BADGE_RATE)}</span> per badge.
              However, any badge requests made after{" "}
              <span className="font-semibold text-zinc-900">20th March 2026</span> will be charged at{" "}
              <span className="font-semibold text-zinc-900">{formatCurrency(LATE_BADGE_RATE)}</span> per badge.
            </p>
            <p>
              We kindly request you to order only the number of badges you truly need, as issuing excess badges poses a
              potential security risk.
            </p>
            <p>Thank you for your cooperation.</p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h4 className="text-[15px] font-bold text-zinc-900">Update Badge Counts</h4>
            <p className="text-[12px] text-zinc-500">Manage free badges and extra badge request</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <BadgeEditorCard
              title="Free Badges"
              description="Update complimentary badge count."
              value={formData.free_badges}
              onChange={(value) => setField("free_badges", value)}
              buttonLabel={savingFree ? "Updating..." : "Update Free Badges"}
              onSubmit={handleUpdateFreeExhibitorBadgesSubmit}
              disabled={savingFree}
            />

            <BadgeEditorCard
              title="Extra Badges"
              description="Update paid badge request."
              value={formData.extra_badges}
              onChange={(value) => setField("extra_badges", value)}
              buttonLabel={savingExtra ? "Updating..." : "Update Extra Badges"}
              onSubmit={handleExhibitorBadgesSubmit}
              disabled={savingExtra}
            />
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MdReceiptLong size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Billing Summary</h4>
              <p className="text-[12px] text-zinc-500">Based on extra badge request</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <SimpleBillingRow label="Rate per Badge" value={formatCurrency(badgeBilling.rate)} />
            <SimpleBillingRow label="Extra Badges" value={badgeBilling.count} />
            <SimpleBillingRow label="Total Amount" value={formatCurrency(badgeBilling.total)} />
            {badgeBilling.isDelhi ? (
              <>
                <SimpleBillingRow label="CGST (9%)" value={formatCurrency(badgeBilling.cgst)} />
                <SimpleBillingRow label="SGST (9%)" value={formatCurrency(badgeBilling.sgst)} />
              </>
            ) : (
              <SimpleBillingRow label="IGST (18%)" value={formatCurrency(badgeBilling.igst)} />
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <span className="text-[14px] font-bold text-zinc-900">Grand Total</span>
            <span className="text-[18px] font-bold text-blue-700">{formatCurrency(badgeBilling.grandTotal)}</span>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-[15px] font-bold text-zinc-900">Actions</h4>
              <p className="text-[12px] text-zinc-500">Mail and unlock actions</p>
            </div>
            <StatusPill label={isLocked ? "Locked" : "Open"} tone={isLocked ? "rose" : "blue"} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5">
            <ActionButton
              onClick={handleSendBadgeMail}
              disabled={isSendingMail || badgeBilling.count <= 0}
              icon={<MdEmail size={17} />}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {isSendingMail ? "Sending..." : "Send Badge Mail"}
            </ActionButton>

            {isLocked && (
              <ActionButton
                onClick={handleUnlockBadges}
                disabled={unlockRequested}
                icon={unlockRequested ? <MdLock size={17} /> : <MdLockOpen size={17} />}
                className={
                  unlockRequested
                    ? "bg-zinc-200 text-zinc-500"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }
              >
                {unlockRequested ? "Unlock Requested" : "Unlock Badges"}
              </ActionButton>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-3 text-[12px] leading-relaxed text-zinc-500">
            Mail is sent only when extra badges are greater than zero.
          </div>
        </section>
      </div>
    </div>
  );
}

function buildBadgeMailHTML({
  companyName,
  state,
  freeBadges,
  extraBadges,
  rate,
  total,
  cgst,
  sgst,
  igst,
  grandTotal,
  payments,
}) {
  const paymentRows = Array.isArray(payments)
    ? payments
        .map((payment) => {
          const amount = parseFloat(payment.amount_paid || payment.amount || 0);
          const tds = parseFloat(payment.tds || 0);

          return `
            <tr>
              <td style="padding:8px;border:1px solid #e5e7eb;">${payment.payment_type || "-"}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${payment.payment_date || "-"}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${payment.exhibitor_bank_name || "-"}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${payment.receiver_bank_name || "-"}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${amount.toFixed(2)}</td>
              <td style="padding:8px;border:1px solid #e5e7eb;">${tds.toFixed(2)}</td>
            </tr>
          `;
        })
        .join("")
    : "";

  const totalPaidWithTds = Array.isArray(payments)
    ? payments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount_paid || payment.amount || 0);
        const tds = parseFloat(payment.tds || 0);
        return sum + amount + tds;
      }, 0)
    : 0;

  const pendingAmount = grandTotal - totalPaidWithTds;

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="font-family:Arial,sans-serif;background:#f8fafc;color:#1e293b;padding:24px;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a,#0f766e);padding:24px;color:#ffffff;">
            <h2 style="margin:0 0 6px 0;">InOptics 2026 @ Badge Request Confirmation</h2>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">Company: ${companyName}</p>
          </div>

          <div style="padding:24px;">
            <p style="margin-top:0;">Please find your exhibitor badge request summary below.</p>

            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tbody>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">State</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${state || "-"}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">Free Badges</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${freeBadges}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">Additional Badges</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${extraBadges}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">Rate per Badge</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${rate.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">Total Price</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">CGST (9%)</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">SGST (9%)</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${sgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;">IGST (18%)</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;">${igst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #e5e7eb;background:#ecfeff;font-weight:700;">Grand Total</td>
                  <td style="padding:10px;border:1px solid #e5e7eb;font-weight:700;color:#0369a1;">${grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            ${
              paymentRows
                ? `
              <h3 style="margin:24px 0 10px 0;">Payment Details</h3>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Payment Type</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Payment Date</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Exhibitor Bank</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Receiver Bank</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Received Payment</th>
                    <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">TDS</th>
                  </tr>
                </thead>
                <tbody>${paymentRows}</tbody>
              </table>
              <div style="margin-top:14px;font-weight:700;color:${pendingAmount <= 0 ? "#15803d" : "#b91c1c"};">
                ${
                  pendingAmount <= 0
                    ? "PAYMENT CLEARED"
                    : `PENDING AMOUNT: ${pendingAmount.toFixed(2)}`
                }
              </div>
            `
                : `<div style="margin-top:18px;font-weight:700;color:#b91c1c;">No payments recorded yet.</div>`
            }

            <p style="margin:22px 0 0 0;font-size:13px;color:#475569;">
              Thank you for your cooperation.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function BadgeEditorCard({
  title,
  description,
  value,
  onChange,
  buttonLabel,
  onSubmit,
  disabled,
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div>
        <h5 className="text-[15px] font-bold text-zinc-900">{title}</h5>
        <p className="mt-1 text-[12px] text-zinc-500">{description}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event);
        }}
        className="mt-4 space-y-3"
      >
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {title}
          </label>
          <input
            type="number"
            min="0"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[14px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MdSave size={16} />
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

function SimpleBillingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className="text-[13px] font-semibold text-zinc-800">{value}</span>
    </div>
  );
}

function StatusPill({ label, tone }) {
  const toneMap = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${toneMap[tone] || toneMap.blue}`}>
      {label}
    </span>
  );
}
