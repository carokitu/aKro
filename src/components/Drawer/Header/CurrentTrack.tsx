import { useCurrentTrack } from '../../../../hooks'
import { Track } from '../Track'

export const CurrentTrack = () => {
  const { currentTrack } = useCurrentTrack()

  if (!currentTrack) {
    return null
  }

  return <Track current isFirst isLast track={currentTrack} />
}
