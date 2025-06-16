"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"

export function DrawerDemo() {
  const [note, setNote] = React.useState("")

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="w-full bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center text-gray-700">
          <FileText className="h-5 w-5 mr-3" />
          <span className="font-medium">Add a note for the restaurant</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="h-[50vh]">
        <DrawerHeader>
          <DrawerTitle>Add a note</DrawerTitle>
          <DrawerDescription>Add any special instructions or requests for the restaurant.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">
          <Textarea
            placeholder="E.g., Please make it less spicy, no onions, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[150px]"
          />
          <div className="mt-4 flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={() => setNote("")}>
              Clear
            </Button>
            <Button className="bg-[#361C1C]">Save</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
