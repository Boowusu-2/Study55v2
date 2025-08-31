import React from "react";

// Pre-calculate positions outside component to avoid re-renders
const STAR_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 5) % 100}%`,
  top: `${(i * 7) % 100}%`,
  animationDelay: `${(i * 0.2) % 4}s`,
  animationDuration: `${3 + (i % 3)}s`,
  width: `${2 + (i % 3)}px`,
  height: `${2 + (i % 3)}px`,
}));

const PARTICLE_POSITIONS = Array.from({ length: 25 }, (_, i) => ({
  left: `${(i * 4) % 100}%`,
  top: `${(i * 6) % 100}%`,
  animationDelay: `${(i * 0.15) % 3}s`,
  animationDuration: `${2 + (i % 2)}s`,
}));

const FloatingStars: React.FC = () => {
  return (
    <>
      {/* Floating Stars (White Dots) */}
      <div className="absolute inset-0">
        {STAR_POSITIONS.map((style, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-twinkle"
            style={style}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {PARTICLE_POSITIONS.map((style, i) => (
          <div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle animate-float ${
              i % 4 === 0
                ? "animate-float-delay-1"
                : i % 4 === 1
                ? "animate-float-delay-2"
                : i % 4 === 2
                ? "animate-float-delay-3"
                : ""
            }`}
            style={style}
          />
        ))}
      </div>
    </>
  );
};

export default FloatingStars;
