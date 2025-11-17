import React, { useRef, useState } from "react";
import "./RouletteWheel.css";
// import wheelImg from "../assets/wheel.webp";
import wheelImg from "../assets/wheel_400x400.webp";
// import wheelImg from '/src/assets/wheel.webp?w=400&format=webp';

interface RouletteWheelProps {
  onSpinEnd?: (winningNumber: number) => void;
  onSpinStart?: () => void; // callback to lock bets
}

const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11,
  30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
  29, 7, 28, 12, 35, 3, 26
];

const ANGLE_PER_SEGMENT = 360 / 37;
const BASE_OFFSET_ANGLE = ANGLE_PER_SEGMENT / 2;
const FULL_ROTATIONS = 10;

const RouletteWheel: React.FC<RouletteWheelProps> = ({ onSpinEnd, onSpinStart }) => {
  const wheelRef = useRef<HTMLImageElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    if (onSpinStart) onSpinStart(); // lock bets in parent

    // Pick a random winning number
    const winningIndex = Math.floor(Math.random() * 37);

    const currentRotation = totalRotation % 360;
    const targetAngle = -winningIndex * ANGLE_PER_SEGMENT + BASE_OFFSET_ANGLE;

    const rotationDiff = FULL_ROTATIONS * 360 + (targetAngle - currentRotation);
    const newTotalRotation = totalRotation + rotationDiff;

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.33, 1, 0.68, 1)";
      wheelRef.current.style.transform = `rotate(${newTotalRotation}deg)`;
    }

    setTimeout(() => {
      setSpinning(false);
      setTotalRotation(newTotalRotation);
      if (onSpinEnd) onSpinEnd(wheelNumbers[winningIndex]);
    }, 4000);
  };

  return (
    <div className="roulette-wheel-container">
      <div className="wheel-indicator">▼</div>
      <img
        ref={wheelRef}
        className="roulette-wheel-image"
        src={wheelImg}
        alt="Roulette Wheel"
        fetchPriority="high"
        loading="eager"
        style={{ transform: `rotate(${BASE_OFFSET_ANGLE}deg)` }}
      />
      <button className="spin-button" onClick={spinWheel} disabled={spinning}>
        Spin (Good Luck!)
      </button>
    </div>
  );
};

export default RouletteWheel;
