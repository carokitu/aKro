import { ActionButtons, ExpendedLikes } from './ActionButtons'
import { Container } from './Container'
import { Footer } from './Footer'
import { ExpendedDescription, Header } from './Header'
import { InteractiveContainer } from './InteractiveContainer'
import { Track } from './Track'

export const Post = Object.assign(Container, {
  ActionButtons,
  Container,
  ExpendedDescription,
  ExpendedLikes,
  Footer,
  Header,
  InteractiveContainer,
  Track,
})
