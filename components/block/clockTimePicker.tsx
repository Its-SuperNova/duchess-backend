"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  onTimeSelect?: (time: string) => void;
}

export function TimePicker({ onTimeSelect }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [mode, setMode] = useState<"hour" | "minute">("hour");

  const formatTime = useCallback(() => {
    const hour =
      selectedHour === 0
        ? 12
        : selectedHour > 12
        ? selectedHour - 12
        : selectedHour;
    const minute = selectedMinute.toString().padStart(2, "0");
    const period = isAM ? "AM" : "PM";
    return `${hour}:${minute} ${period}`;
  }, [selectedHour, selectedMinute, isAM]);

  const handleNumberClick = useCallback(
    (number: number) => {
      if (mode === "hour") {
        setSelectedHour(number);
        // Auto-switch to minute mode after selecting hour
        setTimeout(() => setMode("minute"), 200);
      } else {
        const minute = number === 12 ? 0 : number * 5;
        setSelectedMinute(minute);
      }
    },
    [mode]
  );

  const handleDone = () => {
    const timeString = formatTime();
    onTimeSelect?.(timeString);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full mx-auto">
      {/* Digital Time Display */}
      <div className="text-center mb-8">
        <div className="text-4xl font-light text-gray-900 mb-2">
          {formatTime()}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setMode("hour")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              mode === "hour"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Hour
          </button>
          <button
            onClick={() => setMode("minute")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              mode === "minute"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Minute
          </button>
        </div>
      </div>

      {/* Clock Dial */}
      <div className="relative mb-8">
        <div className="relative w-64 h-64 mx-auto bg-gray-50 rounded-full shadow-inner">
          {Array.from({ length: 12 }, (_, i) => {
            const number = i + 1;
            const angle = (number === 12 ? 0 : number) * 30 - 90;
            const x = Math.cos((angle * Math.PI) / 180) * 100;
            const y = Math.sin((angle * Math.PI) / 180) * 100;

            const isSelected =
              mode === "hour"
                ? selectedHour === number
                : selectedMinute === (number === 12 ? 0 : number * 5);

            const displayValue =
              mode === "hour"
                ? number
                : number === 12
                ? "00"
                : (number * 5).toString().padStart(2, "0");

            return (
              <button
                key={number}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "absolute w-10 h-10 flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer hover:bg-gray-200 hover:scale-110 z-30",
                  isSelected
                    ? "bg-gray-800 text-white shadow-md scale-110"
                    : "text-gray-700 hover:text-gray-900"
                )}
                style={{
                  left: `calc(50% + ${x}px - 20px)`,
                  top: `calc(50% + ${y}px - 20px)`,
                }}
              >
                {displayValue}
              </button>
            );
          })}
        </div>
      </div>

      {/* AM/PM Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button
            onClick={() => setIsAM(true)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isAM
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            AM
          </button>
          <button
            onClick={() => setIsAM(false)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              !isAM
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            PM
          </button>
        </div>
      </div>

      {/* Done Button */}
      <div className="text-center">
        <button
          onClick={handleDone}
          className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-full font-medium transition-colors duration-200"
        >
          Done
        </button>
      </div>
    </div>
  );
}
