import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <div className="bg-black">
      <Navbar />

      <div className="relative min-h-screen overflow-hidden bg-black">
  

<div
  className="
    absolute inset-0
    bg-[linear-gradient(115deg,_#000_35%,_#08152e_60%,_#0b1c3f_100%)]
    pointer-events-none
  "
/>


<div
  className="
    absolute -bottom-56 -right-56
    w-[1000px] h-[1000px]
   bg-gradient-to-r from-black-400 from-10% via-red-500 via-30% to-blue-600 to-70% ...
  "
/>


<div
  className="
    absolute inset-0
    bg-[radial-gradient(ellipse_at_top_left,rgba(0,0,0,0.85),transparent_65%)]
    pointer-events-none
  "
/>



  <div className="relative z-10 text-white px-10 pt-40 max-w-4xl">
    <h1 className="text-7xl font-bold tracking-tight mb-7">
      Your gateway to <br />
      advanced <span className="text-red-500">F1</span> analytics.
    </h1>

    <p className="text-xl text-gray-300 max-w-2xl mb-7">
      Analyze every aspect of Formula 1 with our advanced analytics platform. From real-time telemetry to historical data analysis, gain insights that can help you make informed decisions.
    </p>
    
    <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-red-600/90 px-6 font-medium text-neutral-200"><span>Analyze Now !</span><div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></div></button>
  </div>
</div>


  <div className="bg-black py-20 relative z-20">
    <div className="container mx-auto px-10">
      <h2 className="text-4xl text-white font-orbitron font-bold text-center mb-16 relative">
        <span className="bg-clip-text text-transparent bg-red-500">
          Advanced Telemetry Analysis
        </span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        <div className="p-8 group">
          <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-colors">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-xl text-white font-bold mb-4 font-orbitron">Real-Time Data</h3>
          <p className="text-gray-400 leading-relaxed">
            Access live timing, tire data, and weather conditions directly from the track. Stay ahead with millisecond-precision updates.
          </p>
        </div>


        <div className="p-8 group">
          <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-colors">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 className="text-xl text-white font-bold mb-4 font-orbitron">Historical Analysis</h3>
          <p className="text-gray-400 leading-relaxed">
            Dive deep into past seasons (2018-2025). Compare race strategies, pit stops, and lap times across eras.
          </p>
        </div>


        <div className="p-8 group">
           <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600/20 transition-colors">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="text-xl text-white font-bold mb-4 font-orbitron">Driver Comparison</h3>
          <p className="text-gray-400 leading-relaxed">
            Head-to-head telemetry. Overlay speed traces to see exactly where Verstappen gains time or Hamilton brakes later.
          </p>
        </div>
      </div>
    </div>
  </div>


  <div className="bg-black py-24 relative overflow-hidden">

    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[100px] rounded-full"></div>
    </div>

    <div className="container mx-auto px-10 relative z-10 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl text-white font-bold mb-6 font-orbitron leading-tight">
                Built for <span className="text-green-500">Motorsport</span> Enthusiasts
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                ApexData bridges the gap between complex raw telemetry and visual understanding. Whether you're a data scientist or a die-hard F1 fan, our platform gives you the tools to understand the *why* behind the *what*.
            </p>
             <Link to="/analytics" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-green-500 px-8 font-medium text-black hover:bg-gray-200 transition-colors">
                <span className="mr-2">Start Analyzing</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </Link>
        </div>
        

        <div className="md:w-1/2 relative">
            <div className="relative z-10 bg-gray-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 w-3/4 bg-gray-700/50 rounded"></div>
                    <div className="h-32 w-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded border border-white/5 flex items-end p-2 gap-1">
                        <div className="w-1/5 h-1/3 bg-blue-500/50 rounded-t"></div>
                        <div className="w-1/5 h-1/2 bg-blue-500/60 rounded-t"></div>
                        <div className="w-1/5 h-2/3 bg-blue-500/70 rounded-t"></div>
                        <div className="w-1/5 h-full bg-blue-500/80 rounded-t"></div>
                        <div className="w-1/5 h-3/4 bg-blue-500/60 rounded-t"></div>
                    </div>
                     <div className="h-2 w-1/2 bg-gray-700/50 rounded"></div>
                </div>
            </div>
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10"></div>
        </div>
    </div>
  </div>

      <Footer />
    </div>
  )
}

export default HomePage
