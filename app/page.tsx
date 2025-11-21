import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <main className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl p-12 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-slate-800">
              CrowdCompass
            </h1>
            <p className="text-2xl text-slate-600">
              Real-time Train Congestion Monitoring
            </p>
            <p className="text-lg text-slate-500">
              AI-powered passenger capacity tracking using LLM technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-8">
            <Link
              href="/status"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">📊</div>
                <h2 className="text-3xl font-bold">Carriage Status</h2>
                <p className="text-blue-100">
                  View current congestion status and capacity for boarding passengers
                </p>
                <div className="text-sm text-blue-100 opacity-75">
                  → Platform Display Screen
                </div>
              </div>
            </Link>

            <Link
              href="/live-feed"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="text-center space-y-4">
                <div className="text-5xl">📹</div>
                <h2 className="text-3xl font-bold">Live Feed</h2>
                <p className="text-purple-100">
                  Monitor real-time video stream from inside the carriage
                </p>
                <div className="text-sm text-purple-100 opacity-75">
                  → Monitoring Dashboard
                </div>
              </div>
            </Link>
          </div>

          <div className="pt-8 text-center text-slate-500 text-sm">
            <p>Powered by Llama LLM for intelligent crowd analysis</p>
          </div>
        </div>
      </main>
    </div>
  );
}
