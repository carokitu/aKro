import { useRef } from 'react'

type Props = {
  delay?: number
  onDoubleTap?: () => void
  onSingleTap?: () => void
}

export const useDoubleTap = ({ delay = 250, onDoubleTap, onSingleTap }: Props) => {
  const lastTap = useRef<number>(0)
  const timeout = useRef<null | ReturnType<typeof setTimeout>>(null)

  return () => {
    const now = Date.now()

    if (lastTap.current && now - lastTap.current < delay) {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }

      onDoubleTap?.()
    } else {
      timeout.current = setTimeout(() => {
        onSingleTap?.()
      }, delay)
    }

    lastTap.current = now
  }
}
