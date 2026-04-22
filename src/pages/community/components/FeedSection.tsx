import { useState, useRef, useCallback } from 'react';
import { CommunityPost, PostAnalysis, MOCK_MY_POSTS, MOCK_COMMUNITY_POSTS } from '@/mocks/starData';

type FeedSubTab = 'mine' | 'interact';

const AVATAR_CONFIG: Record<string, { color: string; icon: string }> = {
  nebula:        { color: '#6C5CE7', icon: 'ri-bubble-chart-fill' },
  constellation: { color: '#00D1FF', icon: 'ri-star-fill' },
  ring:          { color: '#A29BFE', icon: 'ri-record-circle-fill' },
  comet:         { color: '#74B9FF', icon: 'ri-flashlight-fill' },
  blackhole:     { color: '#8B7CF8', icon: 'ri-focus-3-fill' },
};

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  liked:     { label: '分身点赞', color: '#FF7675', bg: 'rgba(255,118,117,0.14)', border: 'rgba(255,118,117,0.32)', icon: 'ri-heart-fill' },
  commented: { label: '分身评论', color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',   border: 'rgba(0,209,255,0.28)',   icon: 'ri-chat-1-fill' },
  mine:      { label: '分身发布', color: '#A29BFE', bg: 'rgba(108,92,231,0.18)', border: 'rgba(108,92,231,0.38)', icon: 'ri-sparkling-line' },
};

const STRATEGY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  '深度引导': { color: '#C4BBFF', bg: 'rgba(108,92,231,0.18)', border: 'rgba(108,92,231,0.35)' },
  '价值输出': { color: '#00D1FF', bg: 'rgba(0,209,255,0.13)',  border: 'rgba(0,209,255,0.28)'  },
  '观点输出': { color: '#74B9FF', bg: 'rgba(116,185,255,0.13)',border: 'rgba(116,185,255,0.28)' },
  '精准破冰': { color: '#C4BBFF', bg: 'rgba(162,155,254,0.15)',border: 'rgba(162,155,254,0.32)' },
  '经验分享': { color: '#00CEC9', bg: 'rgba(0,206,201,0.13)', border: 'rgba(0,206,201,0.28)'  },
  '暖心贴士': { color: '#FDCB6E', bg: 'rgba(253,203,110,0.13)',border: 'rgba(253,203,110,0.28)' },
  '哲学共鸣': { color: '#C4BBFF', bg: 'rgba(108,92,231,0.18)', border: 'rgba(108,92,231,0.35)' },
  '兴趣信号': { color: '#FF8F8E', bg: 'rgba(255,118,117,0.14)',border: 'rgba(255,118,117,0.3)'  },
  '品味联结': { color: '#74B9FF', bg: 'rgba(116,185,255,0.13)',border: 'rgba(116,185,255,0.28)' },
  '三观共振': { color: '#00CEC9', bg: 'rgba(0,206,201,0.13)', border: 'rgba(0,206,201,0.28)'  },
  '人格展示': { color: '#A29BFE', bg: 'rgba(108,92,231,0.18)', border: 'rgba(108,92,231,0.35)' },
  '话题引爆': { color: '#FDCB6E', bg: 'rgba(253,203,110,0.13)',border: 'rgba(253,203,110,0.28)' },
  '品味输出': { color: '#74B9FF', bg: 'rgba(116,185,255,0.13)',border: 'rgba(116,185,255,0.28)' },
};

interface FloatingHeart { id: number; x: number; y: number }

// ─── Analysis Card ────────────────────────────────────────────────────────────
function AnalysisCard({ analysis, visible }: { analysis: PostAnalysis; visible: boolean }) {
  const actionCfg = ACTION_CONFIG[analysis.actionType];
  const stratStyle = STRATEGY_STYLES[analysis.strategyTag] || STRATEGY_STYLES['深度引导'];

  return (
    <div style={{ maxHeight: visible ? '320px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
      <div
        className="mt-2.5 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(20,18,45,0.85),rgba(15,15,30,0.75))',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: `1px solid ${actionCfg.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ borderBottom: `1px solid ${actionCfg.border}`, background: actionCfg.bg }}
        >
          <i className={`${actionCfg.icon} text-xs`} style={{ color: actionCfg.color }} />
          <span className="font-noto text-xs font-bold" style={{ color: actionCfg.color }}>
            分身决策解析
          </span>
          <div
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: stratStyle.bg, border: `1px solid ${stratStyle.border}` }}
          >
            <i className="ri-sparkling-line" style={{ color: stratStyle.color, fontSize: '9px' }} />
            <span className="font-noto font-semibold" style={{ color: stratStyle.color, fontSize: '9px' }}>
              {analysis.strategyTag}
            </span>
          </div>
        </div>

        <div className="px-3.5 py-3 flex flex-col gap-3">
          {/* Reason */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <i className="ri-lightbulb-flash-line" style={{ color: '#FDCB6E', fontSize: '12px' }} />
              <span className="font-noto font-bold text-secondary" style={{ fontSize: '11px' }}>判断依据</span>
            </div>
            <p className="font-noto text-xs leading-relaxed pl-5 text-secondary">
              {analysis.reason}
            </p>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

          {/* Benefit */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <i className="ri-heart-pulse-line" style={{ color: '#00D1FF', fontSize: '12px' }} />
              <span className="font-noto font-bold text-secondary" style={{ fontSize: '11px' }}>对你的帮助</span>
            </div>
            <p className="font-noto text-xs leading-relaxed pl-5 text-secondary">
              {analysis.benefit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({
  post, liked, commentsExpanded, analysisExpanded,
  onLike, onToggleComments, onToggleAnalysis,
}: {
  post: CommunityPost;
  liked: boolean;
  commentsExpanded: boolean;
  analysisExpanded: boolean;
  onLike: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleComments: () => void;
  onToggleAnalysis: () => void;
}) {
  const isMine = post.myAction?.actionType === 'mine';
  const avatarCfg = AVATAR_CONFIG[post.avatarType] || AVATAR_CONFIG.constellation;
  const actionCfg = post.myAction ? ACTION_CONFIG[post.myAction.actionType] : null;

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={
        isMine
          ? {
              background: 'linear-gradient(155deg,rgba(108,92,231,0.22) 0%,rgba(20,18,48,0.82) 60%,rgba(0,209,255,0.08) 100%)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: '1px solid rgba(108,92,231,0.35)',
            }
          : {
              background: 'linear-gradient(135deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.07) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.13)',
            }
      }
    >
      <div className="p-4">
        {/* Action badge row */}
        {actionCfg && (
          <div className="flex items-center gap-2 mb-3.5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: actionCfg.bg, border: `1px solid ${actionCfg.border}` }}
            >
              <i className={`${actionCfg.icon}`} style={{ color: actionCfg.color, fontSize: '10px' }} />
              <span className="font-noto font-semibold" style={{ color: actionCfg.color, fontSize: '10px' }}>
                {actionCfg.label}
              </span>
            </div>
            <button
              onClick={onToggleAnalysis}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={{
                background: analysisExpanded ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${analysisExpanded ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}`,
                color: analysisExpanded ? '#E0EFFF' : 'rgba(224,239,255,0.65)',
              }}
            >
              <i className={analysisExpanded ? 'ri-information-fill' : 'ri-information-line'} style={{ fontSize: '10px' }} />
              <span className="font-noto font-medium" style={{ fontSize: '10px' }}>
                {analysisExpanded ? '收起解析' : '查看依据'}
              </span>
            </button>
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: isMine
                ? 'linear-gradient(135deg,rgba(108,92,231,0.35),rgba(108,92,231,0.18))'
                : `linear-gradient(135deg,${avatarCfg.color}28,${avatarCfg.color}14)`,
              border: `1.5px solid ${isMine ? 'rgba(108,92,231,0.6)' : avatarCfg.color + '55'}`,
              boxShadow: isMine ? '0 0 12px rgba(108,92,231,0.25)' : 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <i className={`${avatarCfg.icon} text-base`} style={{ color: isMine ? '#A29BFE' : avatarCfg.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-orbitron text-xs font-bold" style={{ color: isMine ? '#C4BBFF' : '#E0EFFF' }}>
                {post.starId}
              </p>
              {isMine && (
                <span
                  className="px-1.5 py-0.5 rounded-full font-noto font-semibold"
                  style={{ background: 'rgba(108,92,231,0.25)', color: '#C4BBFF', fontSize: '9px', border: '1px solid rgba(108,92,231,0.4)' }}
                >
                  我的分身
                </span>
              )}
            </div>
            <p className="text-xs font-noto text-muted" style={{ fontSize: '10px' }}>
              {post.time}
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm font-noto leading-relaxed mb-3 text-secondary">
          {post.content}
        </p>

        {/* Tags */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full font-noto font-medium"
              style={{
                background: isMine ? 'rgba(108,92,231,0.22)' : 'rgba(108,92,231,0.14)',
                color: isMine ? '#C4BBFF' : '#A29BFE',
                fontSize: '10px',
                border: `1px solid ${isMine ? 'rgba(108,92,231,0.38)' : 'rgba(108,92,231,0.22)'}`,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Analysis */}
        {post.myAction && <AnalysisCard analysis={post.myAction} visible={analysisExpanded} />}

        {/* Actions bar */}
        <div
          className="flex items-center gap-4 pt-3 mt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}
        >
          <button
            onClick={onLike}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-90"
            style={{ color: liked ? '#FF7675' : 'rgba(224,239,255,0.6)' }}
          >
            <i
              className={liked ? 'ri-heart-fill' : 'ri-heart-line'}
              style={{ fontSize: '15px', transition: 'transform 0.15s cubic-bezier(.34,1.6,.64,1)', transform: liked ? 'scale(1.28)' : 'scale(1)', display: 'inline-block' }}
            />
            <span className="text-xs font-noto font-medium">{post.likes + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={onToggleComments}
            className="flex items-center gap-1.5 cursor-pointer transition-all duration-150"
            style={{ color: commentsExpanded ? '#00D1FF' : 'rgba(224,239,255,0.6)' }}
          >
            <i className={commentsExpanded ? 'ri-chat-1-fill' : 'ri-chat-1-line'} style={{ fontSize: '15px' }} />
            <span className="text-xs font-noto font-medium">{post.comments}</span>
          </button>

          <button className="flex items-center gap-1.5 cursor-pointer ml-auto" style={{ color: 'rgba(224,239,255,0.45)' }}>
            <i className="ri-share-line" style={{ fontSize: '14px' }} />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div style={{ maxHeight: commentsExpanded ? '700px' : '0px', overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.09)' }}>
          <div className="px-4 pt-3 pb-3 flex flex-col gap-3">
            {post.commentList.map((comment) => {
              const cCfg = AVATAR_CONFIG[comment.avatarType] || AVATAR_CONFIG.constellation;
              const isMyComment = comment.isMine === true;
              return (
                <div
                  key={comment.id}
                  className="flex items-start gap-2.5 rounded-2xl p-2.5"
                  style={
                    isMyComment
                      ? {
                          background: 'linear-gradient(135deg,rgba(108,92,231,0.2),rgba(108,92,231,0.1))',
                          border: '1px solid rgba(108,92,231,0.3)',
                          backdropFilter: 'blur(8px)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }
                  }
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={
                      isMyComment
                        ? { background: 'rgba(108,92,231,0.28)', border: '1px solid rgba(108,92,231,0.5)', boxShadow: '0 0 8px rgba(108,92,231,0.22)' }
                        : { background: `${cCfg.color}1C`, border: `1px solid ${cCfg.color}38` }
                    }
                  >
                    <i className={`${cCfg.icon} text-xs`} style={{ color: isMyComment ? '#A29BFE' : cCfg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-orbitron text-xs font-bold" style={{ color: isMyComment ? '#C4BBFF' : 'rgba(224,239,255,0.8)', fontSize: '10px' }}>
                        {comment.starId}
                      </span>
                      {isMyComment && (
                        <span className="px-1.5 py-0.5 rounded-full font-noto font-semibold" style={{ background: 'rgba(108,92,231,0.28)', color: '#C4BBFF', fontSize: '8px', border: '1px solid rgba(108,92,231,0.4)' }}>
                          我的分身
                        </span>
                      )}
                      <span className="font-noto ml-auto text-muted" style={{ fontSize: '9px' }}>{comment.time}</span>
                    </div>
                    <p className="text-xs font-noto leading-relaxed" style={{ color: isMyComment ? '#E0EFFF' : 'rgba(224,239,255,0.8)' }}>
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Input bar */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              >
                <i className="ri-robot-line text-xs" style={{ color: 'rgba(224,239,255,0.45)' }} />
                <span className="text-xs font-noto text-muted">分身代你说…</span>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer whitespace-nowrap"
                style={{ background: 'rgba(0,209,255,0.18)', border: '1px solid rgba(0,209,255,0.32)', color: '#00D1FF' }}
              >
                <i className="ri-send-plane-fill text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FeedSection() {
  const [subTab, setSubTab] = useState<FeedSubTab>('interact');
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [expandedAnalysis, setExpandedAnalysis] = useState<number[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const heartIdRef = useRef(0);

  const triggerHearts = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const newHearts: FloatingHeart[] = Array.from({ length: 6 }, (_, i) => ({ id: heartIdRef.current + i, x: cx, y: cy }));
    heartIdRef.current += 6;
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => { setFloatingHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id))); }, 900);
  }, []);

  const toggleLike = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const wasLiked = likedPosts.includes(id);
    setLikedPosts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
    if (!wasLiked) triggerHearts(e);
  };
  const toggleComments = (id: number) => setExpandedComments((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  const toggleAnalysis = (id: number) => setExpandedAnalysis((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  const posts = subTab === 'mine' ? MOCK_MY_POSTS : MOCK_COMMUNITY_POSTS;

  return (
    <>
      {/* Floating hearts */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingHearts.map((heart, idx) => {
          const angle = (idx % 6) * 60 - 150;
          const rad = (angle * Math.PI) / 180;
          const tx = Math.cos(rad) * (28 + Math.random() * 18);
          const ty = -55 - Math.random() * 25;
          return (
            <span key={heart.id} className="absolute text-sm font-bold select-none"
              style={{ left: heart.x, top: heart.y, color: idx % 3 === 0 ? '#FF7675' : idx % 3 === 1 ? '#FF85A1' : '#FF5D73', animation: 'floatHeart 0.85s ease-out forwards', '--tx': `${tx}px`, '--ty': `${ty}px` } as React.CSSProperties}>
              ♥
            </span>
          );
        })}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Sub-tab */}
        <div className="flex p-1 rounded-2xl glass-tab">
          {([
            { id: 'interact', label: '分身互动', icon: 'ri-robot-line',         count: MOCK_COMMUNITY_POSTS.length },
            { id: 'mine',     label: '我的动态', icon: 'ri-bubble-chart-fill',   count: MOCK_MY_POSTS.length },
          ] as { id: FeedSubTab; label: string; icon: string; count: number }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl cursor-pointer transition-all duration-200 whitespace-nowrap"
              style={
                subTab === t.id
                  ? { background: 'linear-gradient(135deg,rgba(108,92,231,0.38),rgba(0,209,255,0.2))', border: '1px solid rgba(0,209,255,0.3)', color: '#00D1FF' }
                  : { background: 'transparent', border: '1px solid transparent', color: 'rgba(224,239,255,0.6)' }
              }
            >
              <i className={`${t.icon} text-xs`} />
              <span className="text-xs font-noto font-medium">{t.label}</span>
              <span
                className="font-noto rounded-full px-1.5 font-medium"
                style={{ background: subTab === t.id ? 'rgba(0,209,255,0.18)' : 'rgba(255,255,255,0.08)', color: subTab === t.id ? '#00D1FF' : 'rgba(224,239,255,0.5)', fontSize: '9px' }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Hint */}
        <div
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg,rgba(108,92,231,0.15),rgba(0,209,255,0.06))',
            border: '1px solid rgba(108,92,231,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <i className="ri-robot-line text-sm mt-0.5 shrink-0" style={{ color: '#A29BFE' }} />
          <p className="font-noto leading-relaxed text-secondary" style={{ fontSize: '11px' }}>
            {subTab === 'interact'
              ? '这些是其他分身的动态，你的分身已自动点赞或评论。点击「查看依据」了解分身为什么对这条动态感兴趣。'
              : '这些是你的分身主动发布的动态，点击「查看依据」了解分身基于你的哪些特质选择发这条内容。'}
          </p>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedPosts.includes(post.id)}
            commentsExpanded={expandedComments.includes(post.id)}
            analysisExpanded={expandedAnalysis.includes(post.id)}
            onLike={(e) => toggleLike(post.id, e)}
            onToggleComments={() => toggleComments(post.id)}
            onToggleAnalysis={() => toggleAnalysis(post.id)}
          />
        ))}
      </div>
    </>
  );
}
