import React from "react";

const events = [
  {
    id: 1,
    type: "Game",
    name: "Game 1",
    date: "Sep 10, 2025",
    time: "10:00 AM - 11:30 AM",
    venue: "Main Courtyard",
  },
  {
    id: 2,
    type: "Game",
    name: "Game 2",
    date: "Sep 10, 2025",
    time: "12:00 PM - 1:30 PM",
    venue: "Sports Ground",
  },
  {
    id: 3,
    type: "Game",
    name: "Game 3",
    date: "Sep 10, 2025",
    time: "3:00 PM - 4:30 PM",
    venue: "Indoor Arena",
  },
];

const FestivalEvents = () => {
  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#fff7e0", minHeight: "100vh", padding: "40px 20px" }}>
      <style>{`
        .fe-container { max-width: 1200px; margin: 0 auto; }
        .fe-title { text-align: center; font-weight: 800; font-size: 3.2rem; color: #3a2a00; letter-spacing: .5px; margin-bottom: 10px; }
        .fe-sub { text-align: center; color: #6d5526; font-size: 1.2rem; max-width: 900px; margin: 0 auto 30px; }
        .fe-grid { display: grid; grid-template-columns: repeat(1,minmax(0,1fr)); gap: 22px; }
        @media (min-width: 780px) { .fe-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        .fe-card { position: relative; background: #fffef7; border: 1px solid #ffeb9e; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden; transition: transform .25s ease, box-shadow .25s ease; }
        .fe-card:before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg,#ffd24d,#ffb347,#ffd24d); }
        .fe-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 18px 38px rgba(255, 180, 70, 0.35); }
        .fe-card-inner { padding: 22px; }
        .fe-badges { display: flex; align-items: center; gap: 12px; color: #6d5526; }
        .fe-badge { background: #fff3bf; border: 1px solid #ffe08a; color: #5a3d00; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: .85rem; }
        .fe-row { display: flex; align-items: center; gap: 10px; color: #6d5526; font-size: .95rem; margin-top: 8px; }
        .fe-name { font-size: 1.6rem; margin: 16px 0 10px; color: #3a2a00; font-weight: 800; }
        .fe-icon { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 14px; background: #fffbe6; border: 1px solid #ffe08a; box-shadow: inset 0 0 0 3px rgba(255,210,77,.25); font-size: 30px; color: #5a3d00; }
        .fe-meta { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 16px; }
        .fe-label { color: #7a4b00; font-weight: 700; font-size: .9rem; margin-right: 6px; }
      `}</style>

      <div className="fe-container">
        <h1 className="fe-title">Festival Events</h1>
        <p className="fe-sub">Two days packed with traditional competitions, cultural performances, and authentic Kerala experiences for everyone to enjoy.</p>

        <div className="fe-grid">
          {events.map((evt) => (
            <div key={evt.id} className="fe-card">
              <div className="fe-card-inner">
                <div className="fe-badges">
                  <span className="fe-badge">{evt.type}</span>
                </div>

                <div className="fe-name">{evt.name}</div>

                <div className="fe-row">
                  <div className="fe-icon" aria-hidden>📷</div>
                  <div style={{ color: "#6d5526" }}>Image coming soon</div>
                </div>

                <div className="fe-meta">
                  <div className="fe-row"><span className="fe-label">Date:</span><span>{evt.date}</span></div>
                  <div className="fe-row"><span className="fe-label">Time:</span><span>{evt.time}</span></div>
                  <div className="fe-row"><span className="fe-label">Venue:</span><span>{evt.venue}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FestivalEvents; 