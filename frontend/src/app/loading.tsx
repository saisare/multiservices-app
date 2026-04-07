'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 flex flex-col items-center justify-center">
      {/* Logo/Branding */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">BLG-ENGINEERING</h1>
        <p className="text-slate-300">Système de gestion intégré v3.0</p>
      </div>

      {/* Loading Spinner */}
      <div className="relative w-24 h-24 mb-8">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 border-r-orange-500 rounded-full animate-spin"></div>

        {/* Middle rotating ring */}
        <div className="absolute inset-2 border-4 border-transparent border-b-blue-500 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>

        {/* Inner rotating ring */}
        <div className="absolute inset-4 border-2 border-transparent border-t-green-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
      </div>

      {/* Loading Text */}
      <h2 className="text-2xl font-semibold text-white text-center">
        Initialisation du système
      </h2>
      <p className="text-slate-400 text-center mt-2">Veuillez patienter...</p>

      {/* Progress Bar */}
      <div className="mt-12 w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 rounded-full"
          style={{
            animation: 'slideIn 2s infinite'
          }}
        />
      </div>

      {/* Status Messages */}
      <div className="mt-12 text-center text-sm">
        <div className="text-slate-400">
          ✓ Services de base
        </div>
        <div className="text-slate-500 mt-1">
          ⏳ Chargement des modules...
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            width: 0%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
