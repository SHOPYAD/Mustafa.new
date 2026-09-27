export type OAuthGatewayProps = {
  provider: string;
  credentialsUrl?: string;
  providerTitleAr: string;
  providerEnglishName: string;
  providerIconSvg: string;
  brandColor: string;
  redirectUri: string;
  steps: Array<{
    stepNumber: number;
    titleAr: string;
    descriptionAr: string;
    actionUrl?: string;
    actionLabelAr?: string;
  }>;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    helpTextAr?: string;
    isSecret?: boolean;
  }>;
  developerPortalUrl: string;
};

export function renderOAuthGatewayHtml(props: OAuthGatewayProps): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>بوابة ربط ${props.providerTitleAr} - ${props.providerEnglishName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --brand: ${props.brandColor};
      --bg: #090d16;
      --card-bg: rgba(15, 23, 42, 0.95);
      --border: rgba(255, 255, 255, 0.1);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15), transparent 70%), var(--bg);
      color: var(--text);
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      padding: 20px 16px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .container {
      width: 100%;
      max-width: 560px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 28px 24px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px var(--brand);
      backdrop-filter: blur(20px);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .icon-wrapper svg {
      width: 30px;
      height: 30px;
      fill: currentColor;
    }
    .title-group h1 {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      line-height: 1.3;
    }
    .title-group p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #cbd5e1;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title span {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--brand);
    }

    /* Steps Guide */
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 22px;
    }
    .step-item {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 12px 14px;
      transition: all 0.2s;
    }
    .step-item:hover {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.12);
    }
    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .step-num-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .step-badge {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: var(--brand);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-title {
      font-size: 13px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .step-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 6px;
      line-height: 1.5;
      padding-right: 34px;
    }
    .step-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      hover:background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 5px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .step-action-btn:hover {
      background: var(--brand);
      border-color: var(--brand);
      transform: translateY(-1px);
    }

    /* Copy URI Box */
    .copy-box {
      background: rgba(15, 23, 42, 0.9);
      border: 1px dashed rgba(148, 163, 184, 0.3);
      border-radius: 16px;
      padding: 12px 14px;
      margin-bottom: 22px;
    }
    .copy-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .copy-label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
    }
    .copy-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 3px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .uri-text {
      font-family: monospace;
      font-size: 11px;
      color: #e2e8f0;
      word-break: break-all;
      direction: ltr;
      text-align: left;
      background: rgba(0,0,0,0.3);
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.05);
    }

    /* Form Inputs */
    .form-group {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 6px;
    }
    .input-wrapper {
      position: relative;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      color: #fff;
      font-size: 13px;
      font-family: monospace;
      outline: none;
      transition: all 0.2s;
    }
    input:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
      background: #1e293b;
    }
    .help-text {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* Submit Button */
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--brand), #4f46e5);
      border: none;
      border-radius: 16px;
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      margin-top: 10px;
      box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-submit:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }
    .btn-submit:active {
      transform: scale(0.98);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .status-alert {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      display: none;
    }
    .status-alert.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .status-alert.success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    .footer-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: #a78bfa;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon-wrapper" style="color: var(--brand);">
        ${props.providerIconSvg}
      </div>
      <div class="title-group">
        <h1>بوابة ربط ${props.providerTitleAr}</h1>
        <p>تفعيل نافذة تسجيل الدخول والمصادقة الرسمية لـ ${props.providerEnglishName}</p>
      </div>
    </div>

    <!-- Steps Guide -->
    <div class="section-title">
      <span></span>
      <h3>خطوات الحصول على المفاتيح وتفعيل الربط المباشر (دقيقة واحدة):</h3>
    </div>

    <div class="steps-list">
      ${props.steps
        .map(
          (s) => `
        <div class="step-item">
          <div class="step-header">
            <div class="step-num-title">
              <div class="step-badge">${s.stepNumber}</div>
              <div class="step-title">${s.titleAr}</div>
            </div>
            ${
              s.actionUrl
                ? `<a href="${s.actionUrl}" target="_blank" rel="noreferrer" class="step-action-btn">
                    <span>${s.actionLabelAr || "فتح الرابط ↗"}</span>
                  </a>`
                : ""
            }
          </div>
          <div class="step-desc">${s.descriptionAr}</div>
        </div>
      `
        )
        .join("")}
    </div>

    <!-- OAuth Callback URL Box -->
    <div class="copy-box">
      <div class="copy-header">
        <span class="copy-label">رابط إعادة التوجيه المصرح به (OAuth Redirect URI):</span>
        <button type="button" class="copy-btn" id="copyBtn" onclick="copyRedirectUri()">📋 نسخ الرابط</button>
      </div>
      <div class="uri-text" id="uriText">${props.redirectUri}</div>
    </div>

    <!-- Key Input Form -->
    <form id="gatewayForm">
      ${props.fields
        .map(
          (f) => `
        <div class="form-group">
          <label for="${f.key}">${f.label}</label>
          <div class="input-wrapper">
            <input
              type="${f.isSecret ? "password" : "text"}"
              id="${f.key}"
              name="${f.key}"
              placeholder="${f.placeholder}"
              autocomplete="off"
              required
            />
          </div>
          ${f.helpTextAr ? `<div class="help-text">${f.helpTextAr}</div>` : ""}
        </div>
      `
        )
        .join("")}

      <button type="submit" id="submitBtn" class="btn-submit">
        <span>⚡ حفظ وبدء تسجيل الدخول الرسمي عبر ${props.providerEnglishName}</span>
      </button>

      <div id="statusAlert" class="status-alert"></div>
    </form>

    <a href="${props.developerPortalUrl}" target="_blank" rel="noreferrer" class="footer-link">
      🔗 الدخول المباشر إلى ${props.developerPortalUrl} ↗
    </a>
  </div>

  <script>
    function copyRedirectUri() {
      const text = document.getElementById('uriText').innerText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.innerText = '✅ تم النسخ!';
        setTimeout(() => { btn.innerText = '📋 نسخ الرابط'; }, 2500);
      });
    }

    const form = document.getElementById('gatewayForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusAlert = document.getElementById('statusAlert');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ جاري الحفظ والتوجيه لنافذة الدخول...</span>';
      statusAlert.style.display = 'none';

      const formData = new FormData(form);
      const payload = { provider: '${props.provider}' };
      for (const [k, v] of formData.entries()) {
        payload[k] = v;
      }

      try {
        const res = await fetch('${props.credentialsUrl || "/api/social/credentials"}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          statusAlert.className = 'status-alert success';
          statusAlert.innerText = 'تم حفظ المفاتيح بنجاح! جاري تحويلك لنافذة الدخول الرسمية...';
          statusAlert.style.display = 'block';
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          statusAlert.className = 'status-alert error';
          statusAlert.innerText = data.error || 'فشل حفظ المفاتيح، يرجى التأكد من صحة المدخلات.';
          statusAlert.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>⚡ حفظ وبدء تسجيل الدخول الرسمي عبر ${props.providerEnglishName}</span>';
        }
      } catch (err) {
        statusAlert.className = 'status-alert error';
        statusAlert.innerText = 'حدث خطأ أثناء الاتصال بالسيرفر.';
        statusAlert.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>⚡ حفظ وبدء تسجيل الدخول الرسمي عبر ${props.providerEnglishName}</span>';
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderOAuthPickerHtml(opts: {
  provider: string;
  titleAr: string;
  descriptionAr: string;
  actionUrl: string;
  pendingId: string;
  fieldName: string;
  options: Array<{ id: string; label: string; hint?: string }>;
}): string {
  const optionsHtml = opts.options
    .map(
      (row, i) => `
      <label class="option ${i === 0 ? "selected" : ""}">
        <input type="radio" name="${escapeHtml(opts.fieldName)}" value="${escapeHtml(row.id)}" ${i === 0 ? "checked" : ""} />
        <span>
          <strong>${escapeHtml(row.label)}</strong>
          ${row.hint ? `<em>${escapeHtml(row.hint)}</em>` : ""}
        </span>
      </label>`
    )
    .join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(opts.titleAr)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: Cairo, system-ui, sans-serif; background: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(148,163,184,.2); border-radius: 24px; padding: 28px 22px; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .option { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid #334155; border-radius: 14px; margin: 8px 0; cursor: pointer; }
    .option.selected, .option:has(input:checked) { border-color: #7c3aed; background: rgba(124,58,237,.12); }
    .option strong { display: block; font-size: 13px; }
    .option em { display: block; font-size: 11px; color: #94a3b8; font-style: normal; }
    button { width: 100%; margin-top: 16px; padding: 12px; border: 0; border-radius: 14px; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: #fff; font-weight: 800; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(opts.titleAr)}</h1>
    <p>${escapeHtml(opts.descriptionAr)}</p>
    <form method="POST" action="${escapeHtml(opts.actionUrl)}">
      <input type="hidden" name="pendingId" value="${escapeHtml(opts.pendingId)}" />
      ${optionsHtml}
      <button type="submit">تأكيد الربط</button>
    </form>
  </div>
</body>
</html>`;
}

