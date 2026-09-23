import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines
        .slice(1)
        .filter((l) => l.trim().length > 0)
        .map((line) => {
            const cells = line.split(",");
            const obj = {};
            headers.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
            return obj;
        });

    return { headers, rows };
}

export default function SlideTableZoom() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [headers, setHeaders] = useState([]);
    const [rows, setRows] = useState([]);
    const [particlesOn, setParticlesOn] = useState(false);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                // CSV served from /public
                const res = await fetch("/user_u_4_data.csv");
                if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);

                const text = await res.text();
                const parsed = parseCSV(text);

                if (!alive) return;
                setHeaders(parsed.headers);
                setRows(parsed.rows);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? String(e));
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    // Stepper logic
    useEffect(() => {
        const handler = (e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== " ") return;

            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

            if (e.key === "ArrowLeft") {
                setStep((s) => Math.max(0, s - 1));
                return;
            }
            if (e.key === "ArrowRight" || e.key === " ") {
                setStep((s) => Math.min(1, s + 1));
            }
        };

        window.addEventListener("keydown", handler, { capture: true });
        return () => window.removeEventListener("keydown", handler, { capture: true });
    }, []);

    // Particles trigger
    useEffect(() => {
        if (step === 1) {
            setParticlesOn(true);
            const t = setTimeout(() => setParticlesOn(false), 1200);
            return () => clearTimeout(t);
        }
    }, [step]);

    const previewRows = useMemo(() => rows.slice(0, 100), [rows]);

    const baseCols = [
        "p_recall", "timestamp", "delta", "user_id", "learning_language",
        "ui_language", "lexeme_id", "lexeme_string", "history_seen",
        "history_correct", "session_seen", "session_correct"
    ];
    const engineeredCols = [
        "datetime", "date", "diff_minutes", "sess_int", "new_session",
        "session_id", "session_size"
    ];
    // Always render both so the space is reserved on the right, but opacity controls visibility
    const allCols = [...baseCols, ...engineeredCols];

    // Particles array
    const particles = useMemo(() => {
        const count = 200;
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            sx: 100 + Math.random() * 400,
            sy: 100 + Math.random() * 500,
            ex: 4000 + Math.random() * 800,
            ey: 90 + Math.random() * 420,
        }));
    }, []);

    return (
        <div className="deck-safe" style={{ width: "100%", maxWidth: "100%", padding: "40px 24px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20 }}>
                <div>
                    <h2 style={{ fontSize: 42, margin: 0 }}>Feature construction</h2>
                    <p style={{ marginTop: 8, fontSize: 16, color: "var(--muted)", lineHeight: 1.55, maxWidth: 980 }}>
                        Extracting relevant variables to the data.
                    </p>
                </div>
                <div className="pill">Slide 3 / 6</div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="card"
                style={{
                    marginTop: 20,
                    padding: 14,
                    overflow: "hidden",
                    position: "relative",
                    height: "78vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {loading && <div style={{ color: "var(--muted)" }}>Loading CSV…</div>}

                {!loading && err && (
                    <div style={{ color: "rgba(255,255,255,0.85)" }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Couldn’t load the CSV</div>
                        <div style={{ color: "rgba(255,255,255,0.65)" }}>{err}</div>
                        <div style={{ marginTop: 12, color: "rgba(255,255,255,0.65)" }}>
                            Make sure the file exists at: <code>/public/user_u_4_data.csv</code>
                        </div>
                    </div>
                )}

                {!loading && !err && (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                            <div className="pill" style={{ opacity: 0.9 }}>
                                rows: {rows.length.toLocaleString()}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
                                showing first {previewRows.length} rows
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 12,
                                overflowX: "auto",
                                overflowY: "auto",
                                flex: 1,
                                borderRadius: 16,
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: "rgba(0,0,0,0.18)",
                                position: "relative",
                            }}
                        >
                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: "100%" }}>
                                <thead>
                                    <tr>
                                        {allCols.map((h) => {
                                            const isEngineered = engineeredCols.includes(h);
                                            return (
                                                <th
                                                    key={h}
                                                    style={{
                                                        textAlign: "left",
                                                        fontSize: 15,
                                                        letterSpacing: 0.1,
                                                        color: isEngineered ? "rgba(167,139,250,0.95)" : "rgba(255,255,255,0.78)",
                                                        fontWeight: 700,
                                                        padding: "8px 12px",
                                                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                                                        background: isEngineered ? "rgba(167,139,250,0.10)" : "rgba(10,12,20,0.85)",
                                                        backdropFilter: "blur(6px)",
                                                        zIndex: 1,
                                                        opacity: (isEngineered && step === 0) ? 0 : 1,
                                                        transition: "opacity 0.8s ease-out, background 0.8s ease",
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {previewRows.map((r, idx) => (
                                        <tr key={idx} style={{ opacity: 0.95 }}>
                                            {allCols.map((h) => {
                                                const isEngineered = engineeredCols.includes(h);
                                                return (
                                                    <td
                                                        key={h}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                                                            color: isEngineered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.90)",
                                                            fontSize: 13,
                                                            whiteSpace: "nowrap",
                                                            background: isEngineered ? "rgba(167,139,250,0.06)" : "transparent",
                                                            opacity: (isEngineered && step === 0) ? 0 : 1,
                                                            transition: "opacity 0.8s ease-out, background 0.8s ease",
                                                        }}
                                                    >
                                                        {r[h]}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Particles floating over the engineered columns */}
                            <AnimatePresence>
                                {particlesOn && (
                                    <motion.div
                                        initial={{ opacity: 1 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            pointerEvents: "none",
                                            zIndex: 5,
                                        }}
                                    >
                                        {particles.map((p) => (
                                            <motion.span
                                                key={p.id}
                                                initial={{
                                                    x: p.sx,
                                                    y: p.sy,
                                                    opacity: 0,
                                                    scale: 0.4,
                                                }}
                                                animate={{
                                                    x: p.ex,
                                                    y: p.ey,
                                                    opacity: [0, 1, 0.9, 0],
                                                    scale: [0.6, 1.2, 1, 0.4],
                                                }}
                                                transition={{
                                                    duration: 6,
                                                    ease: "easeOut",
                                                    delay: Math.random() * 0.1,
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    width: 5,
                                                    height: 5,
                                                    borderRadius: 999,
                                                    background: "rgba(3, 255, 66, 0.95)",
                                                    boxShadow: "0 0 12px rgba(28, 255, 20, 0.99)",
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </motion.div>

            <div style={{ position: "absolute", left: -16, bottom: -44, zIndex: 3, display: "flex", gap: 10, alignItems: "center" }}>
                <span className="pill">
                    <span className="kbd">→</span> advance • <span className="kbd">←</span> back
                </span>
                <span className="pill" style={{ opacity: 0.85 }}>
                    step {step} / 1
                </span>
            </div>
        </div>
    );
}