import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import { trackList } from "./tracks";
import "./index.css";

export default function App() {
  const [started, setStarted] = useState(false);
  const [beatLight, setBeatLight] = useState(false);
  const [loops, setLoops] = useState({});
  const [playing, setPlaying] = useState({});

  useEffect(() => {
    const newLoops = {};
    const newStates = {};

    trackList.forEach(({ label, src }) => {
      const player = new Tone.Player(src).toDestination();
      player.sync();
      const loop = new Tone.Loop((time) => player.start(time), "1m");
      loop.mute = true;
      loop.start(0);
      newLoops[label] = loop;
      newStates[label] = false;
    });

    setLoops(newLoops);
    setPlaying(newStates);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeatLight((prev) => !prev);
    }, (60 / Tone.Transport.bpm.value) * 1000);
    return () => clearInterval(interval);
  }, []);

  const startTransport = async () => {
    if (!started) {
      await Tone.start();
      Tone.Transport.start();
      setStarted(true);
    }
  };

  const toggle = (label) => {
    startTransport();
    const loop = loops[label];
    if (loop) {
      const isOn = playing[label];
      loop.mute = isOn;
      setPlaying((prev) => ({ ...prev, [label]: !isOn }));
    }
  };

  const stopAll = () => {
    Object.entries(loops).forEach(([label, loop]) => {
      loop.mute = true;
    });
    const allOff = Object.fromEntries(Object.keys(playing).map(label => [label, false]));
    setPlaying(allOff);
  };

  return (
    <>
      <div style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        overflow: "hidden",
        color: "white"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
          <video autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
            <source src="/gfx/bg.mp4" type="video/mp4" />
            <img src="/gfx/bg.png" alt="scene" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </video>
          {trackList.map(({ label, img, video }) =>
  playing[label] ? (
    video ? (
      <video
        key={label}
        src={video}
        autoPlay
        loop
        muted
        playsInline
        style={overlayStyle}
      />
    ) : (
      <img key={label} src={img} alt={label} style={overlayStyle} />
    )
  ) : null
)}

        </div>

        <div style={{ position: "absolute", zIndex: 100, bottom: "2rem", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div className="text-3xl font-bold mb-6 bg-black bg-opacity-60 p-4 rounded-xl">Web Beat Looper</div>
          <div className="flex flex-col items-center space-y-4">
            {trackList.map(({ name, label }) => (
              <button
                key={label}
                onClick={() => toggle(label)}
                className={`loop-button ${playing[label] ? "active" : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <button onClick={stopAll} className="loop-button">Stop All</button>
          </div>
          <div className="mt-10">
            <div className={`w-6 h-6 rounded-full transition mx-auto ${beatLight ? "bg-red-500" : "bg-red-900"}`}></div>
          </div>
        </div>
      </div>
    </>
  );
}

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "contain",
  zIndex: 10,
  pointerEvents: "none"
};