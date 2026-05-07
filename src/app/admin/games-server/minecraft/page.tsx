export default function MinecraftPage() {
    return (
        <div className="space-y-8">
            {/* Empty state — dashed border blueprint style */}
            <div className="border-2 border-dashed border-slate-300 rounded-sm p-12 text-center bg-white/60 backdrop-blur-sm">
                <span className="material-symbols-outlined text-slate-300 text-[48px] mb-3 block">
                    construction
                </span>
                <p className="text-sm text-slate-400 font-mono">
                    Server integration pending deployment.
                </p>
            </div>
        </div>
    );
}
