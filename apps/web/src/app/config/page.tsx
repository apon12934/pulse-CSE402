'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button, StatusChip } from '@pulse/ui';
import { Save, Clipboard, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function ConfigPage() {
  const { user } = useAuthStore();
  const [apiKey, setApiKey] = useState('');
  const [strategy, setStrategy] = useState('Maximum Flow');
  
  useEffect(() => {
    // Mock hydrate from localStorage
    const savedKey = localStorage.getItem('pulse_gemini_api_key') || '';
    const savedStrategy = localStorage.getItem('pulse_reschedule_strategy') || 'Maximum Flow';
    setApiKey(savedKey);
    setStrategy(savedStrategy);
  }, []);

  const handleSave = () => {
    localStorage.setItem('pulse_gemini_api_key', apiKey);
    localStorage.setItem('pulse_reschedule_strategy', strategy);
    alert('Configurations saved locally.');
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-5xl">
      <div>
        <h1 className="text-[36px] font-semibold text-white font-sans leading-tight">
          System Configuration
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#888] mt-2">
          USER & ENVIRONMENT SETTINGS / ACCESS LEVEL: ADMINISTRATOR
        </p>
        <div className="h-px w-full bg-[#FFFF00] mt-4" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="bg-[#121212] border-[#262626] rounded-none p-6 relative">
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-sm uppercase text-white tracking-widest">IDENTITY.SYS</span>
              <Clipboard className="w-4 h-4 text-[#888] hover:text-white cursor-pointer" />
            </div>

            <div className="flex gap-6">
              <div className="w-[120px] h-[120px] bg-[#1A1A1A] border border-[#262626] relative shrink-0">
                <div className="absolute bottom-1 right-1 border border-[#FFFF00] bg-black p-1">
                  <div className="w-2 h-2 bg-[#FFFF00]" />
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase text-[#666] mb-1">USER_NAME</div>
                  <div className="font-sans text-[24px] text-white font-semibold leading-none">{user?.name || 'Alamin Islam Apon'}</div>
                </div>
                
                <div>
                  <div className="font-mono text-[10px] uppercase text-[#666] mb-1">DESIGNATION</div>
                  <div className="font-sans text-[16px] text-[#CCC] leading-none">Head Developer / Designer</div>
                </div>
                
                <div className="mt-2">
                  <StatusChip status="completed" />
                  <span className="ml-2 font-mono text-[10px] text-[#FFFF00] uppercase border border-[#FFFF00]/30 px-2 py-0.5">
                    {user?.tier || 'FREE_TIER'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-6">
          <Card className="bg-[#121212] border-[#262626] rounded-none p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#FFFF00]" />
              <span className="font-mono text-sm uppercase text-white tracking-widest">INTEGRATION_PARAMS</span>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase text-[#888] mb-2">GEMINI API KEY</div>
                <Input 
                  type="password" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..." 
                  className="font-mono"
                />
                <div className="font-mono text-[11px] text-[#666] mt-2">Required for core LLM processing. Treat as sensitive.</div>
              </div>

              <div className="h-px w-full bg-[#262626]" />

              <div>
                <div className="font-mono text-[10px] uppercase text-[#888] mb-2">AUTO-RESCHEDULE STRATEGY</div>
                <div className="border border-[#262626] bg-[#1A1A1A] p-3 font-mono text-sm text-white flex justify-between cursor-pointer hover:border-[#FFFF00]">
                  {strategy}
                  <span className="text-[#666]">▼</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#121212] border-[#262626] rounded-none p-6">
            <span className="font-mono text-sm uppercase text-white tracking-widest mb-6 block">SYNC_PROTOCOLS</span>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-white text-base">Google Calendar Sync</span>
                <span className="text-sm text-[#888]">Push/Pull events automatically every 5 mins.</span>
              </div>
              
              <div className="h-px w-full bg-[#262626]" />

              <div className="flex flex-col">
                <span className="text-white text-base">Plutio Integration</span>
                <span className="text-sm text-[#888]">Allow anonymous usage data for model training.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="primary" size="lg" className="px-12 py-4" onClick={handleSave}>
          <Save className="w-5 h-5 mr-2" />
          SAVE CONFIGURATIONS
        </Button>
      </div>
    </div>
  );
}
