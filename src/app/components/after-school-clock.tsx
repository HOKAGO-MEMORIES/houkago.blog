"use client";

import { useEffect, useState } from "react";

export default function AfterSchoolClock() {
  const [time, setTime] = useState("--:--");
  const [position, setPosition] = useState(50);

  useEffect(() => {
    function update() {
      const parts = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
      const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
      setTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      setPosition(Math.min(96, Math.max(4, ((hour * 60 + minute) / 1440) * 100)));
    }

    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="home-time-line">
      <div className="home-time-meta"><span>지금</span><time>{time}</time></div>
      <div className="home-time-track" aria-hidden="true">
        <span className="home-time-marker" style={{ left: `${position}%` }} />
      </div>
      <div className="home-time-scale" aria-hidden="true">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
    </div>
  );
}
