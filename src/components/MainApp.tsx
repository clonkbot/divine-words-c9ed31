import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { HistoryPanel } from "./HistoryPanel";

// Bible verses and stories for random selection
const BIBLE_CONTENT = [
  { title: "Psalm 23", content: "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
  { title: "John 3:16", content: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { title: "Philippians 4:13", content: "I can do all things through Christ which strengtheneth me." },
  { title: "Jeremiah 29:11", content: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { title: "Proverbs 3:5-6", content: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
  { title: "Romans 8:28", content: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { title: "Isaiah 41:10", content: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness." },
  { title: "Matthew 11:28", content: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { title: "The Creation", content: "In the beginning God created the heaven and the earth. And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters. And God said, Let there be light: and there was light. And God saw the light, that it was good." },
  { title: "David and Goliath", content: "Then said David to the Philistine, Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the Lord of hosts. This day will the Lord deliver thee into mine hand. So David prevailed over the Philistine with a sling and with a stone." },
  { title: "The Good Shepherd", content: "I am the good shepherd: the good shepherd giveth his life for the sheep. I am the good shepherd, and know my sheep, and am known of mine. As the Father knoweth me, even so know I the Father: and I lay down my life for the sheep." },
  { title: "The Beatitudes", content: "Blessed are the poor in spirit: for theirs is the kingdom of heaven. Blessed are they that mourn: for they shall be comforted. Blessed are the meek: for they shall inherit the earth. Blessed are they which do hunger and thirst after righteousness: for they shall be filled." },
  { title: "1 Corinthians 13", content: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love never fails." },
  { title: "Psalm 91:1-2", content: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust." },
  { title: "The Prodigal Son", content: "And the son said unto him, Father, I have sinned against heaven, and in thy sight, and am no more worthy to be called thy son. But the father said to his servants, Bring forth the best robe, and put it on him; for this my son was dead, and is alive again; he was lost, and is found." },
];

// Video prompts for biblical atmospheric backgrounds
const VIDEO_PROMPTS = [
  "Ethereal golden light rays streaming through clouds, divine heavenly atmosphere, slow motion, cinematic 4K",
  "Ancient temple interior with floating dust particles in sunbeams, sacred atmosphere, peaceful, cinematic",
  "Calm waters reflecting a sunset with golden and purple hues, biblical serenity, peaceful meditation scene",
  "Rolling green hills at dawn with morning mist, pastoral landscape, sheep grazing peacefully, divine light",
  "Desert landscape at golden hour with dramatic sky, ancient holy land atmosphere, cinematic beauty",
  "Olive garden at twilight with soft lantern light, peaceful Mediterranean scene, biblical setting",
  "Majestic mountains with snow peaks and clouds parting to reveal sunlight, divine glory, cinematic",
  "Ancient stone walls with ivy and warm sunlight, peaceful courtyard, biblical era aesthetic",
];

function pcmToWav(base64Pcm: string): string {
  const pcm = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
  const sampleRate = 24000;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const w = (o: number, s: string) => s.split('').forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true);
  w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); w(36, 'data');
  view.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);
  return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
}

export function MainApp() {
  const { signOut } = useAuthActions();
  const generations = useQuery(api.generations.list);
  const createGeneration = useMutation(api.generations.create);
  const deleteGeneration = useMutation(api.generations.remove);
  const textToSpeech = useAction(api.ai.textToSpeech);
  const generateVideo = useAction(api.ai.generateVideo);

  const [currentGeneration, setCurrentGeneration] = useState<{
    title: string;
    content: string;
    audioUrl?: string;
    videoUrl?: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setCurrentGeneration(null);

    try {
      // Pick random content
      const randomContent = BIBLE_CONTENT[Math.floor(Math.random() * BIBLE_CONTENT.length)];
      const randomVideoPrompt = VIDEO_PROMPTS[Math.floor(Math.random() * VIDEO_PROMPTS.length)];

      setCurrentGeneration({
        title: randomContent.title,
        content: randomContent.content,
      });

      // Generate TTS
      setGenerationStep("Creating divine narration...");
      let audioBase64: string | undefined;
      let audioUrl: string | undefined;
      try {
        audioBase64 = await textToSpeech({
          text: `${randomContent.title}. ${randomContent.content}`,
          voice: "Charon",
        });
        if (audioBase64) {
          audioUrl = pcmToWav(audioBase64);
          setCurrentGeneration(prev => prev ? { ...prev, audioUrl } : null);
        }
      } catch (e) {
        console.error("TTS failed:", e);
      }

      // Generate Video (this takes a while)
      setGenerationStep("Manifesting sacred visuals... (this may take up to 2 minutes)");
      let videoUrl: string | undefined;
      let videoStorageId: Id<"_storage"> | undefined;
      try {
        const videoResult = await generateVideo({
          prompt: randomVideoPrompt,
          aspectRatio: "16:9",
        });
        if (videoResult?.url) {
          videoUrl = videoResult.url;
          videoStorageId = videoResult.storageId;
          setCurrentGeneration(prev => prev ? { ...prev, videoUrl } : null);
        }
      } catch (e) {
        console.error("Video generation failed:", e);
      }

      // Save to database
      setGenerationStep("Preserving in the archives...");
      await createGeneration({
        title: randomContent.title,
        content: randomContent.content,
        audioBase64,
        videoStorageId,
        videoUrl,
      });

      setGenerationStep("");
    } catch (e) {
      console.error("Generation failed:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSelectFromHistory = (gen: {
    title: string;
    content: string;
    audioBase64?: string;
    videoUrl?: string;
  }) => {
    setCurrentGeneration({
      title: gen.title,
      content: gen.content,
      audioUrl: gen.audioBase64 ? pcmToWav(gen.audioBase64) : undefined,
      videoUrl: gen.videoUrl,
    });
    setShowHistory(false);
  };

  const handleDeleteFromHistory = async (id: Id<"generations">) => {
    await deleteGeneration({ id });
  };

  // Auto-play audio when ready
  useEffect(() => {
    if (currentGeneration?.audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentGeneration?.audioUrl]);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1424] to-[#0a0e1a]" />

      {/* Video background */}
      {currentGeneration?.videoUrl && (
        <div className="fixed inset-0 z-0">
          <video
            ref={videoRef}
            src={currentGeneration.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/50 to-transparent" />
        </div>
      )}

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d4a574]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#8b3a3a]/10 rounded-full blur-[120px]" />
      </div>

      {/* Cross pattern overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 0h4v18h18v4H22v18h-4V22H0v-4h18V0z' fill='%23d4a574' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b3a3a] flex items-center justify-center shadow-lg shadow-[#d4a574]/20">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-[#0a0e1a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-xl md:text-2xl text-[#f5f0e6]">Divine Words</h1>
            <p className="text-[#d4a574]/60 text-xs font-serif italic">Scripture illuminated</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-2 md:px-4 md:py-2 text-[#d4a574] text-sm border border-[#d4a574]/30 rounded-lg hover:bg-[#d4a574]/10 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">History</span>
          </button>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 md:px-4 md:py-2 text-[#d4a574]/70 text-sm hover:text-[#d4a574] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100dvh-140px)] px-4 py-8">
        {/* Current generation display */}
        {currentGeneration && (
          <div className="w-full max-w-3xl mb-8 animate-fadeIn">
            <div className="relative bg-gradient-to-b from-[#1a1f35]/90 to-[#0a0e1a]/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 border border-[#d4a574]/20 shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#d4a574]/40 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#d4a574]/40 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#d4a574]/40 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#d4a574]/40 rounded-br-lg" />

              <h2 className="font-display text-2xl md:text-4xl text-[#d4a574] text-center mb-6 md:mb-8 tracking-wide">
                {currentGeneration.title}
              </h2>
              <p className="font-serif text-lg md:text-xl text-[#f5f0e6]/90 leading-relaxed text-center italic">
                "{currentGeneration.content}"
              </p>

              {/* Audio controls */}
              {currentGeneration.audioUrl && (
                <div className="mt-6 md:mt-8 flex justify-center">
                  <audio ref={audioRef} src={currentGeneration.audioUrl} controls className="w-full max-w-sm h-10 rounded-lg" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#d4a574] to-[#8b3a3a] blur-xl opacity-40 ${isGenerating ? 'animate-pulse' : ''}`} style={{ transform: 'scale(1.5)' }} />

          {/* Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#d4a574] via-[#c4956a] to-[#8b3a3a] shadow-2xl shadow-[#d4a574]/30 flex flex-col items-center justify-center transition-all duration-300 ${
              isGenerating
                ? 'scale-95 cursor-not-allowed'
                : 'hover:scale-105 hover:shadow-[#d4a574]/50 active:scale-95'
            }`}
          >
            {/* Inner decorative ring */}
            <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-[#0a0e1a]/20" />

            {isGenerating ? (
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 md:h-10 md:w-10 text-[#0a0e1a]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 md:w-12 md:h-12 text-[#0a0e1a] mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-[#0a0e1a] font-bold text-sm md:text-base uppercase tracking-wider">Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Generation step indicator */}
        {generationStep && (
          <p className="mt-6 text-[#d4a574] text-center animate-pulse font-serif italic px-4">{generationStep}</p>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 px-6 py-3 bg-[#8b3a3a]/30 border border-[#8b3a3a]/50 rounded-lg">
            <p className="text-[#e57373] text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        {!currentGeneration && !isGenerating && (
          <p className="mt-8 text-[#d4a574]/60 text-center font-serif italic text-sm md:text-base px-4">
            Press the button to receive a divine message<br />with voice narration and sacred visuals
          </p>
        )}
      </main>

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          generations={generations || []}
          onSelect={handleSelectFromHistory}
          onDelete={handleDeleteFromHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[#d4a574]/40 text-xs">
          Requested by <span className="text-[#d4a574]/60">@Salmong</span> · Built by <span className="text-[#d4a574]/60">@clonkbot</span>
        </p>
      </footer>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
