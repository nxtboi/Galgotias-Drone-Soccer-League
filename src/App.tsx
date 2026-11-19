import { clearAuthToken, fetchCurrentAuth, getAuthToken, type AdminRole } from './services/apiClient';
import { clearPendingGoogleSignup } from './components/GoogleSignInButton';
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
  getRegisteredTeams,
  saveRegisteredTeam,
  clearRegisteredTeamsCache,
} from './data/teamAuthData';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'practice' | 'bracket' | 'register' | 'rules' | 'gallery' | 'team' | 'contact' | 'login' | 'dashboard' | 'admin'
  >('home');

  const [currentTeam, setCurrentTeam] = useState<RegisteredTeamProfile | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>('admin');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Clean up data older versions of the site left in this browser: an admin flag that
    // granted access, and full copies of the team roster / Google token in localStorage.
    try {
      ['gdsl_admin_session_v1', 'gdsl_registered_teams_v1', 'gdsl_google_access_token_v1', 'gdsl_google_user_profile_v1'].forEach(
        (key) => localStorage.removeItem(key)
      );
    } catch {
      // storage unavailable
    }

    // Show the cached team session straight away (if this browser still has a token),
    // then confirm it with the server.
    const cached = getAuthToken() ? getCurrentSession() : null;
    if (cached) setCurrentTeam(cached);

    fetchCurrentAuth().then((auth) => {
      if (!auth) {
        if (!getAuthToken()) {
          // Token missing or rejected by the server: drop any cached private data
          clearCurrentSession();
          clearRegisteredTeamsCache();
          setCurrentTeam(null);
          setIsAdminLoggedIn(false);
        }
        return;
      }
      if (auth.role === 'admin') {
        clearCurrentSession();
        setCurrentTeam(null);
        setAdminRole(auth.adminRole);
        setIsAdminLoggedIn(true);
      } else {
        saveRegisteredTeam(auth.team);
        setCurrentSession(auth.team);
        setCurrentTeam(auth.team);
        setIsAdminLoggedIn(false);
      }
    });
  }, []);

  const handleSelectTab = (tab: string) => {
    if (tab === 'prizepool') {
      setActiveTab('home');
      setTimeout(() => {
        const el = document.getElementById('prize-pool');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return;
    }

    if (tab === 'dashboard') {
      const session = getCurrentSession();
      if (session) {
        const allTeams = getRegisteredTeams();
        const latest = allTeams.find((t) => t.teamId === session.teamId) || session;
        setCurrentTeam(latest);
        setCurrentSession(latest);
      }
    }

    setActiveTab(tab as typeof activeTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (team: RegisteredTeamProfile) => {
    setIsAdminLoggedIn(false);
    // Set team session (the token was stored by the login call)
    setCurrentTeam(team);
    setCurrentSession(team);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (role: AdminRole = 'admin') => {
    // Clear team session
    clearCurrentSession();
    setCurrentTeam(null);
    setAdminRole(role);
    // Admin session (server-issued token already stored by the login call)
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    // Clear all active sessions and cached private data
    clearAuthToken();
    clearCurrentSession();
    clearRegisteredTeamsCache();
    clearPendingGoogleSignup();
    try {
      // Roster cache, Google Sheets token and anything else kept for this tab
      sessionStorage.clear();
    } catch {
      // storage unavailable
    }
    setCurrentTeam(null);
    setIsAdminLoggedIn(false);
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
          <section id="hero" className="relative w-full lg:min-h-[100dvh] pt-14 sm:pt-16 flex flex-col justify-between">
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
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={(team) => {
              // The registration page already swapped this browser to the new team's
              // server-issued session token before calling this.
              setIsAdminLoggedIn(false);
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
      {activeTab === 'dashboard' && currentTeam && (
        <TeamDashboardPage
          team={currentTeam}
          onLogout={handleLogout}
          onNavigate={handleSelectTab}
          onUpdateTeam={handleUpdateTeam}
        />
      )}
      {activeTab === 'dashboard' && !currentTeam && (
        <TeamLoginPage
          onLoginSuccess={handleLoginSuccess}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onNavigate={handleSelectTab}
          loggedInTeam={null}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
        />
      )}

      {/* Dedicated Page: Tournament Admin Control Panel (Google Sheets Data) */}
      {activeTab === 'admin' && !isAdminLoggedIn && (
        <TeamLoginPage
          onLoginSuccess={handleLoginSuccess}
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onNavigate={handleSelectTab}
          loggedInTeam={currentTeam}
          isAdminLoggedIn={false}
          onLogout={handleLogout}
        />
      )}
      {activeTab === 'admin' && isAdminLoggedIn && (
        <div className="xotc-page-scope">
          <AdminDashboardPage
            onLogout={handleLogout}
            onNavigate={handleSelectTab}
            isSuperAdmin={adminRole === 'super_admin'}
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
