import { type Post } from '../../../../models'

export type EnhancedFeedPost = Post & {
  isOnSpotifyLibrary: boolean
}
