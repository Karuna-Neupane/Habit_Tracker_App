// A minimal footer — just a copyright line and tagline, roughly navbar-height.
// Used on Login/Register and on every authenticated page. The rich, full
// Footer (components/Footer.jsx) stays exclusive to the public Home page.

export default function SimpleFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-paperLine bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-2 px-4 py-5 text-xs text-inkSoft md:grid-cols-[1fr_2fr_1fr]">
        
        {/* Left */}
        <p className="text-center md:text-left whitespace-nowrap">
          © {year} Habitra.
        </p>

        {/* Center */}
        <p className="text-center whitespace-nowrap">
          Built with React, Tailwind CSS, Node.js, Express, MongoDB, JWT and Gemini API.
        </p>

        {/* Right */}
        <p className="text-center font-mono md:text-right whitespace-nowrap">
          Track · Streak · Improve
        </p>

      </div>
    </footer>
  )
}