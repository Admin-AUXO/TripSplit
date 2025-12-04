import { useEffect } from 'react'

export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey
      const altKey = e.altKey
      const shiftKey = e.shiftKey

      for (const shortcut of shortcuts) {
        const { key: shortcutKey, ctrl, alt, shift, handler } = shortcut
        const keyMatch = shortcutKey.toLowerCase() === key
        const ctrlMatch = ctrl ? ctrlKey : !ctrlKey
        const altMatch = alt ? altKey : !altKey
        const shiftMatch = shift ? shiftKey : !shiftKey

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault()
          handler(e)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

