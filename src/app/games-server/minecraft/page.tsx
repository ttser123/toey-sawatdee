export default function MinecraftPage() {
    return (
        <main className="flex-1 overflow-auto bg-blueprint p-6 md:p-8 lg:p-10">
            {/* Page heading */}
            <div className="mb-6 flex items-center gap-3 px-1">
                <span className="material-symbols-outlined text-slate-400 text-[28px]">
                    sports_esports
                </span>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        Minecraft Server Monitor
                    </h1>
                </div>
            </div>

            {/* Empty state — dashed border blueprint style */}
            <div className="border-2 border-dashed border-slate-300 rounded-sm p-12 text-center bg-white/60 backdrop-blur-sm">
                <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3 block">
                    construction
                </span>
                <p className="text-sm text-slate-400 font-mono">
                    Server integration pending deployment.
                </p>
            </div>
        </main>
    );
}
