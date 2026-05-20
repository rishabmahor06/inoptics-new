/**
 * Centralised mail service.
 *
 * Each exported function builds the HTML body for one template, then sends it
 * via send_mail.php. Import only the function you need:
 *
 *   import { sendLoginMail, sendStallConfirmation } from "../services/mailService";
 *   await sendLoginMail({ company_name, email, password });
 *
 * All functions return: { ok: boolean, message?: string }
 */
import toast from "react-hot-toast";

const API = "/api";

const TEMPLATES = {
  LOGIN:           "Exhibitor Login & Password",
  STALL:           "InOptics 2026 @ Stall Booking Confirmation",
  POWER:           "InOptics 2026 @ Power Requirement Confirmation",
  BADGE:           "InOptics 2026 @ Badge Request Confirmation",
  FURNITURE_UNLOCK:"InOptics 2026 @ Extra Furniture Section Unlocked",
};

/* ─────────────────────────── helpers ─────────────────────────── */

const wrapHtml = (inner) => `
<html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif; font-size:14px; line-height:1.5;">
    ${inner}
  </body>
</html>`.replace(/bsp;*/g, "");

const fetchTemplate = async (emailName) => {
  try {
    const res = await fetch(`${API}/get_email_templates.php`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data?.data || []);
    return list.find((t) => t.email_name === emailName) || null;
  } catch {
    return null;
  }
};

const fetchPayments = async (endpoint, companyName) => {
  try {
    const r = await fetch(`${API}/${endpoint}?company_name=${encodeURIComponent(companyName)}`);
    const d = await r.json();
    if (!d?.success || !Array.isArray(d.records)) return [];
    return d.records.map((p) => ({
      type:          p.payment_type      || "",
      date:          p.payment_date      || "",
      exhibitorBank: p.exhibitor_bank_name || "",
      receiverBank:  p.receiver_bank_name  || "",
      amount:        parseFloat(p.amount_paid || 0),
      tds:           parseFloat(p.tds || 0),
    }));
  } catch {
    return [];
  }
};

const buildPaymentBlock = (payments, grandTotal, currency = "INR") => {
  if (!payments.length) {
    return `<br><div style="margin-top:12px; font-weight:bold; color:red;">No payments recorded yet.</div>`;
  }
  const rows = payments.map((p) => `
    <tr>
      <td>${p.type || "-"}</td>
      <td>${p.date || "-"}</td>
      <td>${p.exhibitorBank || "-"}</td>
      <td>${p.receiverBank || "-"}</td>
      <td>${parseFloat(p.amount || 0).toFixed(2)} ${currency}</td>
      <td>${parseFloat(p.tds || 0).toFixed(2)} ${currency}</td>
    </tr>`).join("");

  const table = `
    <br><h3 style="margin-top:10px;">Payment Details</h3>
    <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; width:100%; font-family:Arial; font-size:13px;">
      <thead style="background:#f2f2f2;">
        <tr>
          <th>Payment Type</th><th>Payment Date</th><th>Exhibitor Bank</th>
          <th>Receiver Bank</th><th>Received Payment</th><th>TDS</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  const paid = payments.reduce((s, p) => s + (p.amount || 0) + (p.tds || 0), 0);
  const pending = grandTotal - paid;
  const status = `
    <div style="margin-top:12px; font-weight:bold; color:${pending <= 0 ? "green" : "red"};">
      ${pending <= 0 ? "PAYMENT CLEARED" : `PENDING AMOUNT: ${pending.toFixed(2)} ${currency}`}
    </div>`;
  return table + status;
};

const sendMail = async ({ emailName, to, html, company_name, secondary_emails }) => {
  try {
    const res = await fetch(`${API}/send_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email_name: emailName,
        to,
        html,
        company_name,
        secondary_emails: secondary_emails || "",
      }),
    });
    const text = await res.text();
    const result = text ? JSON.parse(text) : {};
    if (res.ok) {
      toast.success("Mail sent successfully");
      return { ok: true };
    }
    toast.error(result.message || "Failed to send mail");
    return { ok: false, message: result.message };
  } catch (err) {
    console.error("Send mail error:", err);
    toast.error("Failed to send mail");
    return { ok: false, message: err.message };
  }
};

/* ─────────────────── 1. LOGIN MAIL ─────────────────── */

export async function sendLoginMail({ company_name, email, password, secondary_emails }) {
  if (!email || !company_name) {
    toast.error("Company name or email missing");
    return { ok: false };
  }
  const tpl = await fetchTemplate(TEMPLATES.LOGIN);
  if (!tpl) { toast.error("Login template not found"); return { ok: false }; }

  let html = String(tpl.content || "")
    .replace(/&n/g, "<br>")
    .replace(/Company Name\s*:?\s*/i, `Company Name: ${company_name}<br>`)
    .replace(/Login Id\s*:?\s*/i,    `Login Id: ${email}<br>`)
    .replace(/Password\s*:?\s*/i,    `Password: ${password}<br>`)
    .replace(/(https?:\/\/[^\s"<]+)/i, `<a href="$1">$1</a>`);

  return sendMail({
    emailName: TEMPLATES.LOGIN,
    to: email,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── 2. STALL CONFIRMATION ─────────────────── */

export async function sendStallConfirmation({ company_name, email, secondary_emails, stallList }) {
  if (!stallList?.length) {
    toast.error("No stall details to send");
    return { ok: false };
  }
  const tpl = await fetchTemplate(TEMPLATES.STALL);
  if (!tpl) { toast.error("Stall template not found"); return { ok: false }; }

  const join = (k) => stallList.map((s) => s[k] ?? "-").join(", ");
  const sum  = (k) => stallList.reduce((s, r) => s + (parseFloat(r[k]) || 0), 0).toFixed(2);

  const stallNumber   = join("stall_number");
  const stallCategory = join("stall_category");
  const stallArea     = stallList.map((s) => `${parseFloat(s.stall_area || 0)} sq mtr`).join(", ");
  const grandTotal    = sum("grand_total");
  const fortyPercent  = (parseFloat(grandTotal) * 0.4).toFixed(2);

  let html = String(tpl.content || "")
    .trim()
    .replace(/&n\s*/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\[Company Name\]/gi,         company_name)
    .replace(/\[stall no\]/gi,             stallNumber)
    .replace(/\[stall area\]/gi,           stallArea)
    .replace(/\[stall category\]/gi,       stallCategory)
    .replace(/\[Grand Total\]/gi,          `Rs.${grandTotal}`)
    .replace(/\[40% of Grand Total\]/gi,   `Rs.${fortyPercent}`);

  return sendMail({
    emailName: TEMPLATES.STALL,
    to: email,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── 3. POWER CONFIRMATION ─────────────────── */

export async function sendPowerConfirmation({
  company_name, email, secondary_emails, state, previewList,
}) {
  if (!previewList?.length) {
    toast.error("No power requirement data to send");
    return { ok: false };
  }
  const tpl = await fetchTemplate(TEMPLATES.POWER);
  if (!tpl) { toast.error("Power template not found"); return { ok: false }; }

  const payments = await fetchPayments("get_exhibitor_power_payment.php", company_name);

  const setup      = previewList.find((r) => (r.day || "").toLowerCase().includes("setup"));
  const exhibition = previewList.find((r) => (r.day || "").toLowerCase().includes("exhibition"));

  const lineFor = (r, fallbackLabel) => r
    ? `Days: ${r.day || fallbackLabel}<br>Price per KW: ${r.pricePerKw || "-"}<br>Power Required: ${r.powerRequired || "-"} unit<br>Phase: ${r.phase || "-"}<br>Total Amount: ${parseFloat(r.totalAmount || 0).toFixed(2)} INR`
    : "";

  const setupText      = lineFor(setup, "SETUP DAYS");
  const exhibitionText = lineFor(exhibition, "EXHIBITION DAYS");

  const totalPrice = previewList.reduce((s, r) => s + (parseFloat(r.totalAmount) || 0), 0);
  const isDelhi    = String(state || "").toLowerCase() === "delhi";
  const sgst       = isDelhi ? totalPrice * 0.09 : 0;
  const cgst       = isDelhi ? totalPrice * 0.09 : 0;
  const igst       = isDelhi ? 0                 : totalPrice * 0.18;
  const grandTotal = totalPrice + sgst + cgst + igst;

  let html = String(tpl.content || "")
    .replace(/\\+/g, "")
    .replace(/\r\n|\n/g, "<br>")
    .replace(
      /POWER REQUIREMENT DETAILS[\s\S]*?---------------------------------------------------------[\s\S]*?---------------------------------------------------------/i,
      `POWER REQUIREMENT DETAILS<br>---------------------------------------------------------<br>${setupText}${setupText && exhibitionText ? "<br><br>" : ""}${exhibitionText}<br>---------------------------------------------------------`,
    )
    .replace(/Total Price\s*:?\s*[^\n<br>]*/i,    `Total Price: ${totalPrice.toFixed(2)} INR`)
    .replace(/SGST\s*\(9%\)\s*:?\s*[^\n<br>]*/i,  `SGST(9%): ${sgst.toFixed(2)} INR`)
    .replace(/CGST\s*\(9%\)\s*:?\s*[^\n<br>]*/i,  `CGST(9%): ${cgst.toFixed(2)} INR`)
    .replace(/IGST\s*\(18%\)\s*:?\s*[^\n<br>]*/i, `IGST(18%): ${igst.toFixed(2)} INR`)
    .replace(/GRAND TOTAL\s*:?\s*[^\n<br>]*/i,    `GRAND TOTAL: ${grandTotal.toFixed(2)} INR`);

  html += buildPaymentBlock(payments, grandTotal, "INR");

  return sendMail({
    emailName: TEMPLATES.POWER,
    to: email,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── 4. BADGE REQUEST ─────────────────── */

export async function sendBadgeConfirmation({
  company_name, email, secondary_emails, extra_badges, state,
}) {
  const count = parseInt(extra_badges || 0, 10);
  if (count <= 0) {
    toast.error("No extra badges requested");
    return { ok: false };
  }
  const tpl = await fetchTemplate(TEMPLATES.BADGE);
  if (!tpl) { toast.error("Badge template not found"); return { ok: false }; }

  const payments = await fetchPayments("get_exhibitor_badge_payment.php", company_name);

  const rate    = new Date() > new Date("2026-03-21") ? 200 : 100;
  const total   = count * rate;
  const isDelhi = String(state || "").toLowerCase() === "delhi";
  const sgst    = isDelhi ? total * 0.09 : 0;
  const cgst    = isDelhi ? total * 0.09 : 0;
  const igst    = isDelhi ? 0            : total * 0.18;
  const grandTotal = total + sgst + cgst + igst;

  let html = String(tpl.content || "")
    .replace(/\\+/g, "")
    .replace(/\r\n|\n/g, "<br>")
    .replace(/Additional Badges\s*:?\s*([^\n<br>]*)?/i, `Additional Badges: ${count}`)
    .replace(/Rate per Badge\s*:?\s*([^\n<br>]*)?/i,    `Rate per Badge: ${rate.toFixed(2)}`)
    .replace(/Total Price\s*:?\s*([^\n<br>]*)?/i,       `Total Price: ${total.toFixed(2)}`)
    .replace(/SGST\s*\(9%\)\s*:?\s*([^\n<br>]*)?/i,     `SGST(9%): ${sgst.toFixed(2)}`)
    .replace(/CGST\s*\(9%\)\s*:?\s*([^\n<br>]*)?/i,     `CGST(9%): ${cgst.toFixed(2)}`)
    .replace(/IGST\s*\(18%\)\s*:?\s*([^\n<br>]*)?/i,    `IGST(18%): ${igst.toFixed(2)}`)
    .replace(/GRAND TOTAL\s*:?\s*([^\n<br>]*)?/i,       `GRAND TOTAL: ${grandTotal.toFixed(2)}`);

  html += buildPaymentBlock(payments, grandTotal, "INR");

  return sendMail({
    emailName: TEMPLATES.BADGE,
    to: email,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── 5. FURNITURE UNLOCK ─────────────────── */

export async function sendFurnitureUnlockMail({ company_name, email, secondary_emails }) {
  if (!email || !company_name) {
    toast.error("Company name or email missing");
    return { ok: false };
  }
  const tpl = await fetchTemplate(TEMPLATES.FURNITURE_UNLOCK);
  if (!tpl) { toast.error("Furniture unlock template not found"); return { ok: false }; }

  const html = String(tpl.content || "")
    .replace(/\[Company Name\]/gi, company_name)
    .replace(/\[Email\]/gi,        email)
    .replace(/&n/g, "<br>");

  return sendMail({
    emailName: TEMPLATES.FURNITURE_UNLOCK,
    to: email,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── generic escape hatch ─────────────────── */

/**
 * Send any pre-built HTML with any template name.
 * Use this when none of the above helpers fits your need.
 */
export async function sendCustomMail({ emailName, to, html, company_name, secondary_emails }) {
  return sendMail({
    emailName,
    to,
    html: wrapHtml(html),
    company_name,
    secondary_emails,
  });
}

/* ─────────────────── 6. EXTRA FURNITURE (vendor + exhibitor) ─────────────────── */

const fetchTemplateByName = fetchTemplate; // alias for readability

export async function sendFurnitureOrderMails({
  // exhibitor
  company_name, name, mobile, email, stall_no, secondary_emails,
  // vendor
  vendor,           // { vendor_name, company_name, email|vendor_email, contact_number|mobile }
  // items
  selectedFurniture, // [{ name, quantity, price }]
  // template names (admin saved both)
  vendorTemplateName,
  exhibitorTemplateName = "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
}) {
  if (!company_name || !email) { toast.error("Missing exhibitor data"); return { ok: false }; }
  if (!selectedFurniture?.length) { toast.error("No furniture selected"); return { ok: false }; }

  const vendorEmail =
    vendor?.email || vendor?.vendor_email || vendor?.vendorEmail || vendor?.contact_email;
  if (!vendorEmail) { toast.error("Vendor email missing"); return { ok: false }; }

  const vendorTpl    = await fetchTemplateByName(vendorTemplateName);
  const exhibitorTpl = await fetchTemplateByName(exhibitorTemplateName);
  if (!vendorTpl || !exhibitorTpl) { toast.error("Email template not found"); return { ok: false }; }

  let totalAmount = 0, totalSGST = 0, totalCGST = 0, grandTotal = 0;
  const rows = selectedFurniture.map((item) => {
    const qty  = Number(item.quantity);
    const rate = Number(item.price);
    const amt  = qty * rate;
    const sgst = amt * 0.09;
    const cgst = amt * 0.09;
    const total = amt + sgst + cgst;
    totalAmount += amt; totalSGST += sgst; totalCGST += cgst; grandTotal += total;
    return `
      <tr>
        <td>${item.name}</td>
        <td align="center">${qty}</td>
        <td align="right">${rate.toFixed(2)}</td>
        <td align="right">${amt.toFixed(2)}</td>
        <td align="right">${sgst.toFixed(2)}</td>
        <td align="right">${cgst.toFixed(2)}</td>
        <td align="right">${total.toFixed(2)}</td>
      </tr>`;
  }).join("");

  const furnitureTable = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px">
      <thead style="background:#f2f2f2">
        <tr>
          <th>Item Name</th><th>Qty</th><th>Rate</th><th>Amount</th>
          <th>SGST (9%)</th><th>CGST (9%)</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="font-weight:bold;background:#fafafa">
          <td colspan="3" align="right">TOTAL</td>
          <td align="right">${totalAmount.toFixed(2)}</td>
          <td align="right">${totalSGST.toFixed(2)}</td>
          <td align="right">${totalCGST.toFixed(2)}</td>
          <td align="right">${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>`;

  const replaceData = {
    "[Company_Name]":         company_name,
    "[Contact_Person_Name]":  name,
    "[Mobile_Number]":        mobile,
    "[Email_Address]":        email,
    "[Stall_No]":             stall_no,
    "[Vendor_Name]":          vendor?.vendor_name    || "",
    "[Vendor_Company]":       vendor?.company_name   || "",
    "[Vendor_Email]":         vendorEmail,
    "[Vendor_Phone]":         vendor?.contact_number || vendor?.mobile || "",
    "[Furniture_Table]":      furnitureTable,
    "[Exhibitor_Name]":       name,
    "[Phone_Number]":         mobile,
  };

  const replaceTemplate = (template) => {
    let html = String(template || "");
    Object.keys(replaceData).forEach((k) => { html = html.replaceAll(k, replaceData[k] ?? ""); });
    return html.replace(/&n/g, "<br>");
  };

  const vendorHTML    = replaceTemplate(vendorTpl.content);
  const exhibitorHTML = replaceTemplate(exhibitorTpl.content);

  try {
    const vRes = await fetch(`${API}/send_furniture_vendor_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_name: vendorTemplateName, to: vendorEmail, html: vendorHTML }),
    });
    const vData = await vRes.json();
    if (!String(vData?.message || "").includes("successfully")) {
      toast.error("Vendor mail failed");
      return { ok: false };
    }

    const eRes = await fetch(`${API}/send_furniture_vendor_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_name: exhibitorTemplateName, to: email, html: exhibitorHTML }),
    });
    const eData = await eRes.json();
    if (String(eData?.message || "").includes("successfully")) {
      toast.success("Furniture mails sent");
      return { ok: true };
    }
    toast.error("Vendor mail sent but exhibitor mail failed");
    return { ok: false };
  } catch (err) {
    console.error("Furniture mail error:", err);
    toast.error("Error sending furniture mail");
    return { ok: false };
  }
}

/* ─────────────────── 7. POWER — unlock + confirmation mail ─────────────────── */

export async function unlockPowerRequirement(company_name) {
  if (!company_name) { toast.error("Company name missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/update_unlock_power_requirement.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      toast.error(data?.message || "Failed to unlock");
      return { ok: false, message: data?.message };
    }
    toast.success("Power Requirement unlocked");

    // Fire-and-forget confirmation mail
    fetch(`${API}/send_power_unlocked_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name,
        template_name: "InOptics 2026 @ Successfully Unlocked Power Requirement",
      }),
    }).catch(() => {});

    return { ok: true };
  } catch (err) {
    console.error("Unlock power error:", err);
    toast.error("Error unlocking power");
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 8. BADGES — unlock + confirmation mail ─────────────────── */

export async function unlockExhibitorBadges(company_name) {
  if (!company_name) { toast.error("No company selected"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/unlock_exhibitor_badges.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name }),
    });
    const data = await res.json();
    if (!(data?.status === "success" || data?.success)) {
      toast.error(data?.message || "Failed to unlock badges");
      return { ok: false, message: data?.message };
    }
    toast.success("Exhibitor badges unlocked");

    const mailRes = await fetch(`${API}/unlocked_exhibitor_badges_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name,
        template_name: "InOptics 2026 @ Successfully Unlocked Badges Requirement",
      }),
    });
    const mailData = await mailRes.json().catch(() => ({}));
    if (mailData?.success) toast.success("Unlock mail sent to exhibitor");
    return { ok: true };
  } catch (err) {
    console.error("Unlock badges error:", err);
    toast.error("Error unlocking badges");
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 9. CONTRACTOR REGISTRATION MAIL ─────────────────── */

export async function sendContractorRegistrationMail({ email, filename }) {
  if (!email) { toast.error("Contractor email required"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/send-contractor-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, file: filename || "" }),
    });
    await res.json().catch(() => ({}));
    toast.success("Mail sent successfully");
    return { ok: true };
  } catch (err) {
    console.error("Contractor mail error:", err);
    toast.error("Failed to send mail");
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 10. POWER LOAD INCREASED (exhibitor) ─────────────────── */

export async function sendPowerRevisedMail({ company_name, email }) {
  if (!company_name || !email) { toast.error("Company/email missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/send_power_revised_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name,
        template_name: "POWER LOAD INCREASED",
        email,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data?.message };
  } catch (err) {
    console.error("Power revised mail error:", err);
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 11. POWER LOAD INCREASED (vendor) ─────────────────── */

export async function sendPowerVendorMail({ company_name }) {
  if (!company_name) { toast.error("Company missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/send_power_vendor_mail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_name: "Revised Power Load Vendor",
        company_name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data?.message };
  } catch (err) {
    console.error("Power vendor mail error:", err);
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 12. POWER REQUIREMENT TO ADMIN ─────────────────── */

export async function sendPowerMailToAdmin({ company_name }) {
  if (!company_name) { toast.error("Company missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/send_power_mail_to_admin.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_name: "InOptics 2026 @ Exhibitor Power Requirement Confirmation",
        company_name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data?.message };
  } catch (err) {
    console.error("Power admin mail error:", err);
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 13. POWER REQUIREMENT TO VENDOR (initial) ─────────────────── */

export async function sendPowerMailToVendor({ company_name }) {
  if (!company_name) { toast.error("Company missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/send_power_mail_to_vendor.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name,
        template_name: "Power Requirement by Exhibitor",
      }),
    });
    const result = await res.json().catch(() => ({}));
    if (res.ok && result?.success) return { ok: true };
    toast.error(result?.message || "Failed to send vendor mail");
    return { ok: false, message: result?.message };
  } catch (err) {
    console.error("Power vendor (initial) mail error:", err);
    toast.error("Network error sending mail");
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 14. FURNITURE UNLOCK + NOTIFY ─────────────────── */

export async function unlockExtraFurniture(company_name) {
  if (!company_name) { toast.error("Company name missing"); return { ok: false }; }
  try {
    const res = await fetch(`${API}/admin_unlock_furniture.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!(data?.status === "success" || data?.status === "unlocked")) {
      toast.error(data?.message || "Failed to unlock furniture");
      return { ok: false, message: data?.message };
    }
    toast.success("Furniture unlocked");
    return { ok: true };
  } catch (err) {
    console.error("Unlock furniture error:", err);
    toast.error("Error unlocking furniture");
    return { ok: false, message: err.message };
  }
}

/* ─────────────────── 15. PROFORMA INVOICE PDF EMAIL (Stall / Power) ─────────────────── */

/**
 * Renders an existing DOM element (the proforma invoice template) to a PDF
 * and emails it as an attachment.
 *
 * @param {Object}    p
 * @param {string}    p.elementId        - DOM id of the invoice template element
 * @param {"stall"|"power"} p.section    - which section the invoice represents
 * @param {string}    p.company_name     - for filename and email body
 * @param {string}    p.to_email         - recipient
 */
export async function sendProformaInvoicePdfMail({
  elementId = "invoice-template",
  section = "stall",
  company_name,
  to_email,
}) {
  if (!to_email)     { toast.error("Recipient email missing"); return { ok: false }; }
  if (!company_name) { toast.error("Company name missing");    return { ok: false }; }
  const element = document.getElementById(elementId);
  if (!element)      { toast.error("Invoice template not found"); return { ok: false }; }

  try {
    const { default: jsPDF } = await import("jspdf");

    // Tighten word/letter spacing on the element tree so the rendered PDF
    // matches the on-screen invoice exactly.
    const applyStyleRecursively = (el) => {
      el.style.wordSpacing   = "-0.5px";
      el.style.letterSpacing = "-0.05px";
      Array.from(el.children).forEach(applyStyleRecursively);
    };
    applyStyleRecursively(element);

    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [595, 842],
      hotfixes: ["px_scaling"],
    });
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginTop = 20, marginLeft = 10, marginRight = 10;
    const elementWidth  = element.scrollWidth;
    const elementHeight = element.scrollHeight;
    const scaleX = (pageWidth - marginLeft - marginRight) / elementWidth;
    const scaleY = (pageHeight - marginTop) / elementHeight;
    const scale  = Math.min(scaleX, scaleY);

    const pdfBlob = await new Promise((resolve) => {
      pdf.html(element, {
        x: marginLeft,
        y: marginTop,
        html2canvas: { scale, useCORS: true, scrollY: 0 },
        width: pageWidth - marginLeft - marginRight,
        autoPaging: "text",
        callback: (instance) => resolve(instance.output("blob")),
      });
    });

    const labelLower = section === "power" ? "POWER" : "STALLS";
    const fileName   = `${company_name}_${labelLower === "POWER" ? "Power" : "Stalls"}_Proforma_Invoice.pdf`;
    const subject    = `Proforma Invoice of ${labelLower} - ${company_name}`;
    const body       = `Dear ${company_name},\n\nPlease find your Proforma Invoice for ${labelLower === "POWER" ? "Power" : "Stalls"} attached.\n\nRegards,\nInOptics Accounts`;

    const endpoint = section === "power"
      ? `${API}/send-invoice-PowerPayment-email.php`
      : `${API}/send-invoice-StallPayment-email.php`;

    const form = new FormData();
    form.append("pdf", new File([pdfBlob], fileName, { type: "application/pdf" }));
    form.append("to_email", to_email);
    form.append("subject", subject);
    form.append("body", body);

    const res = await fetch(endpoint, { method: "POST", body: form });
    if (!res.ok) {
      toast.error("Failed to send invoice email");
      return { ok: false };
    }
    toast.success("Invoice email sent");
    return { ok: true };
  } catch (err) {
    console.error("Proforma invoice mail error:", err);
    toast.error("Failed to send invoice email");
    return { ok: false, message: err.message };
  }
}

/* export templates map for callers that need the canonical names */
export { TEMPLATES };
