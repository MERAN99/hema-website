import { useLanguage } from './i18n/LanguageProvider';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Values } from './components/Values';
import { Services } from './components/Services';
import { Vision } from './components/Vision';
import { Projects } from './components/Projects';
import { MoreProjects } from './components/MoreProjects';
import { TrackRecord } from './components/TrackRecord';
import { Fleet } from './components/Fleet';
import { Team } from './components/Team';
import { Certificates } from './components/Certificates';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  const { lang } = useLanguage();
  useSmoothScroll();

  return (
    // Re-keying on language replays entrance animations and resets layout measurements for the new direction.
    <div key={lang}>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Values />
        <Services />
        <Vision />
        <Projects />
        <MoreProjects />
        <TrackRecord />
        <Fleet />
        <Team />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
