import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderLock, 
  RotateCw, 
  RefreshCw, 
  Play, 
  Timer, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Unlock, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';

// =========================================================================
// CSS & EMBEDDED FONTS INJECTION
// This ensures Orbitron, Architects Daughter, and Share Tech Mono are loaded
// instantly and cleanly inside the app's sandboxed iframe environment.
// =========================================================================
const STYLE_INJECTION = `
  @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');
  
  .font-handwritten {
    font-family: 'Architects Daughter', cursive;
  }
  .font-hud {
    font-family: 'Share Tech Mono', monospace;
  }
  .font-digital {
    font-family: 'Orbitron', sans-serif;
  }
  
  /* CSI Grid scanlines & digital noise styling */
  .scanlines {
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, 0.25) 50%
    );
    background-size: 100% 4px;
  }

  /* Custom glow classes */
  .glow-cyan {
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  }
  
  .glow-green {
    box-shadow: 0 0 15px rgba(0, 255, 102, 0.2);
    text-shadow: 0 0 8px rgba(0, 255, 102, 0.5);
  }

  #desk_layout {
    background-color: #151821;
  }

  #workspace_viewport {
    background-color: #060f14;
    background-image: 
      linear-gradient(rgba(0, 240, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 240, 255, 0.035) 1px, transparent 1px);
    background-size: 30px 30px;
    background-position: center;
  }

  #drawer_grid_tray {
    background-color: #0d111e !important;
  }

  #drawer_grid_tray > div > div {
    background-color: #0a0b11 !important;
  }
`;

// ==========================================
// HIGH-TECH FORENSIC AUDIO CLIENT-SYNTH
// ==========================================
class ForensicSoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playRotate() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playSnap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(700, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.18);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.22);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.22);
      osc2.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }

  playHint() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.005, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [293.66, 349.23, 440.00, 587.33, 698.46, 880.00, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx!.currentTime + idx * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.09);
        osc.stop(this.ctx!.currentTime + idx * 0.09 + 0.45);
      });
    } catch (e) {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }
}

const sounds = new ForensicSoundEffects();

// ==========================================
// CASE DATA DEFINITION (Strictly Caso #0047)
// ==========================================
interface Fragment {
  id: string; // F-01 to F-12
  startX: number; // Top-left corner inside the original 720 x 840 grid
  startY: number; // Top-left corner inside the original 720 x 840 grid
  width: number;
  height: number;
  polygon: string; // Hyper-detailed jagged boundaries to represent real torn edges
  targetX?: number; // Target coordinate used by snap & validation
  targetY?: number; // Target coordinate used by snap & validation
  targetRotation?: number; // Target rotation angle (usually 0 degrees)
  snapTolerance?: number; // Distance in pixels to snap
}

interface EvidenceCase {
  id: string;
  name: string;
  code: string;
  evidence: string;
  difficulty: string;
  timeLimit: number;
  description: string;
  unlockedClue: string;
  fragments: Fragment[];
  folder?: string;
  usePreCutFragments?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

const CASO_0047_EVIDENCE: EvidenceCase = {
  id: "case_01",
  name: "Bilhete Secreto: Galpão 17",
  code: "CASO #0047",
  evidence: "BILHETE REUNIAO",
  difficulty: "MÉDIO",
  timeLimit: 300, // 5 minutes (05:00)
  description: "Bilhete rasgado em 12 pedaços encontrado no escritório do suspeito principal. Detalha o local, horário e diretrizes da atividade suspecta.",
  unlockedClue: "REUNIÃO CONFIRMADA NO GALPÃO 17 EM 14/05 ÀS 22:30. ORDEM EXPRESSA: 'NÃO ENVOLVER A POLÍCIA'. HORÁRIO LIMITE COMPROMETEDOR: 23:00.",
  fragments: [
    { id: "F-01", startX: 5, startY: 7, width: 184, height: 265, polygon: "0% 0%, 100% 0%, 93% 15%, 97% 35%, 88% 50%, 92% 70%, 82% 85%, 60% 90%, 42% 100%, 20% 92%, 0% 100%" },
    { id: "F-02", startX: 128, startY: 4, width: 335, height: 207, polygon: "15% 0%, 100% 0%, 95% 20%, 98% 55%, 85% 75%, 68% 100%, 48% 92%, 32% 100%, 12% 90%, 0% 50%, 8% 25%" },
    { id: "F-03", startX: 413, startY: 7, width: 286, height: 109, polygon: "25% 0%, 100% 0%, 100% 100%, 80% 88%, 62% 95%, 45% 82%, 28% 90%, 12% 75%, 0% 25%" },
    { id: "F-04", startX: 12, startY: 224, width: 277, height: 342, polygon: "0% 15%, 82% 0%, 92% 20%, 100% 45%, 94% 65%, 98% 85%, 72% 95%, 50% 88%, 28% 100%, 0% 90%" },
    { id: "F-05", startX: 200, startY: 125, width: 423, height: 273, polygon: "20% 15%, 85% 5%, 95% 30%, 100% 65%, 88% 85%, 72% 100%, 55% 90%, 35% 98%, 15% 82%, 0% 50%" },
    { id: "F-06", startX: 475, startY: 39, width: 227, height: 307, polygon: "12% 0%, 100% 0%, 100% 100%, 82% 92%, 60% 100%, 38% 85%, 20% 95%, 0% 50%, 8% 20%" },
    { id: "F-07", startX: 10, startY: 407, width: 375, height: 426, polygon: "15% 15%, 88% 0%, 98% 30%, 94% 55%, 100% 80%, 82% 95%, 60% 100%, 35% 92%, 0% 100%" },
    { id: "F-08", startX: 303, startY: 356, width: 333, height: 277, polygon: "5% 20%, 85% 0%, 98% 30%, 92% 65%, 100% 85%, 78% 100%, 55% 92%, 30% 100%, 12% 88%, 0% 55%" },
    { id: "F-09", startX: 602, startY: 344, width: 115, height: 233, polygon: "5% 0%, 100% 12%, 100% 92%, 82% 85%, 60% 100%, 38% 88%, 15% 95%, 0% 50%" },
    { id: "F-10", startX: 38, startY: 640, width: 420, height: 193, polygon: "0% 20%, 92% 0%, 98% 45%, 92% 75%, 100% 100%, 65% 92%, 35% 100%, 0% 90%" },
    { id: "F-11", startX: 385, startY: 588, width: 333, height: 241, polygon: "5% 15%, 88% 0%, 100% 40%, 94% 75%, 98% 100%, 70% 92%, 40% 100%, 12% 90%, 0% 50%" },
    { id: "F-12", startX: 615, startY: 553, width: 105, height: 213, polygon: "5% 0%, 100% 0%, 100% 100%, 75% 92%, 50% 100%, 25% 88%, 0% 45%" }
  ]
};

// Initialize auditing fields on evidence data for puzzle validation tasks
CASO_0047_EVIDENCE.fragments.forEach(f => {
  f.targetX = f.startX;
  f.targetY = f.startY;
  f.targetRotation = 0;
  f.snapTolerance = 30; // base tolerance
});

// ==========================================
// DETAILED ORIGINAL DOCUMENT CANVAS
// Layered paper, grunge stains and custom SVG overlays
// ==========================================
const DocumentContent = () => {
  return (
    <div 
      className="relative w-[720px] h-[840px] bg-[#dcb88f] border border-amber-900/30 overflow-hidden select-none" 
      style={{ backgroundImage: 'radial-gradient(ellipse at center, #eed3ad 0%, #ca9662 100%)' }}
    >
      
      {/* 1. Crumpled Shading & Crease lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none mix-blend-overlay" 
        style={{
          backgroundImage: `
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(135deg, #fff 25%, transparent 25%),
            linear-gradient(-135deg, #fff 25%, transparent 25%)
          `,
          backgroundSize: '100px 100px'
        }} 
      />
      
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.24]" 
        style={{
          backgroundImage: `
            linear-gradient(115deg, transparent 40%, rgba(0,0,0,0.18) 45%, rgba(255,255,255,0.22) 48%, transparent 52%),
            linear-gradient(25deg, transparent 42%, rgba(0,0,0,0.14) 47%, rgba(255,255,255,0.2) 50%, transparent 54%),
            linear-gradient(195deg, transparent 33%, rgba(0,0,0,0.16) 38%, rgba(255,255,255,0.24) 41%, transparent 45%)
          `
        }} 
      />

      {/* 2. Lined notebook paper design (32px baseline gap) */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to bottom, #103254 1px, transparent 1px)',
          backgroundSize: '100px 32px',
          backgroundPosition: '0 80px'
        }} 
      />

      {/* 3. Margem vertical vermelha do caderno militar */}
      <div className="absolute top-0 bottom-0 left-[120px] w-[1.5px] bg-red-500 opacity-60 pointer-events-none" />

      {/* 4. Marcas de Xícara de Café (Coffee rings) */}
      <div 
        className="absolute bottom-[40px] left-[30px] w-[260px] h-[260px] rounded-full border-[3px] border-[#5a381b] opacity-[0.32] blur-[0.8px] pointer-events-none mix-blend-multiply" 
        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)' }} 
      />
      <div className="absolute bottom-[35px] left-[35px] w-[250px] h-[250px] rounded-full border-[1.5px] border-[#5a381b] opacity-[0.24] blur-[0.5px] pointer-events-none mix-blend-multiply" />
      
      {/* 5. Gotejamentos de Café & Manchas de Sangue Antigo */}
      <div className="absolute top-[80px] right-[100px] w-[80px] h-[60px] rounded-full bg-[#5a381b] opacity-[0.16] blur-[2px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[120px] right-[140px] w-[30px] h-[35px] rounded-full bg-[#5a381b] opacity-[0.18] blur-[1px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[320px] left-[400px] w-[45px] h-[40px] rounded-full bg-[#5a381b] opacity-[0.12] blur-[1.5px] pointer-events-none mix-blend-multiply" />

      {/* 6. Silhueta de Impressão Digital / Mão Suja de Graxa */}
      <svg className="absolute bottom-[40px] right-[30px] w-[310px] h-[370px] opacity-[0.52] mix-blend-multiply pointer-events-none text-[#2d2218]" viewBox="0 0 100 120" fill="currentColor">
        {/* Thumb */}
        <path d="M 12 78 C 8 70, 4 58, 12 52 C 18 48, 22 58, 24 72 Z" />
        {/* Index finger */}
        <path d="M 28 65 C 22 45, 18 20, 26 15 C 34 10, 38 35, 36 60 Z" />
        {/* Middle finger */}
        <path d="M 45 68 C 42 40, 40 10, 49 8 C 58 6, 56 32, 53 62 Z" />
        {/* Ring finger */}
        <path d="M 62 72 C 62 48, 64 18, 72 18 C 80 18, 76 44, 71 68 Z" />
        {/* Little finger */}
        <path d="M 76 78 C 82 58, 90 32, 96 36 C 102 40, 92 64, 85 78 Z" />
        {/* Palm base */}
        <ellipse cx="50" cy="90" rx="36" ry="24" />
        <ellipse cx="40" cy="80" rx="20" ry="16" />
      </svg>

      {/* 7. Data escrita à caneta preta */}
      <div className="absolute top-[35px] right-[60px] font-handwritten text-[#211b15] text-[28px] font-bold opacity-85 select-none leading-none -rotate-6">
        14/05
      </div>

      {/* 8. Textos manuscritos (Idênticos ao bilhete original) */}
      <div className="absolute top-[100px] left-[140px] flex flex-col space-y-[22px] font-handwritten text-[#1c1814] select-none text-[22px] tracking-wide leading-none">
        
        <div className="font-bold text-[28px] text-[#0f1118] pb-1">
          Reunião - 22:30
        </div>
        
        <div className="flex items-center">
          → entrega confirmada
        </div>
        
        <div>
          → local: <span className="border-b-[3px] border-double border-[#0f1118] font-black tracking-widest text-[#0e1d2e] uppercase">Galpão 17</span>
        </div>
        
        <div>
          → entrada: portão norte
        </div>
        
        <div>
          → levar o material embalado
        </div>
        
        <div>
          → ninguém fora do grupo
        </div>
        
        <div className="text-[#a11a1a] font-bold">
          → <span className="border-b-[2px] border-red-800 pb-0.5">NÃO ENVOLVER A POLÍCIA</span>
        </div>
        
        <div>
          → horário limite: <span className="border-b-2 border-[#1c1814] font-semibold">23:00</span>
        </div>

      </div>

    </div>
  );
};

// ===================================
// CUSTOM DYNAMIC DOCUMENT CONTENT / IMAGES FOR CASE EXTENSION
// ===================================
const RenderDocumentWhole = ({ 
  folder, 
  width = 720, 
  height = 840 
}: { 
  folder?: string; 
  width?: number; 
  height?: number; 
}) => {
  const [imgUrl, setImgUrl] = useState<string>("");

  useEffect(() => {
    if (!folder) {
      setImgUrl("");
      return;
    }

    const paths = [
      `/cases/${folder}/Documento_Original.png`,
      `/cases/${folder}/documento_original.png`,
      `/cases/${folder}/documento_img_montado.png`,
      `/cases/${folder}/References/Color_map.png`,
      `/cases/${folder}/References/Black_Map.png`,
      `/cases/${folder}/References/coordenadas+e-legenda.png`
    ];

    let currentIdx = 0;
    let isActive = true;

    const testImage = () => {
      if (!isActive) return;
      if (currentIdx >= paths.length) {
        setImgUrl("");
        return;
      }
      const path = paths[currentIdx];
      const img = new Image();
      img.onload = () => {
        if (isActive) setImgUrl(path);
      };
      img.onerror = () => {
        currentIdx++;
        testImage();
      };
      img.src = path;
    };

    testImage();

    return () => {
      isActive = false;
    };
  }, [folder]);

  if (folder) {
    if (imgUrl) {
      return (
        <div 
          className="relative select-none pointer-events-none"
          style={{
            backgroundImage: `url(${imgUrl})`,
            width: `${width}px`,
            height: `${height}px`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      );
    } else {
      // Modern digital grid reference blueprint instead of legacy notebook paper with handwriting
      return (
        <div 
          className="relative select-none pointer-events-none flex flex-col items-center justify-center border border-[#00f0ff]/20 bg-black/60"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundImage: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.05) 0%, transparent 80%), linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 20px 20px, 20px 20px'
          }}
        >
          <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest animate-pulse">
            Carregando Imagem Base...
          </span>
        </div>
      );
    }
  }

  return <DocumentContent />;
};

const PieceGraphic = ({ 
  folder, 
  fragmentId, 
  usePreCut, 
  startX, 
  startY, 
  width, 
  height, 
  scale = 0.75,
  canvasWidth = 720,
  canvasHeight = 840
}: { 
  folder?: string; 
  fragmentId: string; 
  usePreCut?: boolean; 
  startX: number; 
  startY: number; 
  width: number; 
  height: number; 
  scale?: number;
  canvasWidth?: number;
  canvasHeight?: number;
}) => {
  const [preCutSrc, setPreCutSrc] = useState<string | null>(null);
  const [wholeDocSrc, setWholeDocSrc] = useState<string | null>(null);
  const [failedPreCut, setFailedPreCut] = useState<boolean>(false);

  const numId = fragmentId.replace("F-", "");
  const paddedId = numId.padStart(2, "0");
  const rawNumStr = String(parseInt(numId, 10));

  useEffect(() => {
    if (!folder) return;

    let isActive = true;

    const docPaths = [
      `/cases/${folder}/Documento_Original.png`,
      `/cases/${folder}/documento_original.png`,
      `/cases/${folder}/documento_img_montado.png`,
      `/cases/${folder}/References/Color_map.png`,
      `/cases/${folder}/References/Black_Map.png`
    ];
    let docIdx = 0;
    const testDoc = () => {
      if (!isActive) return;
      if (docIdx >= docPaths.length) {
        setWholeDocSrc(null);
        return;
      }
      const path = docPaths[docIdx];
      const img = new Image();
      img.onload = () => {
        if (isActive) setWholeDocSrc(path);
      };
      img.onerror = () => {
        docIdx++;
        testDoc();
      };
      img.src = path;
    };
    testDoc();

    if (usePreCut) {
      const candidatePaths = [
        `/cases/${folder}/Fragment/fragment_${paddedId}.png`,
        `/cases/${folder}/Fragments/fragment-${paddedId}.png`,
        `/cases/${folder}/Fragment/fragment_${rawNumStr}.png`,
        `/cases/${folder}/Fragments/fragment-${rawNumStr}.png`,
        `/cases/${folder}/Fragments/fragment_${paddedId}.png`,
        `/cases/${folder}/Fragment/fragment-${paddedId}.png`,
        `/cases/${folder}/Fragments/fragment_${rawNumStr}.png`,
        `/cases/${folder}/Fragment/fragment-${rawNumStr}.png`
      ];

      let idx = 0;
      const testCandidates = () => {
        if (!isActive) return;
        if (idx >= candidatePaths.length) {
          setFailedPreCut(true);
          return;
        }
        const path = candidatePaths[idx];
        const img = new Image();
        img.onload = () => {
          if (isActive) {
            setPreCutSrc(path);
            setFailedPreCut(false);
          }
        };
        img.onerror = () => {
          idx++;
          testCandidates();
        };
        img.src = path;
      };
      testCandidates();
    }

    return () => {
      isActive = false;
    };
  }, [folder, usePreCut, paddedId, rawNumStr]);

  if (folder && usePreCut && preCutSrc && !failedPreCut) {
    return (
      <img 
        src={preCutSrc} 
        alt={fragmentId}
        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
        referrerPolicy="no-referrer"
        className="pointer-events-none select-none"
      />
    );
  }

  // Pre-cut fallback prevents full-page military background on raw fragments
  if (usePreCut) {
    return (
      <div className="w-full h-full bg-transparent border-0 outline-none" />
    );
  }

  return (
    <div 
      style={{
        position: 'relative',
        left: `-${startX * scale}px`,
        top: `-${startY * scale}px`,
        width: `${canvasWidth * scale}px`,
        height: `${canvasHeight * scale}px`
      }}
    >
      <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
        {folder ? (
          wholeDocSrc ? (
            <div 
              className="select-none pointer-events-none"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: `url(${wholeDocSrc})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
          ) : (
            <div className="w-full h-full bg-transparent" />
          )
        ) : (
          <DocumentContent />
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // Default: Medium (5 min)
  const [difficultySetting, setDifficultySetting] = useState<string>("MEDIO - 5 min");
  const [mute, setMute] = useState<boolean>(false);

  // Dynamic Case Extension States
  const [currentCase, setCurrentCase] = useState<EvidenceCase | null>(null);
  const [searchFolder, setSearchFolder] = useState<string>("Caso_Narcoticos_01");
  const [caseLoadError, setCaseLoadError] = useState<string | null>(null);

  const loadCustomCaseFromFolder = async (folder: string) => {
    try {
      setCaseLoadError(null);
      const cleaned = folder.trim().replace(/^\/|\/$/g, ""); // strip leading/trailing slashes
      if (!cleaned) return;

      let data: any = null;
      const candidatePaths = [
        `/cases/${cleaned}/gabarito_fragmentos.json`,
        `/cases/${cleaned}/gabarito_fragmentos.jason`,
        `/cases/gabarito_caso_narcoticos_01.jason`,
        `/cases/gabarito_caso_narcoticos_01.json`,
        `/cases/gabarito_caso_narcoticos_01json`,
        `/cases/${cleaned}/gabarito_caso_narcoticos_01.jason`,
        `/cases/${cleaned}/gabarito_caso_narcoticos_01.json`
      ];

      for (const p of candidatePaths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            data = await res.json();
            console.log("Successfully loaded custom case gabarito from:", p);
            break;
          }
        } catch (err) {
          console.warn("Attempt to fetch fallback path failed:", p, err);
        }
      }

      // If we still can't load any JSON data, fall back to the built-in CASO_0047_EVIDENCE!
      if (!data) {
        console.warn(`Could not load gabarito JSON for case folder "${cleaned}". Using built-in fallback case.`);
        setCurrentCase(CASO_0047_EVIDENCE);
        sounds.playSnap();
        
        setIsPlaying(true);
        setHasWon(false);
        setHasLost(false);
        
        let initialSecs = 300;
        let autoAligned = false;
        if (difficultySetting.includes("MEDIO")) {
          initialSecs = 300;
        } else if (difficultySetting.includes("DIFICIL")) {
          initialSecs = 180;
        } else {
          autoAligned = true;
        }
        setTimeLeft(initialSecs);

        const initialArr = CASO_0047_EVIDENCE.fragments.map(f => {
          const allowedRotations = autoAligned ? [0] : [0, 90, 180, 270];
          const randomRot = allowedRotations[Math.floor(Math.random() * allowedRotations.length)];
          return {
            id: f.id,
            rotation: randomRot,
            isSnapped: false,
            currentX: -1,
            currentY: -1
          };
        });
        initialArr.sort(() => Math.random() - 0.5);
        setPieces(initialArr);
        return;
      }

      // We successfully loaded JSON data! Now we construct loadedCase from standard or custom schema
      let loadedCase: EvidenceCase | null = null;

      if (data._schema === "document-puzzle-v1") {
        const pd = data.pista_desbloqueada || {};
        const pdd = pd.pista_desbloqueada || {};
        const canvasSize = pd.canvas || {};
        const cw = canvasSize.width || 720;
        const ch = canvasSize.height || 840;
        
        loadedCase = {
          id: pd.id || "pista_narcoticos_01",
          name: pd.descricao_evidencia || "Caso Narcóticos 01",
          code: "CASO #01",
          evidence: "BILHETE REUNIAO",
          difficulty: (pd.dificuldade || "MÉDIO").toUpperCase(),
          timeLimit: 300,
          description: pd.descricao_evidencia || "Caso Narcóticos 01",
          unlockedClue: pdd.texto || pd.texto || "REUNIÃO · GALPÃO 17 · 22:30 · PORTÃO NORTE",
          folder: cleaned,
          usePreCutFragments: true,
          canvasWidth: cw,
          canvasHeight: ch,
          fragments: []
        };

        const customFragments = data.fragmentos || {};
        
        // Correctly loop up to 12 fragments to parse actual custom JSON instead of relying on the old grid
        for (let i = 1; i <= 12; i++) {
          const paddedId = String(i).padStart(2, "0");
          const fragId = `F-${paddedId}`;
          const key1 = `fragment_${paddedId}`;
          const key2 = `fragment_${i}`;
          const key3 = `fragment-${paddedId}`;
          const key4 = `fragment-${i}`;
          const customFrag = customFragments[key1] || customFragments[key2] || customFragments[key3] || customFragments[key4];

          if (customFrag) {
            // Pre-cut custom fragments are exactly 450x450
            const w = 450;
            const h = 450;
            const x = customFrag.x !== undefined ? customFrag.x : (customFrag.cx !== undefined ? customFrag.cx - 225 : 0);
            const y = customFrag.y !== undefined ? customFrag.y : (customFrag.cy !== undefined ? customFrag.cy - 225 : 0);

            loadedCase.fragments.push({
              id: fragId,
              startX: x,
              startY: y,
              width: w,
              height: h,
              polygon: "0% 0%, 100% 0%, 100% 100%, 0% 100%", // no clipping for custom transparent pieces
              targetX: x,
              targetY: y,
              targetRotation: customFrag.rotation ?? 0,
              snapTolerance: customFrag.snap_tolerance ?? 35
            });
          } else {
            const bf = CASO_0047_EVIDENCE.fragments[i - 1];
            loadedCase.fragments.push({
              id: fragId,
              startX: bf ? bf.startX : 100,
              startY: bf ? bf.startY : 100,
              width: bf ? bf.width : 200,
              height: bf ? bf.height : 200,
              polygon: bf ? bf.polygon : "0% 0%, 100% 0%, 100% 100%, 0% 100%",
              targetX: bf ? bf.startX : 100,
              targetY: bf ? bf.startY : 100,
              targetRotation: 0,
              snapTolerance: 35
            });
          }
        }
      } else {
        // Validation check for standard format
        if (!data.id || !data.fragments || !Array.isArray(data.fragments)) {
          throw new Error("Formato inválido do gabarito_fragmentos.json");
        }

        loadedCase = {
          ...data,
          folder: cleaned,
          usePreCutFragments: !!data.usePreCutFragments,
          canvasWidth: data.canvasWidth || 720,
          canvasHeight: data.canvasHeight || 840
        };

        loadedCase.fragments.forEach((f: any) => {
          f.targetX = f.startX;
          f.targetY = f.startY;
          f.targetRotation = f.targetRotation ?? 0;
          f.snapTolerance = f.snapTolerance ?? 30;
        });
      }

      setCurrentCase(loadedCase);
      sounds.playSnap();

      // Synchronously boot game state for new case matching
      setIsPlaying(true);
      setHasWon(false);
      setHasLost(false);

      let initialSecs = 99999;
      let autoAligned = false;
      if (difficultySetting.includes("MEDIO")) {
        initialSecs = 300;
      } else if (difficultySetting.includes("DIFICIL")) {
        initialSecs = 180;
      } else {
        autoAligned = true;
      }
      setTimeLeft(initialSecs);

      const initialArr = loadedCase.fragments.map(f => {
        const allowedRotations = autoAligned ? [0] : [0, 90, 180, 270];
        const randomRot = allowedRotations[Math.floor(Math.random() * allowedRotations.length)];
        return {
          id: f.id,
          rotation: randomRot,
          isSnapped: false,
          currentX: -1,
          currentY: -1
        };
      });
      initialArr.sort(() => Math.random() - 0.5);
      setPieces(initialArr);
    } catch (err: any) {
      console.error(err);
      setCaseLoadError(err.message || "Erro ao carregar o gabarito.");
      sounds.playError();
    }
  };

  const loadCustomCase = () => {
    loadCustomCaseFromFolder(searchFolder);
  };

  const unloadCustomCase = () => {
    setCurrentCase(null);
    setSearchFolder("Caso_Narcoticos_01");
    setCaseLoadError(null);
    sounds.playClick();

    setIsPlaying(false);
    setHasWon(false);
    setHasLost(false);
    setPieces([]);

    // Auto-reload official case
    loadCustomCaseFromFolder("Caso_Narcoticos_01");
  };

  // Core puzzle piece state
  const [pieces, setPieces] = useState<Array<{
    id: string;
    rotation: number; // 0, 90, 180, 270 degrees
    isSnapped: boolean;
    currentX: number; // current logical coordinates on the Board, or -1 if in tray
    currentY: number; // current logical coordinates on the Board, or -1 if in tray
  }>>([]);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync for drag-and-drop to avoid stale closures
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;
  const difficultySettingRef = useRef(difficultySetting);
  difficultySettingRef.current = difficultySetting;

  // Click tracking to separate quick click vs drag for rotation
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  const pointerDownTimeRef = useRef(0);

  // Audio system controls sync
  useEffect(() => {
    sounds.enabled = !mute;
  }, [mute]);

  // Start / Init core minigame state
  const startReconstructionGame = (targetCase = currentCase) => {
    if (!targetCase) return;
    sounds.playClick();
    setIsPlaying(true);
    setHasWon(false);
    setHasLost(false);

    // Parse difficulty values
    let initialSecs = 99999;
    let autoAligned = false;
    if (difficultySetting.includes("MEDIO")) {
      initialSecs = 300;
    } else if (difficultySetting.includes("DIFICIL")) {
      initialSecs = 180;
    } else {
      autoAligned = true; // FACIL starts aligned
    }

    setTimeLeft(initialSecs);

    // Initialize the puzzle coordinates
    const initialArr = targetCase.fragments.map(f => {
      const allowedRotations = autoAligned ? [0] : [0, 90, 180, 270];
      const randomRot = allowedRotations[Math.floor(Math.random() * allowedRotations.length)];
      return {
        id: f.id,
        rotation: randomRot,
        isSnapped: false,
        currentX: -1, // starts inside the tray
        currentY: -1
      };
    });

    // Shuffle array representation inside the sidebar
    initialArr.sort(() => Math.random() - 0.5);
    setPieces(initialArr);
  };

  // Reset core metrics
  const resetReconstructionGame = (newDifficulty = difficultySetting) => {
    sounds.playClick();
    setIsPlaying(false);
    setHasWon(false);
    setHasLost(false);
    
    let initialSecs = 300;
    if (newDifficulty.includes("DIFICIL")) {
      initialSecs = 180;
    } else if (newDifficulty.includes("FACIL")) {
      initialSecs = 99999;
    }
    setTimeLeft(initialSecs);

    // Reset pieces to initial state
    setPieces([]);
  };

  // Handle countdown sequences
  useEffect(() => {
    if (isPlaying && !hasWon && !hasLost && !difficultySetting.includes("FACIL")) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setHasLost(true);
            setIsPlaying(false);
            sounds.playError();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, hasWon, hasLost, difficultySetting]);

  // Trigger init on mount
  useEffect(() => {
    loadCustomCaseFromFolder("Caso_Narcoticos_01");
  }, []);

  // Register global move and up event listeners for flawless drag-and-drop mechanics
  useEffect(() => {
    if (activeDragId === null) return;

    const onGlobalMove = (e: PointerEvent) => {
      handlePointerMove(e);
    };

    const onGlobalUp = (e: PointerEvent) => {
      handlePointerUp(e, activeDragId);
    };

    window.addEventListener('pointermove', onGlobalMove, { passive: true });
    window.addEventListener('pointerup', onGlobalUp);

    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [activeDragId, dragOffset]);

  // Handler dropdown changes
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDifficultySetting(val);
    resetReconstructionGame(val);
  };

  // Rotation incremental loop
  const rotatePiece = (id: string) => {
    sounds.playRotate();
    setPieces(prev => prev.map(p => {
      if (p.id === id && !p.isSnapped) {
        return {
          ...p,
          rotation: (p.rotation + 90) % 360
        };
      }
      return p;
    }));
  };

  // Drag and Drop Engine matching touch & mouse (PointerEvents)
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!isPlaying) return;

    const item = pieces.find(p => p.id === id);
    if (item?.isSnapped) return;

    // Track original position & timestamp for click filter
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    pointerDownTimeRef.current = Date.now();

    setActiveDragId(id);

    if (item && item.currentX === -1) {
      const orig = currentCase.fragments.find(f => f.id === id);
      if (orig) {
        // Safe offset centered relative to the canvas scale (0.75) for the new piece
        setDragOffset({
          x: (orig.width * 0.75) / 2,
          y: (orig.height * 0.75) / 2
        });
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    setMousePos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent | React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (activeDragId === null) return;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();

    // Query guidelines frame inside canvas for absolute centering calculation
    const guideEl = canvasEl.querySelector('.border-dashed');
    const guideRect = guideEl ? guideEl.getBoundingClientRect() : null;
    const containerLeft = guideRect ? guideRect.left : canvasRect.left + (canvasRect.width - 540) / 2;
    const containerTop = guideRect ? guideRect.top : canvasRect.top + (canvasRect.height - 630) / 2;

    // Mouse coordinates relative to the Canvas container
    const relativeX = e.clientX - containerLeft - dragOffset.x;
    const relativeY = e.clientY - containerTop - dragOffset.y;

    // Convert relative offset values to scaled logical coordinates (720x840 space with 0.75 scale)
    let logicalX = relativeX / 0.75;
    let logicalY = relativeY / 0.75;

    // Magnetic snap mechanics based on targets and tolerance configurations
    const orig = currentCase.fragments.find(f => f.id === activeDragId);
    if (orig) {
      const currentPiece = piecesRef.current.find(p => p.id === activeDragId);
      if (currentPiece) {
        const targetX = orig.targetX ?? orig.startX;
        const targetY = orig.targetY ?? orig.startY;
        const targetRotation = orig.targetRotation ?? 0;

        let snapToleranceValue = orig.snapTolerance ?? 30;
        if (difficultySettingRef.current.includes("DIFICIL")) snapToleranceValue = 15;
        if (difficultySettingRef.current.includes("FACIL")) snapToleranceValue = 40;

        const isAligned = currentPiece.rotation === targetRotation;
        const targetDeltaX = Math.abs(logicalX - targetX);
        const targetDeltaY = Math.abs(logicalY - targetY);

        if (isAligned && targetDeltaX < snapToleranceValue && targetDeltaY < snapToleranceValue) {
          // Snap magnetically to exact target coordinates
          logicalX = targetX;
          logicalY = targetY;
        }
      }
    }

    setPieces(prev => prev.map(p => {
      if (p.id === activeDragId) {
        return {
          ...p,
          currentX: logicalX,
          currentY: logicalY
        };
      }
      return p;
    }));
  };

  const handlePointerUp = (e: PointerEvent | React.PointerEvent, id: string) => {
    if (activeDragId === null) return;
    setActiveDragId(null);
    
    if (e.target && 'releasePointerCapture' in e.target) {
      try {
        (e.target as any).releasePointerCapture((e as any).pointerId);
      } catch (err) {}
    }

    // Click discriminator: if pressed short and didn't move much, execute rotation!
    const dist = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
    const timePressed = Date.now() - pointerDownTimeRef.current;
    if (dist < 6 && timePressed < 250) {
      rotatePiece(id);
      return;
    }

    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();

    const isInsideCanvas = (
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom
    );

    const orig = currentCase.fragments.find(f => f.id === id);
    const currentPiece = piecesRef.current.find(p => p.id === id);
    if (!orig || !currentPiece) return;

    if (isInsideCanvas) {
      // Logic space check using exact target properties:
      const targetX = orig.targetX ?? orig.startX;
      const targetY = orig.targetY ?? orig.startY;
      const targetRotation = orig.targetRotation ?? 0;

      const targetDeltaX = Math.abs(currentPiece.currentX - targetX);
      const targetDeltaY = Math.abs(currentPiece.currentY - targetY);

      // Snapping margins dependent on difficulty setting & custom snapTolerance property
      let snapToleranceValue = orig.snapTolerance ?? 30;
      if (difficultySettingRef.current.includes("DIFICIL")) snapToleranceValue = 15;
      if (difficultySettingRef.current.includes("FACIL")) snapToleranceValue = 40;

      const isAligned = currentPiece.rotation === targetRotation;
      const isCloseEnough = targetDeltaX < snapToleranceValue && targetDeltaY < snapToleranceValue;

      if (isCloseEnough) {
        if (isAligned) {
          // Snap locked in perfect slot!
          setPieces(prev => prev.map(p => {
            if (p.id === id) {
              return {
                ...p,
                isSnapped: true,
                currentX: targetX,
                currentY: targetY
              };
            }
            return p;
          }));
          sounds.playSnap();

          // Evaluate win immediately
          setTimeout(() => {
            setPieces(latest => {
              const snapCount = latest.filter(p => p.isSnapped).length;
              if (snapCount === currentCase.fragments.length) {
                setIsPlaying(false);
                setHasWon(true);
                sounds.playWin();
              }
              return latest;
            });
          }, 50);

        } else {
          // Close but misaligned: warn with crash alarm
          sounds.playError();
        }
      } else {
        // Just drop the piece wherever on the canvas
        sounds.playClick();
      }
    } else {
      // Returned to the drawer
      setPieces(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            currentX: -1,
            currentY: -1
          };
        }
        return p;
      }));
      sounds.playClick();
    }
  };

  // Hint execution helper: penalizes time, snaps a piece perfectly
  const triggerForensicHint = () => {
    if (!isPlaying || hasWon || hasLost) return;

    const remaining = pieces.filter(p => !p.isSnapped);
    if (remaining.length === 0) return;

    sounds.playHint();

    // Deduct 30 seconds
    if (!difficultySetting.includes("FACIL")) {
      setTimeLeft(prev => Math.max(0, prev - 30));
    }

    // Pick a random piece and align it
    const randomPiece = remaining[Math.floor(Math.random() * remaining.length)];
    const orig = currentCase.fragments.find(f => f.id === randomPiece.id);
    if (!orig) return;

    const updated = pieces.map(p => {
      if (p.id === randomPiece.id) {
        return {
          ...p,
          isSnapped: true,
          rotation: orig.targetRotation ?? 0,
          currentX: orig.targetX ?? orig.startX,
          currentY: orig.targetY ?? orig.startY
        };
      }
      return p;
    });

    setPieces(updated);

    // Direct win eval
    const snapCount = updated.filter(p => p.isSnapped).length;
    if (snapCount === currentCase.fragments.length) {
      setIsPlaying(false);
      setHasWon(true);
      sounds.playWin();
    }
  };

  const formatTimerDigits = (secs: number) => {
    if (secs > 9000) return "∞";
    const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Helper Stats
  const snappedCount = pieces.filter(p => p.isSnapped).length;

  if (!currentCase) {
    return (
      <div className="min-h-screen bg-[#010811] text-[#00f0ff] font-mono flex flex-col justify-center items-center p-6 scanlines relative select-none" id="forensic_standby">
        <style dangerouslySetInnerHTML={{ __html: STYLE_INJECTION }} />
        <div className="max-w-xl w-full border border-[#00f0ff]/30 bg-[#000d18] rounded-sm p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)] text-center relative overflow-hidden">
          {/* Decorative design corner highlights */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00f0ff]/45" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#00f0ff]/45" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#00f0ff]/45" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#00f0ff]/45" />

          <div className="mb-5 flex justify-center">
            <FolderLock className="w-12 h-12 text-[#00f0ff] animate-pulse" />
          </div>

          <h1 className="text-sm font-bold tracking-widest text-white uppercase mb-4 font-hud">
            SISTEMA DE AUDITORIA FORENSE
          </h1>
          <p className="text-zinc-500 text-[10px] tracking-wider mb-5 font-hud">
            STATUS: AGUARDANDO CASO_NARCOTIOCOS_01
          </p>

          <div className="bg-[#00050a] border border-[#00f0ff]/15 p-4 rounded text-left text-[11px] text-[#00f0ff]/95 leading-relaxed mb-6">
            <div className="flex items-center gap-2 mb-2 font-bold text-[#00f0ff] font-hud tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              <span>DIRETÓRIO DA EVIDÊNCIA OFICIAL</span>
            </div>
            <div className="text-zinc-400 font-sans leading-relaxed mb-3">
              O sistema está configurado para operar exclusivamente com os arquivos oficiais em:
              <span className="block text-[#00f0ff] font-mono text-[10px] mt-1 bg-black/50 p-1.5 border border-[#00f0ff]/10 rounded font-bold">
                public/cases/Caso_Narcoticos_01/
              </span>
            </div>
            <div className="text-zinc-400 font-sans">
              Insira o gabarito e a imagem no diretório acima para iniciar:
              <ul className="list-disc list-inside mt-1.5 space-y-1 font-mono text-[10px] text-[#00f0ff]/80">
                <li>gabarito_fragmentos.json</li>
                <li>documento_original.png</li>
              </ul>
            </div>
            {caseLoadError && (
              <div className="text-red-400 border-t border-zinc-900 pt-2.5 mt-3 text-[10px] font-mono leading-relaxed">
                [ERRO CARREGAMENTO] {caseLoadError}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
            <input
              type="text"
              value={searchFolder}
              onChange={(e) => setSearchFolder(e.target.value)}
              className="bg-[#010811] text-white border border-[#00f0ff]/30 rounded-sm px-3 py-1.5 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00f0ff] uppercase w-full sm:w-56 text-center"
              placeholder="Ex/ Caso_Narcoticos_01"
            />
            <button
              onClick={() => loadCustomCaseFromFolder(searchFolder)}
              className="w-full sm:w-auto bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff] text-[#00f0ff] px-5 py-2 rounded-sm text-xs font-bold uppercase transition-all tracking-wider cursor-pointer"
            >
              CARREGAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010811] text-[#00f0ff] font-mono flex flex-col justify-between select-none overflow-x-hidden scanlines p-0 m-0" id="forensic_root">
      
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: STYLE_INJECTION }} />

      {/* HEADER HUD BAR */}
      <header className="border-b border-[#00f0ff]/30 bg-[#000d18] px-6 py-4 flex flex-wrap justify-between items-center gap-4 relative z-20 shadow-[0_0_20px_rgba(0,240,255,0.12)]" id="hud_header">
        
        {/* Dossier status left */}
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#00f0ff]/40 bg-[#001c30] rounded-sm text-[#00f0ff] glow-cyan">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-hud tracking-widest leading-none flex items-center gap-2">
              <span>FORENSIC LAB - RECONSTITUICAO DOCUMENTAL</span>
            </div>
            <h1 className="text-sm font-bold text-white hover:text-[#00f0ff] transition-all cursor-crosshair mt-1 tracking-wider uppercase">
              {currentCase.code} - {currentCase.name}
            </h1>
          </div>
        </div>

        {/* Action instruction text lines */}
        <div className="hidden xl:flex flex-col text-right pr-4 text-[10px] tracking-widest text-[#00f0ff]/70 font-hud space-y-0.5">
          <div>ARRASTE ATÉ O CANVAS | CLIQUE LOOP PARA ROTAR</div>
          <div className="text-emerald-400 font-bold">ENCAIXE NA ZONA VERDE PARA VALIDAR</div>
        </div>

        {/* Glowing countdown timer */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 block font-hud tracking-wider leading-none">TEMPO RESTANTE</span>
            <div className="font-digital font-bold text-2xl text-[#00ff66] tracking-widest w-[100px] text-[#00ff66] glow-green mt-1 leading-none">
              {formatTimerDigits(timeLeft)}
            </div>
          </div>
        </div>

      </header>

      {/* HEADER FEEDBACK METADATA STATS */}
      <div className="bg-[#000a12]/95 border-b border-[#00f0ff]/15 px-6 py-2.5 flex flex-wrap justify-between items-center text-[11px] text-zinc-400 gap-4" id="feedback_subbar">
        <div className="flex items-center gap-2">
          <span className="text-[#00f0ff] font-hud tracking-widest">FRAGMENTOS POSICIONADOS:</span>
          <span className="text-white font-bold bg-[#001726] border border-[#00f0ff]/30 px-2 py-0.5 rounded-sm">
            {snappedCount} / {currentCase.fragments.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-amber-500 font-bold font-hud tracking-[0.15em]">DIFICULDADE:</span>
          <span className="text-amber-400 uppercase font-bold text-[10px] bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-sm">
            {difficultySetting.split(" - ")[0]}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-emerald-400 font-bold tracking-widest font-hud">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ALINHAMENTO DO GABARITO: OK</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT DESK SCREEN */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 min-h-0 relative z-10" id="desk_layout">
        
        {/* LEFT COLUMN (60%): THE ASSEMBLY DESK BOARD CANVAS */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-h-[460px] relative" id="assembly_canvas_section">
          
          <div className="flex justify-between items-center text-[10px] text-zinc-600 font-hud border border-zinc-900 bg-black/40 px-4 py-2 rounded-sm tracking-widest">
            <span>MESA TÉCNICA DE ALINHAMENTO</span>
            <span className="text-cyan-400">STATUS: {isPlaying ? "ESCANEANDO ATIVO" : "AGUARDANDO INÍCIO"}</span>
          </div>

          <div 
            ref={canvasRef}
            className="flex-1 rounded-md border border-[#00f0ff]/30 relative overflow-hidden flex items-center justify-center p-6 touch-none"
            id="workspace_viewport"
            onPointerMove={handlePointerMove}
          >
            {/* Tech Corner Bracket Targets */}
            <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#00f0ff]/50" />
            <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#00f0ff]/50" />
            <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#00f0ff]/50" />
            <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#00f0ff]/50" />

            {/* Cyan dashed guidelines base frame (ZONA VERDE) - Scaled dynamically */}
            <div 
              style={{ 
                width: `${(currentCase.canvasWidth || 720) * 0.75}px`, 
                height: `${(currentCase.canvasHeight || 840) * 0.75}px` 
              }}
              className={`absolute border-2 border-dashed transition-all duration-500 rounded-sm flex items-center justify-center ${
                isPlaying 
                  ? 'border-emerald-500/25 bg-emerald-950/5 shadow-[inset_0_0_20px_rgba(0,255,102,0.03)]' 
                  : 'border-zinc-800/40 bg-transparent'
              }`}
            >
              
              {/* Back reference Gabarito Watermark showing original guide contours */}
              <div 
                className="absolute inset-0 select-none pointer-events-none opacity-[0.15] mix-blend-screen origin-top-left overflow-hidden grayscale"
                style={{ transform: 'scale(0.75)' }}
              >
                <RenderDocumentWhole 
                  folder={currentCase.folder} 
                  width={currentCase.canvasWidth || 720} 
                  height={currentCase.canvasHeight || 840} 
                />
              </div>

            </div>

            {/* RENDER PLACED AND ACTIVE FRAGMENTS ON DESK */}
            {isPlaying && (
              <div 
                className="absolute pointer-events-none" 
                style={{ 
                  width: `${(currentCase.canvasWidth || 720) * 0.75}px`, 
                  height: `${(currentCase.canvasHeight || 840) * 0.75}px` 
                }}
              >
                
                {/* Target slot outline preview for the currently dragged fragment (Preview da área de encaixe - SILHUETA/GHOST REAL) */}
                {activeDragId !== null && (
                  (() => {
                    const orig = currentCase.fragments.find(f => f.id === activeDragId);
                    if (!orig) return null;
                    const piece = pieces.find(p => p.id === activeDragId);
                    if (!piece) return null;

                    const targetX = orig.targetX ?? orig.startX;
                    const targetY = orig.targetY ?? orig.startY;
                    const distance = Math.hypot(piece.currentX - targetX, piece.currentY - targetY);

                    const isAligned = piece.rotation === (orig.targetRotation ?? 0);
                    const isVeryClose = isAligned && distance <= 40;

                    const previewX = targetX * 0.75;
                    const previewY = targetY * 0.75;
                    const previewW = orig.width * 0.75;
                    const previewH = orig.height * 0.75;

                    const silhouetteOpacity = isVeryClose ? 0.9 : 0.22;
                    const silhouetteFilter = isVeryClose 
                      ? 'drop-shadow(0px 0px 10px rgba(16, 255, 102, 0.95)) brightness(1.2)' 
                      : 'brightness(0.35) grayscale(0.5)';

                    return (
                      <div
                        style={{
                          left: `${previewX}px`,
                          top: `${previewY}px`,
                          width: `${previewW}px`,
                          height: `${previewH}px`,
                          clipPath: currentCase.usePreCutFragments ? undefined : `polygon(${orig.polygon})`,
                          transform: `rotate(${orig.targetRotation ?? 0}deg)`,
                          transformOrigin: 'center',
                          position: 'absolute',
                          zIndex: 5,
                          opacity: silhouetteOpacity,
                          filter: silhouetteFilter,
                          transition: 'opacity 0.15s ease, filter 0.15s ease',
                        }}
                        className="animate-pulse pointer-events-none bg-transparent"
                      >
                        <PieceGraphic 
                          folder={currentCase.folder} 
                          fragmentId={activeDragId}
                          usePreCut={currentCase.usePreCutFragments}
                          startX={orig.startX} 
                          startY={orig.startY} 
                          width={orig.width} 
                          height={orig.height} 
                          scale={0.75}
                          canvasWidth={currentCase.canvasWidth}
                          canvasHeight={currentCase.canvasHeight}
                        />
                      </div>
                    );
                  })()
                )}
                
                {/* 1. Snapped pieces (Locked in accurate original places) */}
                {pieces.filter(p => p.isSnapped).map(p => {
                  const orig = currentCase.fragments.find(f => f.id === p.id);
                  if (!orig) return null;

                  // Render final piece perfectly inside scaled boundary
                  const calculatedW = orig.width * 0.75;
                  const calculatedH = orig.height * 0.75;
                  const calculatedX = orig.startX * 0.75;
                  const calculatedY = orig.startY * 0.75;

                  return (
                    <div 
                      key={p.id}
                      style={{
                        left: `${calculatedX}px`,
                        top: `${calculatedY}px`,
                        width: `${calculatedW}px`,
                        height: `${calculatedH}px`,
                        clipPath: currentCase.usePreCutFragments ? undefined : `polygon(${orig.polygon})`,
                        position: 'absolute'
                      }}
                      className="pointer-events-none"
                    >
                      <PieceGraphic 
                        folder={currentCase.folder} 
                        fragmentId={p.id}
                        usePreCut={currentCase.usePreCutFragments}
                        startX={orig.startX} 
                        startY={orig.startY} 
                        width={orig.width} 
                        height={orig.height} 
                        scale={0.75}
                        canvasWidth={currentCase.canvasWidth}
                        canvasHeight={currentCase.canvasHeight}
                      />
                    </div>
                  );
                })}

                {/* 2. Dragged or Canvas loose pieces */}
                {pieces.filter(p => !p.isSnapped && p.currentX !== -1).map(p => {
                  const orig = currentCase.fragments.find(f => f.id === p.id);
                  if (!orig) return null;

                  const isCurrentlyDragging = activeDragId === p.id;
                  const calculatedW = orig.width * 0.75;
                  const calculatedH = orig.height * 0.75;
                  const calculatedX = p.currentX * 0.75;
                  const calculatedY = p.currentY * 0.75;

                  return (
                    <div
                      key={p.id}
                      onPointerDown={(e) => handlePointerDown(e, p.id)}
                      onPointerUp={(e) => handlePointerUp(e, p.id)}
                      style={{
                        left: `${calculatedX}px`,
                        top: `${calculatedY}px`,
                        width: `${calculatedW}px`,
                        height: `${calculatedH}px`,
                        position: 'absolute',
                        clipPath: currentCase.usePreCutFragments ? undefined : `polygon(${orig.polygon})`,
                        transform: `rotate(${p.rotation}deg)`,
                        zIndex: isCurrentlyDragging ? 100 : 30,
                        opacity: isCurrentlyDragging ? 0.0 : 1.0,
                        pointerEvents: 'auto'
                      }}
                      className="cursor-grab active:cursor-grabbing select-none bg-transparent border-0 outline-none"
                      title="Arraste para mover. Clique rápido para rotar."
                    >
                      <div className="w-full h-full pointer-events-none select-none">
                        <PieceGraphic 
                          folder={currentCase.folder} 
                          fragmentId={p.id}
                          usePreCut={currentCase.usePreCutFragments}
                          startX={orig.startX} 
                          startY={orig.startY} 
                          width={orig.width} 
                          height={orig.height} 
                          scale={0.75}
                          canvasWidth={currentCase.canvasWidth}
                          canvasHeight={currentCase.canvasHeight}
                        />
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            {/* PRE-START HUB WELCOME PANEL */}
            {!isPlaying && !hasWon && !hasLost && (
              <div className="absolute inset-0 bg-black/90 flex flex-col justify-center items-center p-6 text-center z-40" id="intro_welcome_box">
                <div className="border border-[#00f0ff]/60 bg-gradient-to-b from-[#000f1c] to-black max-w-sm p-8 rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                  <Layers className="w-12 h-12 text-[#00f0ff] mx-auto mb-4 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#00f0ff] mb-2 font-hud">Scanner de Reconstituição</h3>
                  <div className="text-[11px] text-zinc-400 mb-6 leading-relaxed">
                    Arraste os fragmentos de evidência rasgados da gaveta lateral à mesa de alinhamento. Encontre a rotação perfeita (0°) e posicione-as sobre o gabarito.
                  </div>
                  <button
                    onClick={startReconstructionGame}
                    className="w-full bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66] py-3 px-6 font-bold text-xs uppercase rounded-sm cursor-pointer transition-all flex items-center justify-center gap-2 glow-green hover:shadow-[0_0_12px_rgba(0,255,102,0.2)]"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Iniciar Análise Técnica
                  </button>
                </div>
              </div>
            )}

            {/* DEFEAT DIALOG OVERLAY */}
            {hasLost && (
              <div className="absolute inset-0 bg-black/90 flex flex-col justify-center items-center p-6 text-center z-40" id="failure_overlay">
                <div className="border border-red-500 bg-gradient-to-b from-[#1b0808] to-black max-w-sm p-8 rounded shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2 font-hud">TEMPO LIMITADO ESGOTADO</h3>
                  <div className="text-[11.5px] text-zinc-400 mb-6 leading-relaxed">
                    Você excedeu o tempo máximo estipulado pela perícia técnica. O conteúdo do bilhete corre o risco de ser adulterado.
                  </div>
                  <button
                    onClick={startReconstructionGame}
                    className="w-full bg-red-500/15 hover:bg-red-500/25 border border-red-500 text-red-400 py-3 rounded text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Reescalar Nova Análise
                  </button>
                </div>
              </div>
            )}

            {/* VICTORY OVERLAY WITH HIGH TECH DOSSIER REVELATION */}
            {hasWon && (
              <div className="absolute inset-0 bg-black/95 flex flex-col justify-center items-center p-6 text-center z-50 overflow-y-auto" id="victory_overlay">
                <div className="border border-[#00ff66] bg-gradient-to-b from-[#021f0f] to-[#010804] max-w-xl p-8 rounded-sm shadow-[0_0_35px_rgba(0,255,102,0.4)] my-4">
                  
                  <CheckCircle2 className="w-12 h-12 text-[#00ff66] mx-auto mb-3 animate-pulse" />
                  <h2 className="text-sm font-bold text-[#00ff66] uppercase tracking-wider font-hud">RECONSTITUIÇÃO DOCUMENTAL CONCLUÍDA</h2>
                  <div className="text-[9px] text-[#00ff66]/50 uppercase tracking-widest mb-5">SISTEMA CIBERNÉTICO ANALÍTICO // ANÁLISE DE SUCESSO</div>

                  {/* Restored note preview card */}
                  <div className="w-[280px] h-[326px] mx-auto border border-[#00ff66]/40 shadow-[0_0_20px_rgba(0,255,102,0.15)] rounded overflow-hidden mb-6 relative">
                    <div 
                      className="absolute inset-0 origin-top-left"
                      style={{ transform: `scale(${326 / (currentCase.canvasHeight || 840)})` }}
                    >
                      <RenderDocumentWhole 
                        folder={currentCase.folder} 
                        width={currentCase.canvasWidth || 720} 
                        height={currentCase.canvasHeight || 840} 
                      />
                    </div>
                  </div>

                  {/* Decrypted crime file intelligence report */}
                  <div className="bg-[#02130a] border border-[#00ff66]/30 p-4 rounded text-left mb-6 relative">
                    <div className="absolute top-2.5 right-3 flex items-center gap-1.5 text-[8px] text-[#00ff66] uppercase tracking-wider font-bold font-hud">
                      <Unlock className="w-2.5 h-2.5" />
                      CRIPTOGRAFIA REVELADA
                    </div>
                    <div className="text-[11px] font-bold text-[#00ff66] tracking-wider mb-2 font-hud uppercase">PISTA COLETADA DO {currentCase.code}</div>
                    <p className="text-[11.5px] text-zinc-300 leading-relaxed font-sans mt-1 italic">
                      "{currentCase.unlockedClue}"
                    </p>
                  </div>

                  {/* Operational control reinit btn */}
                  <button
                    onClick={startReconstructionGame}
                    className="w-full bg-[#00ff66]/15 hover:bg-[#00ff66]/30 text-[#00ff66] border border-[#00ff66] py-3 px-6 rounded-sm text-xs font-black uppercase tracking-wider transition-all cursor-pointer glow-green"
                  >
                    Escanear Novamente
                  </button>

                </div>
              </div>
            )}

          </div>

        </section>

        {/* RIGHT COLUMN (40%): THE "FRAGMENTOS - EVIDENCIA" DRAWER */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 min-h-[460px]" id="pieces_drawer_section">
          
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-hud border border-zinc-900 bg-[#00050a] px-4 py-2 rounded-sm tracking-widest">
            <span>FRAGMENTOS - EVIDENCIA</span>
            <span className="bg-[#001726] border border-[#00f0ff]/30 px-2 py-0.5 rounded text-[9px] text-[#00f0ff]">
              {currentCase.fragments.length} PECAS
            </span>
          </div>

          {/* CASO EXTÈRNO LOADER INTERFACE */}
          <div className="border border-[#00f0ff]/20 bg-[#000d18] p-3 rounded-sm flex flex-col gap-2 relative shadow-inner">
            <div className="text-[9px] text-zinc-400 font-hud tracking-wider flex justify-between">
              <span>SISTEMA DE CASOS ADICIONAIS</span>
              {currentCase.id !== "case_01" && (
                <span className="text-amber-500 font-black animate-pulse">CASO EXTERNO ATIVO</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={searchFolder}
                onChange={(e) => setSearchFolder(e.target.value)}
                placeholder="Ex/ case_0047"
                className="flex-1 bg-[#010811] text-white border border-[#00f0ff]/30 rounded-sm px-2.5 py-1.5 text-xs font-mono tracking-widest focus:outline-none focus:border-[#00f0ff] uppercase"
                title="Insira o nome da pasta em /public/cases/"
              />
              <button
                onClick={loadCustomCase}
                className="bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff] text-[#00f0ff] px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase transition-all tracking-wider cursor-pointer"
              >
                CARREGAR
              </button>
              {currentCase.id !== "case_01" && (
                <button
                  onClick={unloadCustomCase}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500 text-red-500 px-3.5 py-1.5 rounded-sm text-[11px] font-bold uppercase transition-all cursor-pointer"
                  title="Voltar para Bilhete Secreto #0047"
                >
                  VOLTAR
                </button>
              )}
            </div>
            {caseLoadError && (
              <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1.5 bg-red-950/20 p-2 border border-red-500/20 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>{caseLoadError}</span>
              </div>
            )}
          </div>

          {/* DRAGGABLE FRAGMENTS CARD LIST TRAPEZOID WITH DETAILED SHIELDS */}
          <div 
            className="flex-1 bg-[#0d111e] border border-zinc-900 rounded p-4 overflow-y-auto shadow-[inset_0_0_20px_rgba(0,0,0,0.85)] max-h-[60vh] lg:max-h-none"
            id="drawer_grid_tray"
          >
            
            <div className="grid grid-cols-2 gap-3.5">
              {pieces.map(p => {
                const orig = currentCase.fragments.find(f => f.id === p.id);
                if (!orig) return null;

                // View box scaled layout inside square grid tray slots
                // We show an aligned fragment floating centered
                const isCurrentlyDragging = activeDragId === p.id;

                if (p.isSnapped) {
                  // Render a beautiful, professional SNAP OK locked locked state
                  return (
                    <div 
                      key={p.id}
                      className="bg-[#0a0b11] border border-emerald-500/10 rounded relative h-32 flex flex-col justify-between items-center p-3 opacity-30 select-none cursor-not-allowed"
                    >
                      <span className="absolute top-1.5 left-2 text-[8px] font-bold text-emerald-500/65 font-hud">
                        {p.id}
                      </span>
                      <div className="flex-1 flex flex-col justify-center items-center gap-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500/80" />
                        <span className="text-[8.5px] uppercase font-hud text-emerald-500/50">SNAP CONCLUÍDO</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={p.id}
                    className={`bg-[#0a0b11] border ${
                      isCurrentlyDragging ? 'border-[#00f0ff]/90' : 'border-zinc-800'
                    } rounded-md relative h-32 p-1.5 flex flex-col justify-between overflow-hidden group hover:border-[#00f0ff]/40 transition-colors cursor-grab active:cursor-grabbing`}
                  >
                    {/* Unique design identifier */}
                    <span className="absolute top-1.5 left-2 text-[8.5px] font-bold text-zinc-500 group-hover:text-[#00f0ff] transition-colors leading-none">
                      {p.id}
                    </span>

                    {/* ROTATE ACTION KEY */}
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        rotatePiece(p.id);
                      }}
                      className="absolute bottom-1.5 right-1.5 p-1 bg-black/80 hover:bg-[#00f0ff] hover:text-black border border-[#00f0ff]/20 hover:border-[#00f0ff] rounded-sm transition-all z-40 flex items-center justify-center cursor-pointer"
                      title="Rotacionar (90°)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Show angle indicator overlay */}
                    {p.rotation !== 0 && (
                      <span className="absolute bottom-1.5 left-2 text-[8px] font-bold text-amber-500 bg-black/60 px-1 py-0.2 rounded border border-amber-500/20 leading-none">
                        {p.rotation}°
                      </span>
                    )}

                    {/* Interactive Grab Surface */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, p.id)}
                      onPointerUp={(e) => handlePointerUp(e, p.id)}
                      className="w-full h-full flex items-center justify-center"
                      style={{ height: 'calc(100% - 10px)' }}
                    >
                      {/* Scaled down preview centered inside tray cell */}
                      <div
                        style={{
                          width: `${Math.min(100, orig.width * 0.75 * 0.28)}px`,
                          height: `${Math.min(100, orig.height * 0.75 * 0.28)}px`,
                          clipPath: currentCase.usePreCutFragments ? undefined : `polygon(${orig.polygon})`,
                          transform: `rotate(${p.rotation}deg)`,
                          transition: 'transform 0.15s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        className="bg-transparent border-0 outline-none"
                      >
                        <PieceGraphic 
                          folder={currentCase.folder} 
                          fragmentId={p.id}
                          usePreCut={currentCase.usePreCutFragments}
                          startX={orig.startX} 
                          startY={orig.startY} 
                          width={orig.width} 
                          height={orig.height} 
                          scale={0.75 * 0.28}
                          canvasWidth={currentCase.canvasWidth}
                          canvasHeight={currentCase.canvasHeight}
                        />
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* LOWER OPERATIONAL HUD GEAR KEYS PANEL */}
          <div className="flex flex-col gap-3" id="bottom_action_panels">
            
            {/* System Setup difficulty Selector on Tray Base */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-hud">MODO:</span>
              <div className="flex-1 relative">
                <select 
                  onChange={handleDifficultyChange}
                  value={difficultySetting}
                  disabled={isPlaying && (snappedCount > 0)}
                  className="w-full bg-[#000c16] text-[#ffb700] border border-amber-500/40 rounded px-3 py-2 text-[11px] font-bold tracking-wider uppercase focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="FACIL - Sem tempo">FÁCIL - SEM TEMPO</option>
                  <option value="MEDIO - 5 min">MÉDIO - 05:00</option>
                  <option value="DIFICIL - 3 min">DIFÍCIL - 03:00</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-500">
                  <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={startReconstructionGame}
                className="bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] text-[10px] py-3.5 rounded font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-1 cursor-pointer glow-green"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                INICIAR
              </button>
              <button
                onClick={() => resetReconstructionGame()}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] py-3.5 rounded font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                REINICIAR
              </button>
              <button
                onClick={triggerForensicHint}
                disabled={!isPlaying || hasWon || hasLost}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500 text-red-500 text-[10px] py-3.5 rounded font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-0.5 cursor-pointer"
                title="Consome -30S para posicionar peça aleatória"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                DICA -30S
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* FIXED GLOBAL ACTIVE DRAG GHOST VIEW - COMPLETELY TRANSPARENT, CROPPED RECONSTRUCTION */}
      {activeDragId !== null && (
        (() => {
          const orig = currentCase.fragments.find(f => f.id === activeDragId);
          if (!orig) return null;
          const piece = pieces.find(p => p.id === activeDragId);
          if (!piece) return null;
          return (
            <div
              style={{
                position: 'fixed',
                left: `${mousePos.x - dragOffset.x}px`,
                top: `${mousePos.y - dragOffset.y}px`,
                width: `${orig.width * 0.75}px`,
                height: `${orig.height * 0.75}px`,
                clipPath: currentCase.usePreCutFragments ? undefined : `polygon(${orig.polygon})`,
                transform: `rotate(${piece.rotation}deg)`,
                pointerEvents: 'none',
                zIndex: 9999,
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.65))',
              }}
              className="select-none bg-transparent"
            >
              <PieceGraphic 
                folder={currentCase.folder} 
                fragmentId={activeDragId}
                usePreCut={currentCase.usePreCutFragments}
                startX={orig.startX} 
                startY={orig.startY} 
                width={orig.width} 
                height={orig.height} 
                scale={0.75}
                canvasWidth={currentCase.canvasWidth}
                canvasHeight={currentCase.canvasHeight}
              />
            </div>
          );
        })()
      )}

      {/* FOOTER BAR */}
      <footer className="border-t border-[#00f0ff]/10 bg-[#000810] px-6 py-3 text-[9px] text-zinc-650 flex justify-between tracking-widest uppercase relative z-20" id="hud_footer">
        <span className="text-zinc-650 opacity-60">SISTEMA PERICIAL DE DIGITALIZAÇÃO COGNITIVA // TERMINAL_ALPHA</span>
        <span className="text-zinc-600">AISTUDIO FORENSIC // PORT_3000_INGRESS_SECURE</span>
      </footer>

    </div>
  );
}
