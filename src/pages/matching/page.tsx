import { useState } from 'react';
import StarBackground from '@/components/feature/StarBackground';
import BottomTabBar from '@/components/feature/BottomTabBar';
import MatchList from './components/MatchList';
import ProxyChat from './components/ProxyChat';
import StarReport from './components/StarReport';
import StarUnlock from './components/StarUnlock';
import StarSearchLoading from './components/StarSearchLoading';
import { NEW_MATCHES } from '@/mocks/starData';

type MatchView = 'list' | 'chat' | 'report' | 'unlock' | 'searching';

export default function MatchingPage() {
  const [view, setView] = useState<MatchView>('list');
  const [activeMatchId, setActiveMatchId] = useState('STAR-7829-XK');
  const [activeChatMode, setActiveChatMode] = useState<'ai' | 'human'>('ai');
  const [hasSearched, setHasSearched] = useState(false);
  // Track whether the style preset has been shown for the first AI entry
  const [aiPresetShown, setAiPresetShown] = useState(false);

  const handleSearchComplete = () => {
    setHasSearched(true);
    setView('list');
  };

  const handleSelectMatch = (id: string, mode?: 'ai' | 'human') => {
    setActiveMatchId(id);
    const chatMode = mode || 'ai';
    setActiveChatMode(chatMode);
    setView('chat');
    // Mark preset as shown after first AI entry
    if (chatMode === 'ai' && !aiPresetShown) {
      setAiPresetShown(true);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#0F0F1E' }}>
      <StarBackground particleCount={35} />

      {view === 'searching' && (
        <StarSearchLoading onComplete={handleSearchComplete} />
      )}

      <div className="relative z-10">
        {view === 'list' && (
          <div className="pb-20 max-w-md mx-auto overflow-y-auto">
            <MatchList
              onSelect={handleSelectMatch}
              extraMatches={hasSearched ? NEW_MATCHES : []}
              onSearch={() => setView('searching')}
            />
          </div>
        )}

        {view === 'chat' && (
          <ProxyChat
            matchId={activeMatchId}
            initialMode={activeChatMode}
            isFirstAiEntry={activeChatMode === 'ai' && !aiPresetShown}
            onViewReport={() => setView('report')}
            onBack={() => setView('list')}
          />
        )}

        {view === 'report' && (
          <StarReport
            matchId={activeMatchId}
            onUnlock={() => setView('unlock')}
            onBack={() => setView('chat')}
          />
        )}

        {view === 'unlock' && (
          <StarUnlock
            matchId={activeMatchId}
            onBack={() => setView('report')}
          />
        )}
      </div>

      {view === 'list' && <BottomTabBar />}
    </div>
  );
}
