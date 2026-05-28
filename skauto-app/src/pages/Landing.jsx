import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

import logo      from '../assets/icons/logo.svg'
import kikapu    from '../assets/icons/kikapu.png'
import maya      from '../assets/icons/maya.png'
import otomi     from '../assets/icons/otomi.png'
import wixarica  from '../assets/icons/wixarica.png'
import rocketIcon from '../assets/icons/rocket.svg'
import avanceIcon from '../assets/icons/avance.svg'
import userIcon   from '../assets/icons/user.svg'

const FEATURES = [
  {
    icon: rocketIcon,
    color: '#3AABA8',
    title: 'Diseñá proyectos',
    desc: 'Definí objetivo, motivación, lugar, recursos y ODS. Cada proyecto queda vinculado a tu ruta educativa y a los objetivos que estás trabajando.',
  },
  {
    icon: avanceIcon,
    color: '#E07B39',
    title: 'Visualizá tu avance',
    desc: 'Una senda con hitos por cada ruta. Vé qué objetivos completaste, cuáles tenés en progreso y cuál es tu próximo paso.',
  },
  {
    icon: userIcon,
    color: '#2E9E6B',
    title: 'Compartí con tu clan',
    desc: 'Los scouters acompañan tu progreso desde su panel. Las reflexiones quedan guardadas para tu bitácora personal.',
  },
]

const RUTAS = [
  {
    name: 'Kikapú',
    area: 'SERVICIO',
    areaClass: 'servicio',
    desc: 'Comprometerte con tu comunidad a través del trabajo voluntario y la acción concreta.',
    img: kikapu,
  },
  {
    name: 'Maya',
    area: 'CONOCIMIENTO',
    areaClass: 'conocimiento',
    desc: 'Explorar la ciencia, la cultura y el medio ambiente que te rodea.',
    img: maya,
  },
  {
    name: 'Otomí',
    area: 'LIDERAZGO',
    areaClass: 'liderazgo',
    desc: 'Desarrollar tu capacidad de guiar, decidir y construir junto con otros.',
    img: otomi,
  },
  {
    name: 'Wixárica',
    area: 'ESPIRITUALIDAD',
    areaClass: 'espiritualidad',
    desc: 'Profundizar en tus valores, creencias y la búsqueda de un sentido propio.',
    img: wixarica,
  },
]

const TUTORIALES = [
  {
    id: 1,
    category: 'PRIMEROS PASOS',
    title: 'Creá tu primer proyecto',
    desc: 'De cero a anteproyecto en menos de tres minutos. Nombre, ruta, objetivo general.',
    duration: '2:14',
    color: '#3AABA8',
    url: '#',
  },
  {
    id: 2,
    category: 'PARA ROVERS',
    title: 'Vinculá objetivos educativos',
    desc: 'Cómo conectar tu proyecto con los objetivos de tu ruta y registrar tu avance.',
    duration: '3:42',
    color: '#E07B39',
    url: '#',
  },
  {
    id: 3,
    category: 'PARA ROVERS',
    title: 'Leé tu pantalla de Avance',
    desc: 'Entendé las sendas: nodos completados, en progreso y el siguiente hito.',
    duration: '4:18',
    color: '#2E9E6B',
    url: '#',
  },
]

const MOCKUP_PROYECTOS = [
  { author: 'IRVING SÁNCHEZ', title: 'Reforestación del cerro', desc: 'Plantar 300 árboles nativos con el clan.', badge: 'Activo', badgeClass: 'activo', img: kikapu },
  { author: 'IRVING SÁNCHEZ', title: 'Biblioteca comunitaria', desc: 'Rincón de lectura en el centro cultural.', badge: 'Anteproyecto', badgeClass: 'anteproyecto', img: maya },
  { author: 'IRVING SÁNCHEZ', title: 'Fogata inter-clanes', desc: 'Encuentro espiritual con tres clanes vecinos.', badge: 'Completo', badgeClass: 'completo', img: wixarica },
  { author: 'IRVING SÁNCHEZ', title: 'Taller primeros auxilios', desc: 'RCP y atención básica a scouts menores.', badge: 'Pausado', badgeClass: 'pausado', img: otomi },
]

const NAV_SECTIONS = [
  { id: 'lo-que-hace', label: 'Lo que hace' },
  { id: 'rutas',       label: 'Rutas' },
  { id: 'tutoriales',  label: 'Tutoriales' },
  { id: 'soporte',     label: 'Soporte' },
]

export default function Landing() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const observers = NAV_SECTIONS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <img src={logo} alt="SKAuto" className="landing-nav__logo" />

        <ul className="landing-nav__links">
          {NAV_SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                className={activeSection === id ? 'active' : ''}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <Link to="/login" className="landing-nav__cta">Abrir la app</Link>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero__inner">
        <div className="landing-hero__text">
          <div className="landing-hero__label">
            <span className="landing-hero__label-dot" />
            APP PARA ROVERS
          </div>

          <h1 className="landing-hero__title">
            Tu camino rover,<br />
            <span className="landing-hero__title--accent">en una sola app.</span>
          </h1>

          <p className="landing-hero__desc">
            Diseñá proyectos, registrá tu avance en las cuatro rutas educativas y reflexioná sobre lo aprendido. SKAuto te acompaña en cada hito del clan.
          </p>

          <div className="landing-hero__actions">
            <Link to="/login" className="landing-hero__btn-primary">
              <img src={rocketIcon} alt="" />
              Abrir la app
            </Link>
            <button className="landing-hero__btn-secondary" onClick={() => scrollTo('lo-que-hace')}>
              Ver cómo funciona →
            </button>
          </div>

          <div className="landing-hero__tags">
            <span>Hecho por rovers, para rovers</span>
            <span>Gratis · sin anuncios</span>
            <span>Web + móvil</span>
          </div>
        </div>

        <div className="landing-hero__mockup">
          <div className="mockup-window">
            <div className="mockup-dots">
              <span /><span /><span />
            </div>
            <div className="mockup-body">
              <div className="mockup-header">
                <h3>Mis Proyectos</h3>
                <button className="mockup-nuevo">+ Nuevo</button>
              </div>
              <div className="mockup-grid">
                {MOCKUP_PROYECTOS.map((p, i) => (
                  <div key={i} className="mockup-card">
                    <div className="mockup-card__author">{p.author}</div>
                    <div className="mockup-card__title">{p.title}</div>
                    <div className="mockup-card__desc">{p.desc}</div>
                    <div className="mockup-card__footer">
                      <span className={`mockup-badge mockup-badge--${p.badgeClass}`}>{p.badge}</span>
                      <img src={p.img} alt="" className="mockup-card__icon" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── LO QUE HACE ── */}
      <section id="lo-que-hace" className="landing-section landing-section--white">
        <div className="landing-section__label">LO QUE PODÉS HACER</div>
        <h2 className="landing-section__title">Una herramienta diseñada para el ciclo del rover.</h2>
        <p className="landing-section__sub">Desde el anteproyecto hasta la reflexión final, todo en un mismo lugar.</p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon" style={{ background: f.color }}>
                <img src={f.icon} alt="" />
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── RUTAS ── */}
      <section id="rutas" className="landing-section landing-section--cream">
        <div className="landing-section__label">LAS CUATRO RUTAS</div>
        <h2 className="landing-section__title">Cuatro caminos, una misma travesía.</h2>
        <p className="landing-section__sub">Cada ruta toma su nombre de un pueblo originario de México y trabaja un área educativa distinta.</p>

        <div className="rutas-grid">
          {RUTAS.map((r) => (
            <div key={r.name} className="ruta-card">
              <img src={r.img} alt={r.name} className="ruta-card__img" />
              <h3 className="ruta-card__name">{r.name}</h3>
              <div className={`ruta-card__area ruta-card__area--${r.areaClass}`}>{r.area}</div>
              <p className="ruta-card__desc">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TUTORIALES ── */}
      <section id="tutoriales" className="landing-section landing-section--white">
        <div className="landing-section__label">TUTORIALES</div>
        <h2 className="landing-section__title">Aprendé a usar SKAuto en pocos minutos.</h2>
        <p className="landing-section__sub">Videos cortos para que arranques rápido, ya seas rover o scouter.</p>

        <div className="tutoriales-grid">
          {TUTORIALES.map((t) => (
            <a
              key={t.id}
              href={t.url}
              className="tutorial-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="tutorial-card__thumb" style={{ background: t.color }}>
                <div className="tutorial-card__play" />
                <span className="tutorial-card__duration">{t.duration}</span>
              </div>
              <div className="tutorial-card__body">
                <div className="tutorial-card__category">{t.category}</div>
                <div className="tutorial-card__title">{t.title}</div>
                <div className="tutorial-card__desc">{t.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── SOPORTE ── */}
      <section id="soporte" className="landing-soporte">
        <div className="landing-soporte__label">SOPORTE</div>
        <h2 className="landing-soporte__title">
          ¿Necesitás una mano?<br />Te escribimos de vuelta.
        </h2>
        {/* TODO: reemplazar href con el link del formulario de Google Forms */}
        <a href="#" className="landing-soporte__btn" target="_blank" rel="noopener noreferrer">
          Escribinos →
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <p>© 2025 SKAuto · Hecho por rovers, para rovers</p>
      </footer>

    </div>
  )
}
