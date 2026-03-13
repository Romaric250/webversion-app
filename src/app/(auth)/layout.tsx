export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-background-secondary border-r border-background-tertiary relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background-tertiary/30" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SignNova" className="w-12 h-12 rounded-xl object-contain shadow-lg shadow-primary/20" />
            <span className="text-xl font-bold text-white">SignNova</span>
          </div>

          {/* Main content - centered in remaining space */}
          <div className="flex-1 flex flex-col justify-center py-12 max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-6">
              Breaking barriers in
              <br />
              <span className="text-primary">communication</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Real-time sign language translation for inclusive communication.
              Learn, translate, and connect.
            </p>
            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                'Translate text to sign language instantly',
                'Learn with interactive lessons',
                'Build your vocabulary in the dictionary',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-background-tertiary">
            <p className="text-white/50 text-sm">Powered by Sign Bridge</p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
