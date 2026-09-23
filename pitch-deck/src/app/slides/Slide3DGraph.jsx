import { useEffect, useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";

// Basic CSV Parser
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const cells = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = cells[i] ? cells[i].trim() : "";
        });
        return obj;
    });
}

// 3D Scene scaling constants to fit the data on screen nicely
const SCALES = {
    x: 6.5,   // history_seen (log scaled, ranges 0 to ~7)
    y: 18,    // p_recall (ranges 0.0 to 1.0)
    z: 12     // session_id (ranges 1 to ~4)
};

// Colors for the points based heavily on Duolingo palette
const POINT_COLORS = [
    "#58cc02", // green
    // "#2bd6c4", // teal
    // "#a78bfa", // purple
    "#ff4b4b", // red
    "#ffc800"  // yellow
];

function Axes() {
    return (
        <group>
            {/* X-axis: history_seen (log) */}
            <Line points={[[-2, 0, 0], [45, 0, 0]]} color="rgba(255,255,255,0.4)" lineWidth={1.5} />
            <Billboard position={[47, 0, 0]}>
                <Text fontSize={1.0} color="rgba(255,255,255,0.8)" anchorX="left" anchorY="middle">
                    X: history_seen (log)
                </Text>
            </Billboard>

            {/* Y-axis: p_recall */}
            <Line points={[[0, -1, 0], [0, 20, 0]]} color="rgba(255,255,255,0.4)" lineWidth={1.5} />
            <Billboard position={[0, 21, 0]}>
                <Text fontSize={1.0} color="rgba(255,255,255,0.8)" anchorX="center" anchorY="bottom">
                    Y: p_recall
                </Text>
            </Billboard>

            {/* Z-axis: session_id (Negative Z / into the screen) */}
            <Line points={[[0, 0, 10], [0, 0, -40]]} color="rgba(255,255,255,0.4)" lineWidth={1.5} />
            <Billboard position={[0, 0, -45]}>
                <Text fontSize={0.9} color="rgba(255,255,255,0.8)" anchorX="center" anchorY="middle">
                    Z: timestamp
                </Text>
            </Billboard>
        </group>
    );
}

function ScatterPlot({ data }) {
    // Determine bounds for shifting the plot to center
    const points = useMemo(() => {
        let maxZ = 0;
        let minZ = 0;
        let maxX = 0;
        let maxY = 0;

        const mapped = data.map((d, i) => {
            const history_seen = parseFloat(d.history_seen) || 0;
            const p_recall = parseFloat(d.p_recall) || 0;
            const session_id = parseFloat(d.session_id) || 0;

            // X is mapped logarithmically to group points closer
            const x = Math.log1p(history_seen) * SCALES.x;
            const y = p_recall * SCALES.y;
            // Z is negative to push the timeline "behind" the monitor screen
            const z = -session_id * SCALES.z;

            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;

            return {
                position: [x, y, z],
                color: POINT_COLORS[i % POINT_COLORS.length]
            };
        });

        return { items: mapped, maxX, maxY, minZ };
    }, [data]);

    // Shift model so the center of its computed bounds is exactly at the Canvas origin [0,0,0]
    const groupOffset = [
        -(points.maxX / 2),
        -(points.maxY / 2),
        -(points.minZ / 2)
    ];

    return (
        <group position={groupOffset}>
            <Axes />
            {points.items.map((pt, i) => (
                <mesh key={i} position={pt.position}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial
                        color={pt.color}
                        emissive={pt.color}
                        emissiveIntensity={0.8}
                        roughness={0.2}
                    />
                </mesh>
            ))}
        </group>
    );
}

export default function Slide3DGraph() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hintVisible, setHintVisible] = useState(true);
    const controlsRef = useRef(null);

    const resetCamera = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const res = await fetch("/user_u_4_data.csv");
                if (!res.ok) throw new Error("Failed to load CSV");
                const text = await res.text();
                const parsed = parseCSV(text);

                // Keep only rows with valid data for these axes
                const validData = parsed.filter(d =>
                    d.history_seen !== undefined &&
                    d.p_recall !== undefined &&
                    d.session_id !== undefined
                );

                setData(validData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCSV();
    }, []);

    // Dismiss hint when user interacts
    const handleInteract = () => {
        if (hintVisible) setHintVisible(false);
    };

    return (
        <div className="deck-safe" style={{ width: "100%", maxWidth: "100%", margin: "0 auto", height: "100vh", padding: "30px 40px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, zIndex: 10 }}>
                <div>
                    <h2 style={{ fontSize: 46 }}>Multidimensional Memory</h2>
                    <p style={{ marginTop: 10, fontSize: 18, color: "var(--muted)", maxWidth: 820, lineHeight: 1.55 }}>
                        Visualizing user learning trajectories. Initially looks like a standard Cartesian plot:
                        <b> Recall Rate (Y) </b> vs <b> Repetitions (X)</b>. Grab and spin the camera to reveal time depth via <b> Session ID (Z)</b>.
                    </p>
                </div>
                <div className="pill">Slide 3 / 6</div>
            </div>

            <div
                className="card"
                style={{
                    flex: 1,
                    marginTop: 20,
                    marginBottom: 20,
                    borderRadius: 22,
                    overflow: "hidden",
                    position: "relative",
                    background: "radial-gradient(circle at center, rgba(30,40,70,0.5) 0%, rgba(10,12,20,0.9) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
                onPointerDown={handleInteract}
                onWheel={handleInteract}
            >
                {loading && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "var(--muted)", zIndex: 5 }}>
                        Loading Dataset for 3D Projection...
                    </div>
                )}
                {error && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#ff4b4b", zIndex: 5 }}>
                        Error: {error}
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <>
                        {/* Reset Camera Button */}
                        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                            <button
                                onClick={resetCamera}
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "white",
                                    padding: "8px 16px",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    backdropFilter: "blur(8px)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            >
                                Reset View
                            </button>
                        </div>

                        <Canvas
                            orthographic
                            camera={{
                                position: [0, 0, 1000], // Render perfectly flat straight down Z axis
                                zoom: 16,
                                far: 5000 // Deep render bounds to see the whole Z-axis
                            }}
                        >
                            <ambientLight intensity={0.4} />
                            <directionalLight position={[10, 20, 30]} intensity={1.5} />
                            <pointLight position={[-10, -10, -10]} intensity={1.0} color="#60a5fa" />

                            <ScatterPlot data={data} />

                            <OrbitControls
                                ref={controlsRef}
                                enablePan={true}
                                enableZoom={true}
                                enableRotate={true}
                                minZoom={2}
                                maxZoom={80}
                            />
                        </Canvas>

                        <AnimatePresence>
                            {hintVisible && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: 1.5, duration: 0.8 }}
                                    style={{
                                        position: "absolute",
                                        bottom: 30,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        pointerEvents: "none",
                                        zIndex: 10
                                    }}
                                >

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}