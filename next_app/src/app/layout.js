import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Disaster Awareness - Global AI Intelligence',
  description: 'AI-powered disaster monitoring, predictive flood mapping, and real-time emergency intelligence platform protecting communities worldwide.',
  openGraph: {
    title: 'Disaster Awareness',
    description: 'AI-powered disaster monitoring and predictive intelligence.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Inter for typography + Material Symbols for icons */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#F3F4F6] text-[#111827]">
        <Navbar />

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  )
}
