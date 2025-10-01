"use client";
import { useCallback, useEffect, useState } from "react";

const useOTPExpire = (initialTime: number = 5 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // format mm:ss
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const reset = useCallback(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  return { timeLeft, minutes, seconds, isExpired: timeLeft <= 0, reset };
};

export default useOTPExpire;
