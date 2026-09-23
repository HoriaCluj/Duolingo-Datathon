import { useRef, useMemo } from "react";
import { motion } from "motion/react";

// Predefined user IDs from the instructions
const USER_IDS = [
    'u:iM9E', 'u:hFnH', 'u:ic5M', 'u:hQtL', 'u:gg4J', 'u:f3nN',
    'u:cS-T', 'u:hhJS', 'u:icHd', 'u:fVVF', 'u:hdaD', 'u:ipnP',
    'u:byH8', 'u:g-gP', 'u:hJac', 'u:ih3K', 'u:h_ku', 'u:ijoS',
    'u:iuRT', 'u:ipMZ'
];

// Helper to generate a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper to generate a random float between min and max with precision
function randomFloat(min, max, precision = 2) {
    const val = Math.random() * (max - min) + min;
    return val.toFixed(precision);
}

// Fixed dimensions for the slots
const ITEM_HEIGHT = 44;
const PADDING_TOP = 18;

function Slot({ label, items, scrollRef, syncScroll }) {
    return (
        <div className="card" style={{ width: 280, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
            </div>

            <div
                style={{
                    marginTop: 14,
                    borderRadius: 18,
                    height: 180,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.25)",
                    position: "relative",
                }}
            >
                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    onScroll={syncScroll}
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        overflowY: "auto",
                        scrollbarWidth: "none", // Hide scrollbar for Firefox
                        msOverflowStyle: "none", // Hide scrollbar for IE/Edge
                        paddingTop: 68,     // pushing first item to center (180/2 - 44/2)
                        paddingBottom: 68,
                        cursor: "ns-resize",
                    }}
                    className="no-system-scrollbar"
                >
                    {/* Add invisible css to hide webkit scrollbar */}
                    <style>{`
                        .no-system-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {items.map((val, i) => (
                        <div
                            key={i}
                            style={{
                                height: ITEM_HEIGHT,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                letterSpacing: -0.3,
                                opacity: 0.9,
                                fontFamily: label === "user_id" ? "monospace" : "inherit",
                            }}
                        >
                            {val}
                        </div>
                    ))}
                </div>

                {/* Center selector overlay */}
                <div
                    style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: 54,
                        borderRadius: 14,
                        border: "1px solid rgba(88,204,2,0.5)",
                        boxShadow: "0 0 0 2px rgba(88,204,2,0.08) inset",
                        pointerEvents: "none",
                        backgroundColor: "rgba(88,204,2,0.05)",
                    }}
                />
            </div>
        </div>
    );
}

export default function SlideSlots() {
    // Refs for synching scrolling
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    // Flag to prevent recursive scroll events
    const isSyncingLeft = useRef(false);

    // Generator for corresponding data arrays
    const { dataset } = useMemo(() => {
        const generated = USER_IDS.map(userId => ({
            userId,
            avgSessionSize: randomInt(10, 60),
            avgSessInt: randomFloat(30, 100, 2)
        }));

        // Loop the dataset a few times to give it that "slot machine" length feeling
        const multipliedDataset = [...generated, ...generated, ...generated];

        return { dataset: multipliedDataset };
    }, []);

    // Split into individual arrays for the slots
    const col1 = dataset.map(d => d.userId);
    const col2 = dataset.map(d => d.avgSessionSize);
    const col3 = dataset.map(d => d.avgSessInt);

    // Sync scroll handlers
    // We only need the first slot to drive the other two as requested,
    // but allowing any slot to scroll them all is a nicer UX.
    const handleScroll = (sourceRef) => {
        if (!ref1.current || !ref2.current || !ref3.current) return;
        if (isSyncingLeft.current) return;

        isSyncingLeft.current = true;

        const scrollAmount = sourceRef.current.scrollTop;
        if (sourceRef !== ref1) ref1.current.scrollTop = scrollAmount;
        if (sourceRef !== ref2) ref2.current.scrollTop = scrollAmount;
        if (sourceRef !== ref3) ref3.current.scrollTop = scrollAmount;

        // Give the DOM a tiny frame to update before turning flag off
        requestAnimationFrame(() => {
            isSyncingLeft.current = false;
        });
    };

    return (
        <div className="deck-safe" style={{ width: "100%", maxWidth: 1400, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24 }}>
                <div>
                    <h2 style={{ fontSize: 46 }}>Extracting User Profile</h2>
                    <p style={{ marginTop: 10, fontSize: 18, color: "var(--muted)", maxWidth: 820, lineHeight: 1.55 }}>
                        Scroll to inspect individual user statistics. The engineered variables are tied directly to their respective <b>user_id</b>.
                    </p>
                </div>
                <div className="pill">Slide 2 / 6</div>
            </div>

            <div style={{ marginTop: 42, display: "flex", gap: 24, justifyContent: "center" }}>
                <Slot
                    label="user_id"
                    items={col1}
                    scrollRef={ref1}
                    syncScroll={() => handleScroll(ref1)}
                />
                <Slot
                    label="avg_session_size"
                    items={col2}
                    scrollRef={ref2}
                    syncScroll={() => handleScroll(ref2)}
                />
                <Slot
                    label="avg_sess_int"
                    items={col3}
                    scrollRef={ref3}
                    syncScroll={() => handleScroll(ref3)}
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--muted)" }}
            >

            </motion.div>
        </div>
    );
}