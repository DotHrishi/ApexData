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
    
    <div className="flex flex-row gap-4">
    <button onClick={() => window.location.href="/analytics"} className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 font-medium text-neutral-200"><span>Analyze Now</span><div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg></div></button>
        <button onClick={() => window.location.href="/news"} className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-green-600 px-6 font-medium text-neutral-200"><span>Latest News</span><div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></div></button>
</div>
  </div>
</div>

<div className="bg-black py-20 relative z-20">
  <div className="flex flex-col md:flex-row items-center">
    <div className="bg-green-500 w-full md:w-[35%] rounded-r-xl p-12">
      <h2 className="text-3xl font-bold text-black">
        Why Choose ApexData?
      </h2>
    </div>
    <div className="w-full md:w-[65%]">
      <div className="max-w-4xl ml-auto px-8">
        <ul className="list-decimal list-outside pl-6 marker:text-red-600 space-y-4 text-lg text-white orbitron">
          <li>Access a vast database of historical and real-time Formula 1 data.</li>
          <li>Advanced Analytics Tools: Utilize cutting-edge tools to analyze.</li>
          <li>Real-Time Insights: Get up-to-the-minute data and analytics during live races.</li>
          <li>Tailor your analytics experience to focus on the metrics that matter most to you.</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div
  className="
    relative
    left-1/2 right-1/2
    -mx-[50vw]
    w-screen
    min-h-screen
    bg-[url('/hero3-bg.jpg')]
    bg-cover
    bg-center
    bg-no-repeat
    flex
    flex-col
    items-center
    justify-center
    text-white
    text-center
    px-6
  "
>
  <div className="absolute inset-0 bg-black/50"></div>

  <h1 className="relative z-10 text-5xl font-bold">
    Apex<span className="text-red-500">Data</span>
  </h1>

  <p className="relative z-10 max-w-4xl mt-10 text-lg">
    ApexData is a next-generation Formula 1 analytics platform built for fans, engineers, and data-driven race strategists who want more than just lap times and headlines. It brings together real-time race data, historical performance insights, and advanced analytics in one powerful, interactive dashboard—so you can explore strategies, compare drivers and teams, and understand what really happens behind every race result. With ApexData, raw F1 data is transformed into clear, actionable insights that help you see the sport the way professionals do.
  </p>
</div>
<div>
</div>

      <Footer />
    </div>
  )
}

export default HomePage
