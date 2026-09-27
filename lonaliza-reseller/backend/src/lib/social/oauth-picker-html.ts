export function renderOAuthChoiceHtml(input: {
  titleAr: string;
  descriptionAr: string;
  pendingId: string;
  actionUrl: string;
  choices: Array<{ id: string; name: string; username?: string }>;
}): string {
  const options = input.choices
    .map(
      (row) =>
        `<label class="choice"><input type="radio" name="choiceId" value="${escapeHtml(row.id)}" required />
          <span><strong>${escapeHtml(row.name)}</strong>${
            row.username ? `<small>@${escapeHtml(row.username)}</small>` : ""
          }</span></label>`
    )
    .join("");

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(input.titleAr)}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 480px; margin: 40px auto; background: #0f172a; border: 1px solid rgba(148,163,184,.2); border-radius: 24px; padding: 28px; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .choice { display: flex; gap: 10px; align-items: center; padding: 12px; border: 1px solid rgba(148,163,184,.2); border-radius: 14px; margin: 8px 0; cursor: pointer; }
    .choice:hover { border-color: #a855f7; }
    small { display: block; color: #64748b; }
    button { width: 100%; margin-top: 16px; background: #7c3aed; color: #fff; border: 0; border-radius: 14px; padding: 12px; font-weight: 800; cursor: pointer; }
  </style>
</head>
<body>
  <form class="card" method="POST" action="${escapeHtml(input.actionUrl)}">
    <h1>${escapeHtml(input.titleAr)}</h1>
    <p>${escapeHtml(input.descriptionAr)}</p>
    <input type="hidden" name="pendingId" value="${escapeHtml(input.pendingId)}" />
    ${options}
    <button type="submit">حفظ الربط</button>
  </form>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
