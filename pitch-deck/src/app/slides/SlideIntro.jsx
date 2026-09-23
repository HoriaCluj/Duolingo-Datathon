import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import frameImg from "../../assets/leaf-frame.png";
import duoSvg from "../../assets/duo-mascot.svg";

export default function SlideIntro() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const handler = (e) => {
            const forward = e.key === "ArrowRight" || e.key === " " || e.key === "PageDown";
            if (step !== 0) return;

            if (forward) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
                setStep(1);
            }
        };

        window.addEventListener("keydown", handler, { capture: true });
        return () => window.removeEventListener("keydown", handler, { capture: true });
    }, [step]);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {/* FULL-SCREEN FRAME (covers entire viewport) */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            >
                <AnimatePresence>
                    {step >= 1 && (
                        <motion.img
                            src={frameImg}
                            alt=""
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.55 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2.6, ease: "easeOut" }}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: "170vw",     // <-- increase this: 130–170vw
                                height: "160vh",    // <-- increase this: 130–170vh
                                transform: "translate(-50%, -50%)",
                                objectFit: "cover",
                                objectPosition: "center",
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* CONTENT centered over full-screen frame */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <div style={{ width: "min(980px, 92vw)", display: "grid", placeItems: "center" }}>
                    <AnimatePresence>
                        {step >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    textAlign: "center",
                                    padding: "36px 24px",
                                    width: "100%",
                                    display: "grid",
                                    placeItems: "center",
                                }}
                            >
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <h1
                                        style={{
                                            fontFamily: '"Feather Bold", ui-sans-serif, system-ui',
                                            fontSize: 64,
                                            lineHeight: 1.02,
                                            margin: 0,
                                            color: "var(--accent)",
                                            textTransform: "lowercase",
                                        }}
                                    >
                                        usage pattern inference on
                                        <br />
                                        duolingo
                                    </h1>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 2.0, ease: "easeOut", delay: 0.15 }}
                                        style={{
                                            marginTop: 18,
                                            display: "grid",
                                            placeItems: "center",
                                            gap: 10,
                                        }}
                                    >

                                    </motion.div>

                                    <motion.img
                                        src={duoSvg}
                                        alt=""
                                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 2.25, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                        style={{
                                            position: "absolute",
                                            right: -135,
                                            top: -6,
                                            width: 120,
                                            height: 120,
                                            objectFit: "contain",
                                            pointerEvents: "none",
                                            filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.28))",
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 0 && (
                        <div style={{ display: "grid", placeItems: "center" }}>
                            <span className="pill">
                                <span className="kbd">→</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}