import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function SlideDataset() {
    const [data, setData] = useState([]);
    const [hoveredCol, setHoveredCol] = useState(null);

    const descriptions = {
        p_recall: "probability that the user recalls the lexeme",
        timestamp: "timestamp of the session start in unix",
        delta: "time since the user last saw the word",
        history_seen: "total times the user saw the word prior to this session",
    };

    const shortNames = {
        learning_language: "lrn lang",
        ui_language: "ui lang"
    };

    useEffect(() => {
        // Fetch and parse the CSV
        fetch("/user_u_4_data.csv")
            .then((response) => response.text())
            .then((text) => {
                const rows = text.trim().split("\n");
                const parsed = rows.map((row) => row.split(","));
                // Only first 10 rows + 1 header
                setData(parsed.slice(0, 110));
            });
    }, []);

    if (data.length === 0) return null;

    const headers = [...data[0].slice(0, 7), data[0][8]];
    const rows = data.slice(1).map(row => [...row.slice(0, 7), row[8]]);

    return (
        <div className="deck-safe" style={{ width: "100%", maxWidth: "100%", padding: "40px 24px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20 }}>
                <div>
                    <h2 style={{ fontSize: 42, margin: 0 }}>Available dataset</h2>
                    <p style={{ marginTop: 8, fontSize: 16, color: "var(--muted)", lineHeight: 1.55, maxWidth: 980 }}>
                        A snapshot of the first 10 rows of the user interactions log.
                    </p>
                </div>
                <div className="pill">Slide 2 / 8</div>
            </div>

            <motion.div
                className="card"
                style={{
                    marginTop: 20,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    width: "100%",
                    height: "78vh",
                    overflow: "visible"
                }}
            >
                <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", flex: 1 }}>
                    <div
                        style={{
                            marginTop: 12,
                            overflowX: "visible",
                            overflowY: "visible",
                            flex: 1,
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(0,0,0,0.18)",
                            position: "relative",
                        }}
                    >
                        <table style={{ margin: "0 auto", borderCollapse: "separate", borderSpacing: 0, minWidth: "100%" }}>
                            <thead>
                                <tr>
                                    {headers.map((col, i) => (
                                        <motion.th
                                            key={col}
                                            animate={{
                                                filter: hoveredCol && hoveredCol !== col ? "blur(8px)" : "blur(0px)",
                                                opacity: hoveredCol && hoveredCol !== col ? 0.3 : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            onMouseEnter={() => descriptions[col] ? setHoveredCol(col) : null}
                                            onMouseLeave={() => setHoveredCol(null)}
                                            style={{
                                                position: "relative",
                                                textAlign: "center",
                                                fontSize: 15,
                                                letterSpacing: 0.1,
                                                color: descriptions[col] ? "#2bd6c4" : "rgba(255,255,255,0.78)",
                                                fontWeight: 700,
                                                padding: "8px 12px",
                                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                                                background: "rgba(10,12,20,0.85)",
                                                backdropFilter: "blur(6px)",
                                                cursor: descriptions[col] ? "help" : "default",
                                                textTransform: "capitalize",
                                                whiteSpace: "nowrap",
                                                zIndex: hoveredCol === col ? 10 : 1,
                                            }}
                                        >
                                            {(shortNames[col] || col).replace("_", " ")}

                                            <AnimatePresence>
                                                {hoveredCol === col && descriptions[col] && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                                        transition={{ duration: 0.2 }}
                                                        style={{
                                                            position: "absolute",
                                                            bottom: "100%",
                                                            left: "50%",
                                                            transform: "translate(-50%, -12px)",
                                                            pointerEvents: "none",
                                                            whiteSpace: "nowrap",
                                                            zIndex: 20
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 30, fontFamily: "DkCrayonCrumble", color: "#2bd6c4", letterSpacing: 1, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
                                                            {descriptions[col]}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.th>
                                    ))}
                                </tr>
                            </thead>
                            <motion.tbody
                                animate={{
                                    filter: hoveredCol ? "blur(8px)" : "blur(0px)",
                                    opacity: hoveredCol ? 0.3 : 1
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {rows.map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            opacity: 1
                                        }}
                                    >
                                        {row.map((cell, j) => (
                                            <td key={j} style={{
                                                padding: "6px 12px",
                                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                                color: "rgba(255,255,255,0.90)",
                                                fontSize: 13,
                                                whiteSpace: "nowrap",
                                                fontFamily: "monospace",
                                                textAlign: "center",
                                            }}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>

                    {/* Gradient to intensify the fade out at the bottom */}
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "140px",
                        background: "linear-gradient(transparent, #070a14)",
                        backdropFilter: "blur(4px)",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 80%)",
                        maskImage: "linear-gradient(to bottom, transparent 0%, black 80%)",
                        zIndex: 2,
                        pointerEvents: "none"
                    }} />
                </div>
            </motion.div>

        </div>
    );
}
