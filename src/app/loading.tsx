export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F6F3E8]">
            <div className="flex flex-col items-center gap-6">
                {/* Brand Text */}
                <h2 className="font-playfair text-xl md:text-2xl text-black uppercase tracking-[0.2em] animate-pulse">
                    Isabella UGC
                </h2>

                {/* Decorative Loading Line */}
                <div className="w-32 h-[1px] bg-black/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-black animate-progress-line" />
                </div>
            </div>
        </div>
    );
}
