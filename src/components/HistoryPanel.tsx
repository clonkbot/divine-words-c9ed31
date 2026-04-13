import { Id } from "../../convex/_generated/dataModel";

interface Generation {
  _id: Id<"generations">;
  title: string;
  content: string;
  audioBase64?: string;
  videoUrl?: string;
  createdAt: number;
}

interface HistoryPanelProps {
  generations: Generation[];
  onSelect: (gen: Generation) => void;
  onDelete: (id: Id<"generations">) => void;
  onClose: () => void;
}

export function HistoryPanel({ generations, onSelect, onDelete, onClose }: HistoryPanelProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#1a1f35] to-[#0a0e1a] border-l border-[#d4a574]/20 z-50 animate-slideIn overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#d4a574]/20 flex items-center justify-between shrink-0">
          <h2 className="font-display text-xl md:text-2xl text-[#d4a574]">Sacred Archives</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[#d4a574]/60 hover:text-[#d4a574] hover:bg-[#d4a574]/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {generations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#d4a574]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#d4a574]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-[#d4a574]/60 font-serif italic">No revelations yet</p>
              <p className="text-[#d4a574]/40 text-sm mt-1">Generate your first divine message</p>
            </div>
          ) : (
            generations.map((gen) => (
              <div
                key={gen._id}
                className="group relative bg-[#0a0e1a]/60 border border-[#d4a574]/10 rounded-xl p-4 hover:border-[#d4a574]/30 transition-all cursor-pointer"
                onClick={() => onSelect(gen)}
              >
                {/* Decorative element */}
                <div className="absolute top-0 left-4 w-8 h-[2px] bg-gradient-to-r from-[#d4a574]/50 to-transparent" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-[#d4a574] text-lg truncate">{gen.title}</h3>
                    <p className="text-[#f5f0e6]/60 text-sm mt-1 line-clamp-2 font-serif italic">
                      "{gen.content}"
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[#d4a574]/40 text-xs">{formatDate(gen.createdAt)}</span>
                      {gen.audioBase64 && (
                        <span className="text-[#d4a574]/40 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93V6h2v2c0 2.76 2.24 5 5 5s5-2.24 5-5V6h2v2c0 4.08-3.06 7.44-7 7.93V18h3v2H9v-2h3v-2.07z" />
                          </svg>
                          Audio
                        </span>
                      )}
                      {gen.videoUrl && (
                        <span className="text-[#d4a574]/40 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                          </svg>
                          Video
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(gen._id);
                    }}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-[#8b3a3a]/60 hover:text-[#e57373] hover:bg-[#8b3a3a]/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
