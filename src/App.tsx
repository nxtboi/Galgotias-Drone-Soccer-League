import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { DroneSoccerHero } from './components/DroneSoccerHero';
import { TournamentOverviewSection } from './components/TournamentOverviewSection';
import { GcdisSpotlightBanner } from './components/GcdisSpotlightBanner';
import { Footer } from './components/Footer';
import { StormSkyBackground } from './components/StormSkyBackground';

// Dedicated Event Pages
import { TournamentBracketPage } from './pages/TournamentBracketPage';
import { TeamRegistrationPage } from './pages/TeamRegistrationPage';
import { RulesAndSpecsPage } from './pages/RulesAndSpecsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'bracket' | 'register' | 'rules' | 'gallery' | 'contact'>('home');

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab as typeof activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomePage = activeTab === 'home';

  return (
    <main className="relative w-full min-h-screen bg-transparent text-blue-950 selection:bg-blue-100 selection:text-blue-950 overflow-x-hidden font-sans">
      {/* 1. Daylight Atmosphere Background */}
      <StormSkyBackground />

      {/* 2. Fixed Event Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-auto">
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenRegister={() => handleSelectTab('register')}
        />
      </div>

      {/* 3. EVENT ROUTER */}
      {isHomePage && (
        <div className="relative z-20">
          {/* Hero Section: Real Drone Soccer Broadcast Arena & Official Tournament Presentation */}
          <section id="hero" className="relative w-full pt-16 flex flex-col justify-between">
            <DroneSoccerHero
              onRegisterClick={() => handleSelectTab('register')}
              onBracketClick={() => handleSelectTab('bracket')}
              onRulesClick={() => handleSelectTab('rules')}
            />
          </section>

          {/* Tournament Overview: Explainer, ₹1,00,000 Prize Breakdown, 2-Day Timeline, Arena Host */}
          <TournamentOverviewSection
            onRegisterClick={() => handleSelectTab('register')}
            onBracketClick={() => handleSelectTab('bracket')}
            onRulesClick={() => handleSelectTab('rules')}
          />

          {/* Quick Hub Spotlight Banner */}
          <GcdisSpotlightBanner onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: Tournament Bracket, Fixtures & Simulator */}
      {activeTab === 'bracket' && (
        <TournamentBracketPage
          onNavigate={handleSelectTab}
          onOpenRegister={() => handleSelectTab('register')}
        />
      )}

      {/* Dedicated Page: Team Registration & Digital Pass */}
      {activeTab === 'register' && (
        <TeamRegistrationPage onNavigate={handleSelectTab} />
      )}

      {/* Dedicated Page: Rules, Drone Specs & FAI/FIDA Handbook */}
      {activeTab === 'rules' && (
        <RulesAndSpecsPage
          onNavigate={handleSelectTab}
          onOpenRegister={() => handleSelectTab('register')}
        />
      )}

      {/* Dedicated Page: Real Arena Action Gallery */}
      {activeTab === 'gallery' && (
        <GalleryPage onNavigate={handleSelectTab} />
      )}

      {/* Dedicated Page: Contact & Secretariat Helpline */}
      {activeTab === 'contact' && (
        <ContactPage onNavigate={handleSelectTab} />
      )}

      {/* Global Comprehensive Tournament Footer */}
      <Footer onNavigate={handleSelectTab} />
    </main>
  );
}
export default App;
