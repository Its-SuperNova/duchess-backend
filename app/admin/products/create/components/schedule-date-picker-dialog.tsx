"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ScheduleDatePickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectDateTime: (date: string, time: string) => void
  initialDate?: string | null
  initialTime?: string | null
}

export function ScheduleDatePickerDialog({
  isOpen,
  onClose,
  onSelectDateTime,
  initialDate,
  initialTime,
}: ScheduleDatePickerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || format(addDays(startOfToday(), 1), "yyyy-MM-dd"),
  )
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || "10:00 AM - 12:00 PM")

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate || format(addDays(startOfToday(), 1), "yyyy-MM-dd"))
      setSelectedTime(initialTime || "10:00 AM - 12:00 PM")
    }
  }, [isOpen, initialDate, initialTime])

  const handleConfirm = () => {
    onSelectDateTime(selectedDate, selectedTime)
    onClose()
  }

  const timeSlots = [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle>Schedule Delivery</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Select Date (Next 5 Days)</Label>
            <RadioGroup value={selectedDate} onValueChange={setSelectedDate} className="grid grid-cols-3 gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const date = addDays(startOfToday(), i + 1)
                const dateValue = format(date, "yyyy-MM-dd")
                return (
                  <div key={dateValue}>
                    <RadioGroupItem value={dateValue} id={`date-${dateValue}`} className="sr-only" />
                    <Label
                      htmlFor={`date-${dateValue}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-blue-600 [&:has([data-state=checked])]:bg-blue-50 [&:has([data-state=checked])]:text-blue-900"
                    >
                      <span className="text-xs text-gray-500">{format(date, "EEE")}</span>
                      <span className="font-medium text-lg">{format(date, "d")}</span>
                      <span className="text-xs text-gray-500">{format(date, "MMM")}</span>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="time" className="text-sm font-medium text-gray-700">
              Select Time
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
