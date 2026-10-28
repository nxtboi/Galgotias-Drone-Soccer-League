import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DroneSoccerHero } from './components/DroneSoccerHero';
import { TournamentOverviewSection } from './components/TournamentOverviewSection';
import { GcdisSpotlightBanner } from './components/GcdisSpotlightBanner';
import { EventVoicesAndQuotes } from './components/EventVoicesAndQuotes';
import { SponsorsDivisionSection } from './components/SponsorsDivisionSection';
import { Footer } from './components/Footer';
import { StormSkyBackground } from './components/StormSkyBackground';
import { SocialShareModal } from './components/SocialShareModal';

// Dedicated Event Pages
import { TournamentBracketPage } from './pages/TournamentBracketPage';
import { TeamRegistrationPage } from './pages/TeamRegistrationPage';
import { RulesAndSpecsPage } from './pages/RulesAndSpecsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { OurTeamPage } from './pages/OurTeamPage';
import { TeamLoginPage } from './pages/TeamLoginPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PracticeArenaPage } from './pages/PracticeArenaPage';

// Session store
import {
  getCurrentSession,
  setCurrentSession,
  clearCurrentSession,
  RegisteredTeamProfile,
  INITIAL_REGISTERED_TEAMS,
} from './data/teamAuthData';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'practice' | 'bracket' | 'register' | 'rules' | 'gallery' | 'team' | 'contact' | 'login' | 'dashboard' | 'admin'
  >('home');

  const [currentTeam, setCurrentTeam] = useState<RegisteredTeamProfile | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Hydrate existing admin session
    if (localStorage.getItem('gdsl_admin_session_v1') === 'true') {
      setIsAdminLoggedIn(true);
      setCurrentTeam(null);
      return;
    }
    // Hydrate existing team session
    const session = getCurrentSession();
    if (session) {
      setCurrentTeam(session);
      setIsAdminLoggedIn(false);
    }
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab as typeof activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (team: RegisteredTeamProfile) => {
    // Clear admin session
    setIsAdminLoggedIn(false);
    localStorage.removeItem('gdsl_admin_session_v1');
    // Set team session
    setCurrentTeam(team);
    setCurrentSession(team);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = () => {
    // Clear team session
    clearCurrentSession();
    setCurrentTeam(null);
    // Set admin session
    setIsAdminLoggedIn(true);
    localStorage.setItem('gdsl_admin_session_v1', 'true');
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    // Clear all active sessions
    clearCurrentSession();
    setCurrentTeam(null);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('gdsl_admin_session_v1');
    setActiveTab('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTeam = (updated: RegisteredTeamProfile) => {
    setCurrentTeam(updated);
  };

  const isHomePage = activeTab === 'home';

  return (
    <main className="relative w-full min-h-screen bg-[#111210] text-white selection:bg-[#d0fe1d] selection:text-black overflow-x-hidden font-sans">
      {/* 1. XOTC Dark Obsidian Atmosphere Background */}
      <StormSkyBackground />

      {/* 2. Fixed Event Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-auto">
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenRegister={() => handleSelectTab('register')}
          onOpenShare={() => setIsShareModalOpen(true)}
          loggedInTeam={currentTeam}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
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
              onPracticeClick={() => handleSelectTab('practice')}
              onShareClick={() => setIsShareModalOpen(true)}
            />
          </section>

          {/* Tournament Overview: Explainer, D-20 & D-40 Prize Pools, 2-Day Timeline, Arena Host */}
          <TournamentOverviewSection
            onRegisterClick={() => handleSelectTab('register')}
            onBracketClick={() => handleSelectTab('bracket')}
            onRulesClick={() => handleSelectTab('rules')}
          />

          {/* Championship Voices, Leadership & Press Endorsements */}
          <EventVoicesAndQuotes
            onRegisterClick={() => handleSelectTab('register')}
            onShareClick={() => setIsShareModalOpen(true)}
          />

          {/* Official Sponsors & Industry Partners Division */}
          <SponsorsDivisionSection onNavigate={handleSelectTab} />

          {/* Quick Hub Spotlight Banner */}
          <GcdisSpotlightBanner onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: 3D Practice Arena & Transmitter Flight Simulator */}
      {activeTab === 'practice' && (
        <div className="xotc-page-scope">
          <PracticeArenaPage onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: Tournament Bracket, Fixtures & Simulator */}
      {activeTab === 'bracket' && (
        <div className="xotc-page-scope">
          <TournamentBracketPage
            onNavigate={handleSelectTab}
            onOpenRegister={() => handleSelectTab('register')}
          />
        </div>
      )}

      {/* Dedicated Page: Team Registration & Digital Pass */}
      {activeTab === 'register' && (
        <div className="xotc-page-scope">
          <TeamRegistrationPage
            onNavigate={handleSelectTab}
            onRegisterSuccess={(team) => {
              setIsAdminLoggedIn(false);
              localStorage.removeItem('gdsl_admin_session_v1');
              setCurrentTeam(team);
            }}
          />
        </div>
      )}

      {/* Dedicated Page: Rules, Drone Specs & FAI/GCDIS Handbook */}
      {activeTab === 'rules' && (
        <div className="xotc-page-scope">
          <RulesAndSpecsPage
            onNavigate={handleSelectTab}
            onOpenRegister={() => handleSelectTab('register')}
          />
        </div>
      )}

      {/* Dedicated Page: Real Arena Action Gallery */}
      {activeTab === 'gallery' && (
        <div className="xotc-page-scope">
          <GalleryPage onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: Contact & Secretariat Helpline */}
      {activeTab === 'contact' && (
        <div className="xotc-page-scope">
          <ContactPage onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: Our Team (Techkriti-inspired card directory) */}
      {activeTab === 'team' && (
        <div className="xotc-page-scope">
          <OurTeamPage onNavigate={handleSelectTab} />
        </div>
      )}

      {/* Dedicated Page: Team Login Portal */}
      {activeTab === 'login' && (
        <TeamLoginPage
          onLoginSuccess={handleLoginSuccess}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onNavigate={handleSelectTab}
          loggedInTeam={currentTeam}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
        />
      )}

      {/* Dedicated Page: Registered Squad Dashboard */}
      {activeTab === 'dashboard' && (
        <TeamDashboardPage
          team={currentTeam || INITIAL_REGISTERED_TEAMS[0]}
          onLogout={handleLogout}
          onNavigate={handleSelectTab}
          onUpdateTeam={handleUpdateTeam}
        />
      )}

      {/* Dedicated Page: Tournament Admin Control Panel (Google Sheets Data) */}
      {activeTab === 'admin' && (
        <div className="xotc-page-scope">
          <AdminDashboardPage
            onLogout={handleLogout}
            onNavigate={handleSelectTab}
          />
        </div>
      )}

      {/* Global Comprehensive Tournament Footer */}
      <Footer
        onNavigate={handleSelectTab}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* Global Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </main>
  );
}
export default App;
