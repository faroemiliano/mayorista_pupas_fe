import { useEffect, useState } from 'react'
import { heroSlides } from '../../data/heroSlides'

const ROTATION_TIME = 6500

export function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => setActive((current) => (current + 1) % heroSlides.length), ROTATION_TIME)
    return () => window.clearInterval(timer)
  }, [paused])

  const move = (direction:number) => setActive((current) => (current + direction + heroSlides.length) % heroSlides.length)

  return <section className="hero-carousel" aria-roledescription="carrusel" aria-label="Colecciones destacadas" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
    <div className="hero-track" style={{transform:`translateX(-${active*100}%)`}}>
      {heroSlides.map((slide,index)=><article className={`hero-slide hero-${slide.theme}`} key={slide.id} aria-hidden={index!==active}><div className="hero-copy"><p className="eyebrow">{slide.eyebrow}</p><h1>{slide.title}<br/><em>{slide.highlightedTitle}</em></h1><p>{slide.description}</p><a href="#catalogo">Ver colección <span>↓</span></a></div><div className="hero-media">{slide.mediaType==='video'&&slide.mediaUrl&&<video src={slide.mediaUrl} poster={slide.posterUrl} autoPlay muted loop playsInline/>}{slide.mediaType==='image'&&slide.mediaUrl&&<img src={slide.mediaUrl} alt=""/>}{slide.mediaType==='placeholder'&&<div className="media-placeholder"><span>{slide.id==='bikinis'?'☀':slide.id==='pijamas'?'☾':'✦'}</span><strong>{slide.id}</strong><small>Espacio preparado para foto o video</small></div>}</div></article>)}
    </div>
    <button className="carousel-arrow previous" type="button" onClick={()=>move(-1)} aria-label="Colección anterior">‹</button><button className="carousel-arrow next" type="button" onClick={()=>move(1)} aria-label="Colección siguiente">›</button>
    <div className="carousel-dots">{heroSlides.map((slide,index)=><button key={slide.id} className={index===active?'active':''} onClick={()=>setActive(index)} aria-label={`Ver colección ${slide.id}`} aria-current={index===active?'true':undefined}/>)}</div>
  </section>
}
