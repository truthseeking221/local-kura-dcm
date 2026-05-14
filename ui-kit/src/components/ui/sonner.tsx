import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { Icon } from "../atoms/icon.tsx"
import { cn } from "../../lib/cn.ts"

const toastBaseClassName = [
  "!relative !flex !w-[380px] !min-w-[280px] !max-w-[380px] !items-center !gap-2.5 !overflow-hidden",
  "!rounded-[var(--radius-lg)] !border !border-[var(--border)] !bg-[var(--surface)] !py-2.5 !pr-3 !pl-3.5",
  "!font-sans !text-k-sm !font-semibold !leading-[1.4] !text-[var(--ink-800)]",
  "!shadow-[var(--shadow-md)] !transition-[transform,opacity,height,box-shadow]",
  "[&>*]:!opacity-100 data-[mounted=true]:!h-[var(--initial-height)] data-[mounted=true]:!translate-y-[calc(var(--lift)*var(--offset))] data-[mounted=true]:!scale-100",
  "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[3px] before:content-['']",
  "data-[mounted=true]:animate-in data-[mounted=true]:fade-in data-[mounted=true]:zoom-in-95 data-[mounted=true]:slide-in-from-right-7",
  "data-[mounted=true]:duration-[320ms] data-[mounted=true]:ease-[cubic-bezier(.22,1.2,.36,1)]",
  "data-[removed=true]:animate-out data-[removed=true]:fade-out data-[removed=true]:zoom-out-95 data-[removed=true]:slide-out-to-right-6",
  "data-[removed=true]:duration-[220ms] data-[removed=true]:ease-[cubic-bezier(.4,0,.55,1)]",
  "max-[767px]:!w-full max-[767px]:!min-w-0 max-[767px]:!max-w-none max-[767px]:!rounded-[var(--radius-lg)]",
  "max-[767px]:data-[mounted=true]:slide-in-from-top-2.5 max-[767px]:data-[removed=true]:slide-out-to-top-2",
].join(" ")

const toastSuccessClassName =
  "before:!bg-[var(--success-500)] [&_[data-icon]]:!bg-[var(--success-50)] [&_[data-icon]]:!text-[var(--success-600)]"

const toastErrorClassName =
  "before:!bg-[var(--danger-500)] [&_[data-icon]]:!bg-[var(--danger-50)] [&_[data-icon]]:!text-[var(--danger-600)]"

const toastInfoClassName =
  "before:!bg-[var(--info-500)] [&_[data-icon]]:!bg-[var(--info-50)] [&_[data-icon]]:!text-[var(--info-500)]"

const toastWarningClassName =
  "before:!bg-[var(--warn-500)] [&_[data-icon]]:!bg-[var(--warn-50)] [&_[data-icon]]:!text-[var(--warn-600)]"

const Toaster = ({
  className,
  icons,
  toastOptions,
  style,
  position = "bottom-right",
  visibleToasts = 3,
  expand = true,
  closeButton = true,
  duration = 3500,
  gap = 8,
  offset = {
    bottom: "calc(var(--space-16) + var(--space-4))",
    right: "var(--space-6)",
  },
  mobileOffset = {
    bottom: "var(--space-3)",
    left: "var(--space-3)",
    right: "var(--space-3)",
  },
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const toastClassNames = toastOptions?.classNames ?? {}

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn(
        "toaster group font-sans max-[767px]:!top-[calc(env(safe-area-inset-top,0px)+var(--space-3))] max-[767px]:!right-[var(--space-3)] max-[767px]:!bottom-auto max-[767px]:!left-[var(--space-3)]",
        className
      )}
      position={position}
      visibleToasts={visibleToasts}
      expand={expand}
      closeButton={closeButton}
      duration={duration}
      gap={gap}
      offset={offset}
      mobileOffset={mobileOffset}
      icons={{
        success: <Icon name="tabler:check" size={15} strokeWidth={3} />,
        info: <Icon name="tabler:check" size={15} strokeWidth={3} />,
        warning: <Icon name="tabler:check" size={15} strokeWidth={3} />,
        error: <Icon name="tabler:alert-circle" size={15} strokeWidth={2.4} />,
        loading: <Icon name="tabler:loader-2" size={15} className="animate-spin" />,
        close: <Icon name="tabler:x" size={13} strokeWidth={2.2} />,
        ...icons,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastClassNames,
          toast: cn(toastBaseClassName, toastClassNames.toast),
          icon: cn(
            "!order-1 !m-0 !flex !size-[22px] !items-center !justify-center !rounded-[var(--radius-pill)]",
            toastClassNames.icon
          ),
          content: cn("!order-2 !min-w-0 !flex-1 !gap-0 !pr-7", toastClassNames.content),
          title: cn(
            "!text-k-sm !font-semibold !leading-[1.4] !tracking-k-base !text-[var(--ink-800)]",
            toastClassNames.title
          ),
          description: cn("!text-k-xs !text-[var(--ink-500)]", toastClassNames.description),
          actionButton: cn(
            "!order-3 !mr-7 !ml-auto !h-auto !rounded-[var(--radius)] !border-0 !bg-[var(--brand-50)] !px-2 !py-1 !text-k-xs !font-bold !text-[var(--brand-700)] hover:!bg-[var(--brand-100)]",
            toastClassNames.actionButton
          ),
          closeButton: cn(
            "kura-toast-close !absolute !top-[calc(var(--space-2)+var(--space-0-5))] !right-3 !left-auto !flex !size-[22px] !shrink-0 !translate-x-0 !translate-y-0 !items-center !justify-center !rounded-[var(--radius-sm)] !border-0 !bg-transparent !p-0 !text-[var(--ink-400)] [&>svg]:!m-0 [&>svg]:!block [&>svg]:!size-[13px] hover:!bg-[var(--ink-50)] hover:!text-[var(--ink-700)] focus-visible:!shadow-[var(--shadow-focus-compact)]",
            toastClassNames.closeButton
          ),
          success: cn(toastSuccessClassName, toastClassNames.success),
          error: cn(toastErrorClassName, toastClassNames.error),
          info: cn(toastInfoClassName, toastClassNames.info),
          warning: cn(toastWarningClassName, toastClassNames.warning),
        },
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--ink-800)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
