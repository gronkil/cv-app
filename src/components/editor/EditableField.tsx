import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  isEditing: boolean
  multiline?: boolean
  className?: string
  placeholder?: string
}

export function EditableField({ value, onChange, isEditing, multiline, className = '', placeholder }: Props) {
  const [localValue, setLocalValue] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setLocalValue(value) }, [value])

  useEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [localValue, multiline])

  const handleBlur = () => onChange(localValue)

  if (!isEditing) {
    return (
      <span className={className}>
        {value || <span className="opacity-30 italic">{placeholder}</span>}
      </span>
    )
  }

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={1}
        className={`w-full resize-none bg-white/10 border border-[#C9A84C]/40 rounded-lg px-3 py-2 outline-none focus:border-[#C9A84C] transition-colors ${className}`}
      />
    )
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full bg-white/10 border border-[#C9A84C]/40 rounded-lg px-3 py-1.5 outline-none focus:border-[#C9A84C] transition-colors ${className}`}
    />
  )
}
