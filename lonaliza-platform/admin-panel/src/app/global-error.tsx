"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
          <h2>حدث خطأ غير متوقع في النظام</h2>
          <p style={{ color: "#666", margin: "16px 0" }}>{error?.message || "يرجى المحاولة مجدداً لاحقاً"}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
