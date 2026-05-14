import * as React from "react"

import { cn } from "../../lib/cn"

type InputMask = "date"
type InputProps = React.ComponentProps<"input"> & {
  /** Formats text input as the user types. `date` renders DD-MM-YYYY. */
  mask?: InputMask
}

function inputValueToString(value: InputProps["value"] | InputProps["defaultValue"]) {
  if (value == null) return ""
  if (Array.isArray(value)) return value.join("")
  return String(value)
}

function formatDateInputValue(value: InputProps["value"] | InputProps["defaultValue"]) {
  const digits = inputValueToString(value).replace(/\D/g, "").slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`

  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

function countDigitsBeforeCaret(value: string, caret: number) {
  return value.slice(0, caret).replace(/\D/g, "").length
}

function getCaretPositionForDigitIndex(value: string, digitIndex: number) {
  if (digitIndex <= 0) return 0

  let digitsSeen = 0

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      digitsSeen += 1
    }

    if (digitsSeen >= digitIndex) {
      return index + 1
    }
  }

  return value.length
}

function restoreCaret(input: HTMLInputElement, position: number) {
  window.requestAnimationFrame(() => {
    if (document.activeElement === input) {
      input.setSelectionRange(position, position)
    }
  })
}

function Input({
  className,
  type,
  mask,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  inputMode,
  placeholder,
  maxLength,
  pattern,
  ...props
}: InputProps) {
  const isDateMasked = mask === "date"
  const isControlled = value != null
  const [maskedValue, setMaskedValue] = React.useState(() => formatDateInputValue(defaultValue))

  function handleMaskedDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const selectionStart = input.selectionStart ?? input.value.length
    const digitIndex = countDigitsBeforeCaret(input.value, selectionStart)
    const nextValue = formatDateInputValue(input.value)
    const nextCaret = getCaretPositionForDigitIndex(nextValue, digitIndex)

    input.value = nextValue

    if (!isControlled) {
      setMaskedValue(nextValue)
    }

    onChange?.(event)
    restoreCaret(input, nextCaret)
  }

  function handleMaskedDateKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)

    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    const input = event.currentTarget
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? start

    if (start !== end) return

    if (event.key === "Backspace" && input.value[start - 1] === "-") {
      input.setSelectionRange(start - 1, start - 1)
    }

    if (event.key === "Delete" && input.value[start] === "-") {
      input.setSelectionRange(start + 1, start + 1)
    }
  }

  const inputProps = isDateMasked
    ? {
        ...props,
        type: "text",
        inputMode: inputMode ?? "numeric",
        placeholder: placeholder ?? "DD-MM-YYYY",
        maxLength: maxLength ?? 10,
        pattern: pattern ?? "\\d{2}-\\d{2}-\\d{4}",
        value: isControlled ? formatDateInputValue(value) : maskedValue,
        onChange: handleMaskedDateChange,
        onKeyDown: handleMaskedDateKeyDown,
      }
    : {
        ...props,
        type,
        inputMode,
        placeholder,
        maxLength,
        pattern,
        value,
        defaultValue,
        onChange,
        onKeyDown,
      }

  return (
    <input
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...inputProps}
    />
  )
}

export { Input }
