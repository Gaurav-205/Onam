import React from "react";

const FestivalMemories = () => {
  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#fff7e0", padding: "40px 20px" }}>
      {/* Heading */}
      <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "3rem", marginBottom: "10px", color: "#7a4b00" }}>
        Festival Memories
      </h1>

      {/* Subheading */}
      <p style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px auto", fontSize: "1.1rem", color: "#8a6b3c" }}>
        Glimpses of our previous Onam celebrations filled with joy, tradition, and unforgettable moments that bring our college community together.
      </p>

      {/* Image Gallery → Icon Tiles */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ width: "250px", height: "250px", borderRadius: "15px", background: "#fffbe6", border: "1px solid #ffe08a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", lineHeight: 1 }}>🌸</div>
            <div style={{ marginTop: "10px", fontWeight: 600, color: "#7a4b00" }}>Pookalam</div>
          </div>
        </div>
        <div style={{ width: "250px", height: "250px", borderRadius: "15px", background: "#fffbe6", border: "1px solid #ffe08a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", lineHeight: 1 }}>🍽️</div>
            <div style={{ marginTop: "10px", fontWeight: 600, color: "#7a4b00" }}>Onasadya</div>
          </div>
        </div>
        <div style={{ width: "250px", height: "250px", borderRadius: "15px", background: "#fffbe6", border: "1px solid #ffe08a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", lineHeight: 1 }}>🪘</div>
            <div style={{ marginTop: "10px", fontWeight: 600, color: "#7a4b00" }}>Music & Drums</div>
          </div>
        </div>
        <div style={{ width: "250px", height: "250px", borderRadius: "15px", background: "#fffbe6", border: "1px solid #ffe08a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", lineHeight: 1 }}>💃</div>
            <div style={{ marginTop: "10px", fontWeight: 600, color: "#7a4b00" }}>Traditional Dance</div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div
        style={{
          marginTop: "50px",
          background: "linear-gradient(90deg, #ffd24d, #ffb347)",
          borderRadius: "0",
          color: "#5a3d00",
          textAlign: "center",
          padding: "40px 20px",
          // full-bleed horizontally within parent padding (20px)
          marginLeft: "-20px",
          marginRight: "-20px",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontWeight: "bold", fontSize: "1.8rem", color: "#5a3d00" }}>
          Share Your Onam Moments
        </h2>
        <p style={{ fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto 30px auto", lineHeight: "1.6", color: "#5a3d00" }}>
          "Every petal in the pookalam tells a story, every smile captured becomes a memory. Join us in creating beautiful moments that will be cherished forever."
        </p>

        {/* Hashtags */}
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
          {["#OnamCelebration2025", "#KeralaFestival", "#CollegeTraditions"].map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "rgba(255 255 255 / 0.35)",
                borderRadius: "20px",
                padding: "8px 15px",
                fontWeight: "600",
                cursor: "pointer",
                userSelect: "none",
                color: "#5a3d00",
                border: "1px solid rgba(255,255,255,0.5)"
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FestivalMemories;
