"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

interface DateRangeDialogProps {
  selectedFilter: string;
  onFilterChange: (filter: string, startDate?: Date, endDate?: Date) => void;
}

export function DateRangeDialog({
  selectedFilter,
  onFilterChange,
}: DateRangeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [mode, setMode] = useState<"preset" | "single" | "range">("preset");

  const presetOptions = [
    { key: "today", label: "Today" },
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "last3months", label: "Last 3 Months" },
    { key: "last6months", label: "Last 6 Months" },
    { key: "overall", label: "Overall" },
  ];

  const handlePresetSelect = (preset: string) => {
    onFilterChange(preset);
    setIsOpen(false);
  };

  const handleSingleDateSelect = () => {
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      console.log("handleSingleDateSelect calling onFilterChange with:", {
        filter: "custom",
        startOfDay,
        endOfDay,
      });
      onFilterChange("custom", startOfDay, endOfDay);
      setIsOpen(false);
    }
  };

  const handleRangeSelect = () => {
    if (selectedRange.from && selectedRange.to) {
      const startOfDay = new Date(selectedRange.from);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      console.log("handleRangeSelect calling onFilterChange with:", {
        filter: "custom",
        startOfDay,
        endOfDay,
      });
      onFilterChange("custom", startOfDay, endOfDay);
      setIsOpen(false);
    }
  };

  const getFilterLabel = () => {
    if (selectedFilter === "custom") {
      if (selectedRange.from && selectedRange.to) {
        return `${format(selectedRange.from, "MMM dd")} - ${format(
          selectedRange.to,
          "MMM dd"
        )}`;
      }
      if (selectedDate) {
        return format(selectedDate, "MMM dd, yyyy");
      }
    }
    return (
      presetOptions.find((option) => option.key === selectedFilter)?.label ||
      "This Month"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          {getFilterLabel()}
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`bg-white transition-all duration-300 ease-in-out ${
          mode === "preset"
            ? "sm:max-w-md"
            : mode === "single"
            ? "sm:max-w-sm"
            : "sm:max-w-xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>
            Choose a preset period or select custom dates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-2 transition-all duration-300 ease-in-out overflow-hidden">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === "preset" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("preset")}
              className={`${
                mode === "preset" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              Presets
            </Button>
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
              className={`${
                mode === "single" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              Single Date
            </Button>
            <Button
              variant={mode === "range" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("range")}
              className={`${
                mode === "range" ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              Date Range
            </Button>
          </div>

          {/* Preset Options */}
          {mode === "preset" && (
            <div className="grid grid-cols-3 gap-2 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in-0">
              {presetOptions.map((option) => (
                <Button
                  key={option.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(option.key)}
                  className={`justify-start transition-all duration-200 ${
                    selectedFilter === option.key
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : ""
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Single Date Selection */}
          {mode === "single" && (
            <div className="space-y-4 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in-0">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  showOutsideDays={true}
                  captionLayout="dropdown"
                  classNames={{
                    day_selected:
                      "!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white focus:!bg-blue-600 focus:!text-white",
                    day_today: "bg-blue-100 text-blue-600 font-semibold",
                    day: "hover:bg-blue-50",
                    day_button:
                      "data-[selected-single=true]:!bg-blue-600 data-[selected-single=true]:!text-white data-[range-start=true]:!bg-blue-600 data-[range-start=true]:!text-white data-[range-end=true]:!bg-blue-600 data-[range-end=true]:!text-white",
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleSingleDateSelect}
                  disabled={!selectedDate}
                  className="bg-blue-600 hover:bg-blue-700 w-auto px-6 transition-all duration-200"
                >
                  Select Date
                </Button>
              </div>
            </div>
          )}

          {/* Date Range Selection */}
          {mode === "range" && (
            <div className="space-y-4 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in-0">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={(range) => {
                  if (range) {
                    setSelectedRange({
                      from: range.from,
                      to: range.to,
                    });
                  } else {
                    setSelectedRange({ from: undefined, to: undefined });
                  }
                }}
                className="rounded-md border"
                numberOfMonths={2}
                showOutsideDays={true}
                captionLayout="dropdown"
                classNames={{
                  day_selected:
                    "!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white focus:!bg-blue-600 focus:!text-white",
                  day_today: "bg-blue-100 text-blue-600 font-semibold",
                  range_start:
                    "!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white focus:!bg-blue-600 focus:!text-white",
                  range_end:
                    "!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white focus:!bg-blue-600 focus:!text-white",
                  range_middle: "bg-blue-100 text-blue-600",
                  day: "hover:bg-blue-50",
                  day_button:
                    "data-[selected-single=true]:!bg-blue-600 data-[selected-single=true]:!text-white data-[range-start=true]:!bg-blue-600 data-[range-start=true]:!text-white data-[range-end=true]:!bg-blue-600 data-[range-end=true]:!text-white",
                }}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleRangeSelect}
                  disabled={!selectedRange.from || !selectedRange.to}
                  className="bg-blue-600 hover:bg-blue-700 w-auto px-6 transition-all duration-200"
                >
                  Select Range
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
