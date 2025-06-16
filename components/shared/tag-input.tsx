"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  placeholder: string
  onTagsChange: (tags: string[]) => void
  initialTags?: string[]
}

export function TagInput({ placeholder, onTagsChange, initialTags = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      if (!tags.includes(inputValue.trim())) {
        const newTags = [...tags, inputValue.trim()]
        setTags(newTags)
        onTagsChange(newTags)
      }
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    onTagsChange(newTags)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
            {tag}
            <button type="button" className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => removeTag(tag)}>
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:ring-offset-0"
      />
    </div>
  )
}
