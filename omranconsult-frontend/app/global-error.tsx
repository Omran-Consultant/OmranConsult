"use client";

type GlobalErrorProps = {
  readonly error: unknown;
  readonly retry: () => void;
};

/** Root fallback. Inline styles only: this file replaces the root layout, so the design system is not loaded. */
export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "#07111a",
          color: "#f4f7f8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "32rem", padding: "2rem" }}>
          <p style={{ margin: 0, letterSpacing: "0.08em", fontSize: "0.75rem" }}>500</p>
          <h1 style={{ margin: "0.75rem 0", fontSize: "2rem", fontWeight: 600, lineHeight: 1.2 }}>Something went wrong</h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.6 }}>حدث خطأ. حاول مرة أخرى.</p>
          <button
            onClick={() => retry()}
            style={{
              border: 0,
              borderRadius: "999px",
              background: "#1f8f4e",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              font: "inherit",
              cursor: "pointer",
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
