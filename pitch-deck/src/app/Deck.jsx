import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import SlideIntro from "./slides/SlideIntro";
import SlideDataset from "./slides/SlideDataset";
import Slide3DGraph from "./slides/Slide3DGraph";
import SlideTableZoom from "./slides/SlideTableZoom";
import SlideGraphMorph from "./slides/SlideGraphMorph";
import SlideInsights from "./slides/SlideInsights";
import SlideConclusion from "./slides/SlideConclusion";
import SlideSlots from "./slides/SlideSlots";

function AnimatedBackdrop() {
    return (
        <motion.div
            aria-hidden
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background:
                    "radial-gradient(900px 700px at 25% 25%, rgba(88,204,2,0.25), transparent 60%)," +
                    "radial-gradient(900px 700px at 75% 35%, rgba(43,214,196,0.22), transparent 60%)," +
                    "radial-gradient(1000px 800px at 55% 85%, rgba(167,139,250,0.22), transparent 62%)," +
                    "linear-gradient(180deg, #0b1020, #070a14)",
                backgroundSize: "140% 140%",
                backgroundPosition: "0% 0%",
            }}
            animate={{
                backgroundPosition: ["100% 100%", "50% 50%", "100% 100%"],
            }}
            transition={{
                duration: 10,
                ease: "easeInOut",
                repeat: Infinity,
            }}
        />
    );
}

export default function Deck() {
    const slides = useMemo(
        () => [
            <SlideIntro key="s1" />,
            <SlideDataset key="dataset" />,
            <Slide3DGraph key="s3" />,
            <SlideTableZoom key="zoomTable" />,
            <SlideGraphMorph key="s4" />,
            <SlideInsights key="s5" />,
            <SlideConclusion key="s6" />,
            <SlideSlots key="s2" />,
        ],
        []
    );

    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
                setSlideIndex((i) => Math.min(i + 1, slides.length - 1));
            }
            if (e.key === "ArrowLeft" || e.key === "PageUp") {
                setSlideIndex((i) => Math.max(i - 1, 0));
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [slides.length]);

    return (
        <div style={{ height: "100vh", width: "100vw", overflow: "hidden", position: "relative" }}>
            <AnimatedBackdrop />

            <div
                style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    zIndex: 2,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <span className="pill">
                    <span className="kbd">←</span> <span className="kbd">→</span>
                </span>
                <span className="pill">
                    {slideIndex + 1} / {slides.length}
                </span>
            </div>

            <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slideIndex}
                        initial={{ opacity: 0, x: 42, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, x: -42, filter: "blur(10px)" }}
                        transition={{ duration: 0.38, ease: "easeOut" }}
                        style={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            color: "white",
                        }}
                    >
                        {slides[slideIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div style={{ position: "absolute", bottom: 24, right: 24, display: "flex", gap: 8, zIndex: 10 }}>
                <button
                    onClick={() => setSlideIndex((i) => Math.max(i - 1, 0))}
                    style={{
                        padding: "8px 16px",
                        background: "rgba(10, 12, 20, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                        backdropFilter: "blur(4px)"
                    }}
                    aria-label="Previous slide"
                >
                    {"<"}
                </button>
                <button
                    onClick={() => setSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
                    style={{
                        padding: "8px 16px",
                        background: "rgba(10, 12, 20, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                        backdropFilter: "blur(4px)"
                    }}
                    aria-label="Next slide"
                >
                    {">"}
                </button>
            </div>
        </div>
    );
}