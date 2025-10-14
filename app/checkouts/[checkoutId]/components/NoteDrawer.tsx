"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { DocumentAdd } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface NoteDrawerProps {
  checkoutId: string;
  initialNote?: string;
  onNoteChange?: (note: string) => void;
}

export default function NoteDrawer({
  checkoutId,
  initialNote = "",
  onNoteChange,
}: NoteDrawerProps) {
  const [note, setNote] = useState(initialNote);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);

  const handleSaveNote = async () => {
    try {
      console.log("🔄 Saving note to checkout session:", {
        checkoutId,
        notes: note,
      });

      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: note,
        }),
      });

      if (updateResponse.ok) {
        const responseData = await updateResponse.json();
        console.log("✅ Note saved to checkout session:", responseData);
        onNoteChange?.(note);
      } else {
        console.error("❌ Failed to save note:", await updateResponse.text());
      }
    } catch (error) {
      console.error("❌ Error saving note:", error);
    }
  };

  const handleClearNote = async () => {
    setNote("");
    try {
      const updateResponse = await fetch(`/api/checkout/${checkoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: "",
        }),
      });

      if (updateResponse.ok) {
        console.log("✅ Note cleared from checkout session");
        onNoteChange?.("");
      }
    } catch (error) {
      console.error("❌ Error clearing note:", error);
    }
  };

  return (
    <Drawer
      modal={true}
      open={isNoteDrawerOpen}
      onOpenChange={setIsNoteDrawerOpen}
    >
      <DrawerTrigger asChild>
        <div className="w-full flex items-center justify-between text-left cursor-pointer rounded-lg">
          <div className="flex items-center">
            <DocumentAdd className="h-5 w-5 mr-3 text-black" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {note ? "Note added" : "Add a note"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {note && (
              <button
                className="text-[#2664eb] hover:text-[#1d4ed8] transition-colors p-1 rounded-full hover:bg-blue-50 text-sm font-medium"
                onClick={() => {
                  setIsNoteDrawerOpen(true);
                }}
              >
                Edit
              </button>
            )}
            <IoIosArrowForward className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent className="h-[600px] md:h-[550px] rounded-t-2xl bg-[#F5F6FB] overflow-y-auto scrollbar-hide">
        <DrawerHeader className="text-left lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
          <div className="flex items-center justify-between w-full">
            <DrawerTitle className="text-[20px]">
              Add a Note to your order
            </DrawerTitle>
            <DrawerClose asChild>
              <button
                aria-label="Close"
                className="h-[36px] w-[36px] rounded-full bg-white hover:bg-gray-50 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
          <Textarea
            placeholder="E.g., Special cake message, delivery instructions, dietary preferences, etc."
            value={note}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setNote(e.target.value);
              }
            }}
            maxLength={100}
            className="min-h-[150px] rounded-[18px] placeholder:text-[#C0C0C0] placeholder:font-normal"
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-500">
              {note.length}/100 characters
            </span>
          </div>
        </div>

        {/* Desktop action row under textarea */}
        <div className="hidden lg:flex justify-end gap-2 px-4 pt-3 lg:max-w-[720px] lg:min-w-[560px] mx-auto w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearNote}
            className="h-9 px-5 rounded-[12px]"
          >
            Clear
          </Button>
          <DrawerClose asChild>
            <Button
              size="sm"
              className="h-9 px-5 rounded-[12px]"
              onClick={handleSaveNote}
            >
              Save
            </Button>
          </DrawerClose>
        </div>

        {/* Mobile footer */}
        <DrawerFooter className="pt-2 pb-6 lg:hidden">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClearNote}
              className="flex-1 rounded-[20px] text-[16px]"
            >
              Clear
            </Button>
            <DrawerClose asChild>
              <Button
                size="lg"
                className="flex-1 py-5 rounded-[20px] text-[16px]"
                onClick={handleSaveNote}
              >
                Save
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
