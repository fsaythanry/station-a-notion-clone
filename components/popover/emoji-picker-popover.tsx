import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useTheme } from "next-themes"
import { PropsWithChildren } from "react"
import { Button } from "../ui/button"
import { Trash2Icon } from "lucide-react"

enum SKIN_TYPES {
  DEFAULT = 1,
  LIGHT = 2,
  MEDIUM_LIGHT = 3,
  MEDIUM = 4,
  MEDIUM_DARK = 5,
  DARK = 5,
}

export type Emoji = {
  id: string
  keywords: string[]
  name: string
  native: string
  shortcodes: string
  unified: string
  skin?: SKIN_TYPES
  aliases?: string[]
}

type Props = PropsWithChildren & {
  onEmojiSelect: (emoji: Emoji, event: PointerEvent) => void
  onClickRemove?: () => void
}

export default function EmojiPickerPopover({
  children,
  onEmojiSelect,
  onClickRemove,
}: Props) {
  const { theme } = useTheme()

  const th = theme === "dark" ? "dark" : "light"

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-auto border-none bg-transparent p-0 shadow-none outline-none "
        align="start"
      >
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-background shadow-md">
          <div className="flex w-full items-center justify-between p-2">
            <p className="pl-1 text-sm font-medium">Emoji</p>
            {onClickRemove && (
              <Button
                size="sm"
                className="h-auto p-1 text-xs font-normal"
                variant="secondary"
                onClick={onClickRemove}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            searchPosition="none"
            theme={th}
            skinTonePosition="none"
            previewPosition="none"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
