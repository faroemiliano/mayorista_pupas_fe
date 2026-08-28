export type HeroSlide = {
  id: string
  eyebrow: string
  title: string
  highlightedTitle: string
  description: string
  mediaType: 'image' | 'video' | 'placeholder'
  mediaUrl?: string
  posterUrl?: string
  theme: 'summer' | 'night' | 'soft'
}
