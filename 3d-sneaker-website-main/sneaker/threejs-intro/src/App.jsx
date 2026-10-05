import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, ContactShadows, Float, OrbitControls, useGLTF } from '@react-three/drei'
import { createContext, Suspense, useContext, useEffect, useRef, useState } from 'react'

import './App.css'

// Static team data — names + photos never change between languages.
const team = [
  { name: 'Noah Julian da Conceição', img: '/about/NoahJulianDaConceicao.png' },
  { name: 'Mayson Roeleveld', img: '/about/MaysonRoeleveld.png' },
  { name: 'Nino Sowinangoen', img: '/about/NinoSowinangoen.png' },
]

// Selectable UI languages (order = order in the dropdown).
const languages = [
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
]

// All translatable copy, keyed by language code.
const translations = {
  en: {
    nav: { home: 'Home', view: 'view the shoe', about: 'About Us' },
    home: {
      topSelling: '#TOP SELLING SHOES',
      category: "Men's Shoes",
      desc:
        'The Air Jordan 1 Retro High remakes the classic sneaker, giving you a fresh look with a familiar feel. Premium materials with new colors and textures give modern expression to an all-time favorite.',
    },
    view: {
      model: 'MODEL',
      colorway: 'Colorway',
      position: 'Position',
      hover: 'Hover',
      grounded: 'Grounded',
      details: 'DETAILS',
      release: 'Year',
      retail: 'Retail',
      palette: 'Palette',
      camera: 'CAMERA',
      fov: 'Field of View',
      rotation: 'Rotation Speed',
      dragHint: 'Drag to rotate · scroll to zoom',
    },
    about: {
      title: 'ABOUT US',
      members: [
        {
          role: 'UX Designer & Developer',
          bio: [
            'Hi, I am Noah Julian da Conceição. I brought this project to life through UX design and front-end development. Starting from Mayson Roelevelds original vision and 3D expertise, I transformed the concept into a polished, interactive website that blends immersive sneaker visuals with an intuitive user experience.',
          ],
        },
        {
          role: '3D & Immersive Designer',
          bio: [
            'Hi, I am Mayson Roeleveld. I started this project by turning my passion for sneakers and 3D design into an interactive concept. My focus was on creating realistic models and immersive visuals that capture every detail, laying the creative foundation for the experience. Together with Noahs UX design and development, the idea evolved into the finished website you see today.',
          ],
        },
        {
          role: 'Front-end Engineer',
          bio: [
            'Hi, I am Nino Sowinangoen. As the planner and tester of this project, I helped organize the development process and ensured every feature worked as intended. By coordinating the workflow and thoroughly testing the website, I helped create a smooth, reliable, and user-friendly experience from start to finish.',
          ],
        },
      ],
    },
  },
  nl: {
    nav: { home: 'Home', view: 'bekijk de schoen', about: 'Over ons' },
    home: {
      topSelling: '#BEST VERKOCHTE SCHOENEN',
      category: 'Herenschoenen',
      desc:
        'De Air Jordan 1 Retro High geeft de klassieke sneaker een frisse look met een vertrouwd gevoel. Premium materialen met nieuwe kleuren en texturen geven een moderne draai aan een tijdloze favoriet.',
    },
    view: {
      model: 'MODEL',
      colorway: 'Kleurstelling',
      position: 'Positie',
      hover: 'Zwevend',
      grounded: 'Op de grond',
      details: 'DETAILS',
      release: 'Jaar',
      retail: 'Prijs',
      palette: 'Palet',
      camera: 'CAMERA',
      fov: 'Gezichtsveld',
      rotation: 'Rotatiesnelheid',
      dragHint: 'Sleep om te draaien · scroll om te zoomen',
    },
    about: {
      title: 'OVER ONS',
      members: [
        {
          role: 'UX-ontwerper & Developer',
          bio: [
            'Hoi, ik ben Noah Julian da Conceição. Ik heb dit project tot leven gebracht met UX-design en front-end development. Vanuit Mayson Roelevelds oorspronkelijke visie en 3D-expertise heb ik het concept omgevormd tot een verzorgde, interactieve website die meeslepende sneakervisuals combineert met een intuïtieve gebruikerservaring.',
          ],
        },
        {
          role: '3D- & Immersive Ontwerper',
          bio: [
            'Hoi, ik ben Mayson Roeleveld. Ik begon dit project door mijn passie voor sneakers en 3D-design om te zetten in een interactief concept. Mijn focus lag op realistische modellen en meeslepende visuals die elk detail vastleggen, wat de creatieve basis legde voor de ervaring. Samen met Noahs UX-design en development groeide het idee uit tot de afgeronde website die je nu ziet.',
          ],
        },
        {
          role: 'Front-end Engineer',
          bio: [
            'Hoi, ik ben Nino Sowinangoen. Als planner en tester van dit project hielp ik het ontwikkelproces te organiseren en zorgde ik dat elke functie werkte zoals bedoeld. Door de workflow te coördineren en de website grondig te testen, hielp ik een soepele, betrouwbare en gebruiksvriendelijke ervaring te creëren van begin tot eind.',
          ],
        },
      ],
    },
  },
}

// Shared language state — t is the active translation tree.
const LangContext = createContext({ lang: 'en', setLang: () => {}, t: translations.en })
const useLang = () => useContext(LangContext)

// Floating coral bubbles positioned around the hero (values are % of the stage).
const bubbles = [
  { left: 62, top: 22, size: 70 },
  { left: 53, top: 30, size: 150 },
  { left: 60, top: 44, size: 60 },
  { left: 20, top: 32, size: 44 },
  { left: 28, top: 70, size: 175 },
  { left: 38, top: 80, size: 52 },
  { left: 70, top: 78, size: 40 },
]

// Loaded Jordan model, optionally spinning on its own (home hero).
function Sneaker({ autoSpin = true }) {
  const group = useRef()

  useFrame((_, delta) => {
    if (autoSpin && group.current) {
      group.current.rotation.y += delta * 0.25
    }
  })

  const gltf = useGLTF('/model.glb', false, true)

  return (
    <group ref={group} rotation={[0.05, -0.9, 0.34]} scale={5.4}>
      <Center>
        <primitive object={gltf.scene} />
      </Center>
    </group>
  )
}

// Keeps the live camera fov in sync with the slider on the configurator.
function CameraRig({ fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [fov, camera])
  return null
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 8]} intensity={2.4} />
      <directionalLight position={[-5, 3, -2]} intensity={1} color="#ffd5d5" />
      <hemisphereLight intensity={0.6} groundColor="#f8b5bd" />
    </>
  )
}

// Home hero canvas: gentle float + slow auto-spin, no interaction.
function Scene() {
  return (
    <Canvas
      className="sneaker-canvas"
      camera={{ position: [0, 0.1, 6], fov: 30 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Lights />
      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
          <Sneaker />
        </Float>
        <ContactShadows
          position={[0, -1.35, 0]}
          opacity={0.32}
          scale={9}
          blur={3}
          far={4}
          resolution={256}
          color="#b21f33"
        />
      </Suspense>
    </Canvas>
  )
}

// Configurator canvas: drag to orbit, slider-driven fov + auto-rotate speed.
function ViewScene({ fov, rotationSpeed }) {
  return (
    <Canvas
      className="view-canvas"
      camera={{ position: [0, 0.1, 6], fov }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <CameraRig fov={fov} />
      <Lights />
      <Suspense fallback={null}>
        <Sneaker autoSpin={false} />
        <ContactShadows
          position={[0, -1.35, 0]}
          opacity={0.32}
          scale={9}
          blur={3}
          far={4}
          resolution={256}
          color="#b21f33"
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={9}
        autoRotate={rotationSpeed > 0}
        autoRotateSpeed={rotationSpeed * 6}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  )
}

function LangPicker() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = languages.find((l) => l.code === lang) ?? languages[0]

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div className={`lang${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="lang-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {current.label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={`lang-option${l.code === lang ? ' active' : ''}`}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Navbar({ page, onNavigate }) {
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)
  const links = [
    { key: 'home', label: t.nav.home },
    { key: 'view', label: t.nav.view },
    { key: 'about', label: t.nav.about },
  ]

  const go = (key) => {
    onNavigate(key)
    setMenuOpen(false)
  }

  // Close the mobile menu when tapping outside the navbar.
  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  return (
    <header className={`navbar${menuOpen ? ' menu-open' : ''}`} ref={ref}>
      <a
        className="logo"
        href="#home"
        onClick={(e) => {
          e.preventDefault()
          go('home')
        }}
      >
        NTS goons<span>.</span>
      </a>
      <nav id="primary-nav" className={`nav${menuOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <a
            key={link.key}
            href="#"
            className={`nav-link${link.key === page ? ' active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              go(link.key)
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="nav-controls">
        <LangPicker />
        <button
          type="button"
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

function HomePage() {
  const { t } = useLang()
  return (
    <>
      {/* Right pagination dots */}
      <aside className="dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot ring" />
        <span className="dot" />
        <span className="dot" />
      </aside>

      {/* Hero stage */}
      <section className="stage">
        <p className="top-selling">{t.home.topSelling}</p>

        <h2 className="ghost-title" aria-hidden="true">AIR JORDAN</h2>

        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, animationDelay: `${i * -0.8}s` }}
          />
        ))}

        <div className="nike" aria-label="Nike">
          <svg viewBox="0 0 78 28" fill="none"><path d="M6 27c-2.7-.1-4.6-1.5-5.4-3.7-.3-.8-.4-2.3-.2-3.2.4-2.5 2-5 4.9-7.6C7.4 10.6 12 7.6 12.4 7.8c.1 0-1 1.5-1.7 2.5-2 2.9-2.9 5.3-2.7 7 .2 1.5 1.1 2.5 2.5 2.8 1 .2 2.7 0 4.2-.5.6-.2 41-15.9 56.4-21.9.4-.2.8-.3.8-.3.1.1-46.9 26.7-49.8 28.2C18.7 26.3 16.8 27 14.4 27.3c-.6.1-7.6.1-8.4-.3z" fill="currentColor"/></svg>
        </div>

        <p className="varsity">VARSITY<br /><span>RED</span></p>

        <Scene />

        <button className="badge-360">
          <span>&lt;</span> 360° <span>&gt;</span>
        </button>
      </section>

      {/* Bottom-left product info */}
      <section className="product">
        <h1>Air Jordan 1</h1>
        <div className="meta">
          <span className="cat">{t.home.category}</span>
          <span className="price">$180.50</span>
        </div>
        <p className="desc">{t.home.desc}</p>
      </section>
    </>
  )
}

const colorwaySpecs = {
  Chicago: { year: '1985', retail: '$180', swatches: ['#c8102e', '#ffffff', '#000000'] },
  Bred:    { year: '1994', retail: '$180', swatches: ['#000000', '#c8102e'] },
  Royal:   { year: '1985', retail: '$180', swatches: ['#0057a8', '#ffffff', '#000000'] },
  Shadow:  { year: '1985', retail: '$180', swatches: ['#4a4145', '#c0bfbf', '#000000'] },
}

function ViewPage() {
  const { t } = useLang()
  const [fov, setFov] = useState(38)
  const [rotationSpeed, setRotationSpeed] = useState(0.3)
  const [colorway, setColorway] = useState('Chicago')
  const [position, setPosition] = useState('hover')

  return (
    <section className="view-stage">
      <h2 className="ghost-title view-ghost" aria-hidden="true">AIR JORDAN</h2>

      {bubbles.slice(0, 4).map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{ left: `${b.left}%`, top: `${b.top}%`, width: b.size, height: b.size, animationDelay: `${i * -0.8}s` }}
        />
      ))}

      <ViewScene fov={fov} rotationSpeed={rotationSpeed} />

      <p className="drag-hint">{t.view.dragHint}</p>

      <aside className="config-panels">
        <section className="cfg-card">
          <span className="cfg-tag">{t.view.model}</span>
          <label className="cfg-field">
            <span>{t.view.colorway}</span>
            <select value={colorway} onChange={(e) => setColorway(e.target.value)}>
              <option>Chicago</option>
              <option>Bred</option>
              <option>Royal</option>
              <option>Shadow</option>
            </select>
          </label>
          <label className="cfg-field">
            <span>{t.view.position}</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="hover">{t.view.hover}</option>
              <option value="grounded">{t.view.grounded}</option>
            </select>
          </label>
        </section>

        <section className="cfg-card">
          <span className="cfg-tag">{t.view.details}</span>
          <div className="cfg-spec-row">
            <span className="cfg-spec-label">{t.view.release}</span>
            <span className="cfg-spec-val">{colorwaySpecs[colorway].year}</span>
          </div>
          <div className="cfg-spec-row">
            <span className="cfg-spec-label">{t.view.retail}</span>
            <span className="cfg-spec-val cfg-spec-price">{colorwaySpecs[colorway].retail}</span>
          </div>
          <div className="cfg-palette-row">
            <span className="cfg-spec-label">{t.view.palette}</span>
            <div className="cfg-palette-swatches">
              {colorwaySpecs[colorway].swatches.map((color, i) => (
                <span key={i} className="cfg-swatch-dot" style={{ background: color }} />
              ))}
            </div>
          </div>
        </section>

        <section className="cfg-card">
          <span className="cfg-tag">{t.view.camera}</span>
          <label className="cfg-slider">
            <span>{t.view.fov}</span>
            <div className="cfg-slider-row">
              <input type="range" min="20" max="90" value={fov} onChange={(e) => setFov(Number(e.target.value))} />
              <output>{fov}</output>
            </div>
          </label>
          <label className="cfg-slider">
            <span>{t.view.rotation}</span>
            <div className="cfg-slider-row">
              <input type="range" min="0" max="2" step="0.1" value={rotationSpeed} onChange={(e) => setRotationSpeed(Number(e.target.value))} />
              <output>{rotationSpeed.toFixed(1)}</output>
            </div>
          </label>
        </section>
      </aside>
    </section>
  )
}

function AboutPage() {
  const { t } = useLang()
  return (
    <section className="about">
      <h1 className="about-title">{t.about.title}</h1>
      <div className="about-rule" />

      {team.map((person, i) => {
        const copy = t.about.members[i]
        return (
          <article key={person.name} className={`about-row${i % 2 ? ' reverse' : ''}`}>
            <figure className="about-photo">
              <img src={person.img} alt={person.name} loading="lazy" />
            </figure>

            <div className="about-divider" aria-hidden="true" />

            <div className="about-text">
              <span className="about-index">{String(i + 1).padStart(2, '0')}</span>
              <h2>{person.name}</h2>
              <p className="about-role">{copy.role}</p>
              {copy.bio.map((para, j) => (
                <p key={j} className="about-bio">{para}</p>
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}

const pages = {
  home: HomePage,
  view: ViewPage,
  about: AboutPage,
}

export default function App() {
  const [page, setPage] = useState('home')
  const [lang, setLang] = useState('en')
  const Page = pages[page] ?? HomePage
  const t = translations[lang] ?? translations.en

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div className="frame">
        <main className={`site site-${page}`}>
          <Navbar page={page} onNavigate={setPage} />
          <Page />
        </main>
      </div>
    </LangContext.Provider>
  )
}

useGLTF.preload('/model.glb', false, true)
