import React, { createContext, useContext, useEffect, useState } from 'react'
import { getColors as getColorsImage } from 'react-native-image-colors'

import Colors from 'color'
import * as Sentry from '@sentry/react-native'

type ColorContextType = {
  color?: string
}

const ColorContext = createContext<ColorContextType | null>(null)

export const useTrackColors = () => {
  const context = useContext(ColorContext)
  if (!context) {
    Sentry.captureException(new Error('useTrackColors must be used within ColorProvider'))
    throw new Error('useTrackColors must be used within ColorProvider')
  }

  return context
}

export const getColor = async (uri: string) => {
  const result = await getColorsImage(uri, {
    cache: true,
    fallback: '#000000',
    key: uri, // clé unique pour le cache
  })

  if (result.platform === 'android') {
    const isLight = Colors(result.lightVibrant).isLight()
    return isLight ? result.lightVibrant : result.lightMuted
  } else if (result.platform === 'ios') {
    const isLight = Colors(result.background).isLight()
    return isLight ? result.background : result.secondary
  }
}

export const ColorProvider = ({ children, coverUrl }: { children: React.ReactNode; coverUrl: string }) => {
  const [color, setColor] = useState<string | undefined>()

  useEffect(() => {
    const fetchColor = async () => {
      const fetchedColor = await getColor(coverUrl)
      setColor(fetchedColor)
    }

    fetchColor()
  }, [coverUrl])

  return <ColorContext.Provider value={{ color }}>{children}</ColorContext.Provider>
}
