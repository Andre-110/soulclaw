import { useState } from 'react';
import StarBackground from '@/components/feature/StarBackground';
import ForgeIntro from './components/ForgeIntro';
import StepUpload from './components/StepUpload';
import StepTags from './components/StepTags';
import StarCoreReport from './components/StarCoreReport';

type ForgeStep = 'intro' | 'upload' | 'tags' | 'report';

const STEPS = [
  { id: 'upload', label: '素材上传', icon: 'ri-upload-cloud-line' },
  { id: 'tags', label: '标签铸造', icon: 'ri-price-tag-3-line' },
  { id: 'report', label: '星核报告', icon: 'ri-file-chart-line' },
];

export default function ForgePage() {
  const [step, setStep] = useState<ForgeStep>('intro');

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#0F0F1E' }}>
      <StarBackground particleCount={50} showNebula />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-12 pb-24">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 flex items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D1FF)' }}
            >
              <i className="ri-star-fill text-white" style={{ fontSize: '13px' }} />
            </div>
            <span className="font-orbitron text-lg font-black" style={{ color: '#E0EFFF' }}>
              元识・星分身
            </span>
          </div>
          <p className="text-xs font-noto" style={{ color: 'rgba(0,209,255,0.75)' }}>
            让 AI 先替你遇见，对的人无需试探
          </p>
        </div>

        {/* Step indicator — glass pill */}
        {step !== 'report' && (
          <div
            className="flex items-center justify-center gap-2 mb-8 mx-auto px-6 py-3 rounded-2xl"
            style={{
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              width: 'fit-content',
            }}
          >
            {STEPS.slice(0, 2).map((s, i) => {
              const idx = STEPS.findIndex((x) => x.id === s.id);
              const isActive = idx === currentIdx;
              const isDone = idx < currentIdx;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300"
                      style={{
                        background:
                          isActive || isDone
                            ? 'linear-gradient(135deg, #6C5CE7, #00D1FF)'
                            : 'rgba(255,255,255,0.08)',
                        boxShadow: isActive ? '0 0 10px rgba(108,92,231,0.6)' : 'none',
                      }}
                    >
                      {isDone ? (
                        <i className="ri-check-line text-white" style={{ fontSize: '11px' }} />
                      ) : (
                        <span
                          className="text-xs font-orbitron font-bold"
                          style={{ color: isActive ? '#fff' : 'rgba(224,239,255,0.45)' }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-noto"
                      style={{ color: isActive ? '#00D1FF' : 'rgba(224,239,255,0.55)' }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div
                      className="w-10 h-px"
                      style={{
                        background: isDone
                          ? 'linear-gradient(90deg,#6C5CE7,#00D1FF)'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step content */}
        {step === 'upload' && <StepUpload onNext={() => setStep('tags')} />}

        {step === 'tags' && <StepTags onNext={() => setStep('report')} />}
        {step === 'report' && <StarCoreReport />}
      </div>

      {/* Intro overlay */}
      {step === 'intro' && <ForgeIntro onStart={() => setStep('upload')} />}
    </div>
  );
}
