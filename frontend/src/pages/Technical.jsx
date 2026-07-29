import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GLOSSARY_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'flags', label: 'Flags Guide' },
  { id: 'tactics', label: 'Strategy & Tactics' },
  { id: 'rules', label: 'F1 Rules & Regulations' },
  { id: 'teams', label: 'Teams & Constructors' },
  { id: 'drivers', label: 'Drivers & Grid' },
];

const GLOSSARY_DATA = [
  // FLAGS GUIDE
  {
    category: 'flags',
    term: 'Green Flag',
    summary: 'Session Active / Track Clear',
    details: 'Indicates that the track is clear of hazards and normal racing conditions are active. It is shown at the start of sessions or immediately after a yellow flag zone to signal that overtaking is permitted again.'
  },
  {
    category: 'flags',
    term: 'Yellow Flag (Single & Double)',
    summary: 'Hazard Ahead / No Overtaking',
    details: 'Single Yellow signals a hazard beside or near the track; drivers must reduce speed and overtaking is strictly prohibited. Double Yellow indicates a hazard blocking or partially blocking the track, or marshals working on track; drivers must slow down significantly and be prepared to stop.'
  },
  {
    category: 'flags',
    term: 'Red Flag',
    summary: 'Session Suspended',
    details: 'Signals that a session or race has been stopped immediately due to severe weather, serious accidents, heavy debris, or barrier repairs. All cars must reduce speed and return slowly to the pit lane.'
  },
  {
    category: 'flags',
    term: 'Blue Flag',
    summary: 'Lapped Car Yield Warning',
    details: 'Shown to a slower driver about to be lapped by a faster car. The driver receiving the blue flag must allow the faster car to pass safely at the earliest opportunity within 3 blue flag marshaling sectors, or face penalty points.'
  },
  {
    category: 'flags',
    term: 'Black & White Diagonal Flag',
    summary: 'Unsportsmanlike Conduct Warning',
    details: 'Acts as a single formal warning to a driver for unsportsmanlike behavior or dangerous driving (such as moving under braking or exceeding track limits repeatedly). Further infractions lead to a penalty.'
  },
  {
    category: 'flags',
    term: 'Black Flag with Orange Disc (Meatball Flag)',
    summary: 'Mechanical Damage Warning',
    details: 'Informs a driver that their car has mechanical issues or loose bodywork (such as a damaged wing) that poses a safety risk. The driver must enter the pit lane on the next lap to repair the damage.'
  },
  {
    category: 'flags',
    term: 'Black Flag',
    summary: 'Disqualification',
    details: 'Signals that a driver has been disqualified from the session or race and must return to the pit garage immediately. Issued for serious technical or sporting rule violations.'
  },
  {
    category: 'flags',
    term: 'Yellow & Red Striped Flag',
    summary: 'Slippery Surface Warning',
    details: 'Displayed to warn drivers that track grip is reduced due to water, oil, gravel, or debris on the track surface.'
  },
  {
    category: 'flags',
    term: 'Chequered Flag',
    summary: 'End of Session / Race Finish',
    details: 'Waved at the finish line to mark the official conclusion of practice sessions, qualifying, or the Grand Prix.'
  },

  // STRATEGY & TACTICS
  {
    category: 'tactics',
    term: 'Undercut',
    summary: 'Early Pit Stop Tactical Advantage',
    details: 'A strategic maneuver where a driver pits earlier than their rival ahead. By putting on fresh, grippier tyres a lap or two earlier, the driver sets much faster lap times in clean air. When the rival eventually pits on the next lap, the driver on fresh tyres sweeps past to gain track position.'
  },
  {
    category: 'tactics',
    term: 'Overcut',
    summary: 'Late Pit Stop Extended Stint',
    details: 'The opposite of an undercut. A driver stays out longer on used tyres to build a gap while rivals suffer traffic, cold tyre warm-up issues, or out-lap delays after pitting. Effective when tyre degradation is very low or out-lap warm-up is difficult.'
  },
  {
    category: 'tactics',
    term: 'Slipstream (Drafting)',
    summary: 'Aerodynamic Drag Reduction',
    details: 'When a car follows closely behind another on a straight line, the lead car pushes through the air mass, creating a partial vacuum pocket behind it. The trailing car experiences less aerodynamic drag, allowing it to reach higher top speeds and execute overtaking maneuvers.'
  },
  {
    category: 'tactics',
    term: 'Dirty Air',
    summary: 'Turbulent Aerodynamic Wake',
    details: 'The disturbed, turbulent air left behind an F1 car. Following cars traveling through dirty air lose aerodynamic downforce, experience reduced front-end grip, and suffer higher tyre degradation and engine overheating.'
  },
  {
    category: 'tactics',
    term: 'Clean Air',
    summary: 'Undisturbed Aerodynamic Flow',
    details: 'Smooth, undisturbed airflow over a car traveling with no other cars closely ahead. Allows the front wing, floor, and rear wing to generate maximum downforce and optimal cooling.'
  },
  {
    category: 'tactics',
    term: 'Lift and Coast',
    summary: 'Fuel & Component Management Technique',
    details: 'A driving technique where the driver eases off the throttle several hundred meters before the braking zone, allowing aerodynamic drag to slow the car down before applying brakes. Used to conserve fuel, reduce engine temperature, and manage brake wear.'
  },
  {
    category: 'tactics',
    term: 'Tyre Degradation (Deg)',
    summary: 'Performance Loss Over Time',
    details: 'The physical wearing down of tyre compound rubber over consecutive laps, caused by friction, cornering loads, and thermal heat. Results in increased lap times and loss of cornering grip.'
  },
  {
    category: 'tactics',
    term: 'Graining',
    summary: 'Surface Tyre Wear Phenomenon',
    details: 'Occurs when small pieces of rubber tear off the tyre tread due to lateral forces and stick back onto the hot tyre surface, forming small ripples. Graining reduces cornering grip and driver feel until the tread cleans up.'
  },
  {
    category: 'tactics',
    term: 'Blistering',
    summary: 'Thermal Tyre Core Overheating',
    details: 'Occurs when the internal carcass of a tyre overheats while the outer surface remains cooler. The trapped heat causes gas bubbles to expand, tearing holes in the outer tread rubber and severely reducing performance.'
  },
  {
    category: 'tactics',
    term: 'Out-Lap & In-Lap',
    summary: 'Pit Stop Transition Laps',
    details: 'The In-Lap is the lap completed right before entering the pit lane. The Out-Lap is the lap executed immediately after leaving the pit lane on fresh tyres. Maximizing out-lap speed is critical for successful undercut execution.'
  },
  {
    category: 'tactics',
    term: 'Lock-Up',
    summary: 'Braking Tyre Skidding',
    details: 'Occurs under heavy braking when brake force exceeds tyre traction, causing one or more wheels to stop rotating while the car is still moving. Creates flat spots on the tyre tread that cause severe chassis vibrations.'
  },
  {
    category: 'tactics',
    term: 'Apex',
    summary: 'Inner Corner Racing Line Target',
    details: 'The geometric innermost point of a corner where the car gets closest to the inside curb. Hitting the apex at the correct angle allows a driver to maintain maximum minimum speed and accelerate early out of the corner.'
  },

  // F1 RULES & REGULATIONS
  {
    category: 'rules',
    term: 'DRS (Drag Reduction System)',
    summary: 'Adjustable Rear Wing Overtaking Aid',
    details: 'A driver-controlled flap on the rear wing that opens on designated straightaways to reduce aerodynamic drag and boost top speed by 10-12 km/h. Enabled only when a trailing car is within 1.0 second of the leading car at the designated detection line during dry racing.'
  },
  {
    category: 'rules',
    term: 'Mandatory Two-Compound Dry Rule',
    summary: 'Race Tyre Usage Requirement',
    details: 'In dry race conditions, every driver who finishes the race must use at least two different slick dry compound specifications (e.g. Medium and Hard, or Soft and Hard). Wet or Intermediate tyre usage waives this requirement.'
  },
  {
    category: 'rules',
    term: 'Qualifying Format (Q1, Q2, Q3)',
    summary: 'Grid Position Elimination System',
    details: 'Qualifying consists of three knockout sessions. Q1 runs for 18 minutes (slowest 5 drivers eliminated, forming grid 16-20). Q2 runs for 15 minutes (slowest 5 eliminated, forming grid 11-15). Q3 runs for 12 minutes among the top 10 drivers to decide Pole Position.'
  },
  {
    category: 'rules',
    term: 'Sprint Qualifying & Sprint Race',
    summary: 'Shortened 100km Saturday Race',
    details: 'Select Grand Prix weekends host a 100km Sprint Race on Saturday following a Sprint Shootout qualifying session. The top 8 finishers in the Sprint earn championship points (8 points for 1st down to 1 point for 8th).'
  },
  {
    category: 'rules',
    term: 'Parc Fermé Regulations',
    summary: 'Car Setup Modification Freeze',
    details: 'A secure area and regulatory state starting when cars exit pit lane for Qualifying. Team mechanics are forbidden from altering suspension geometry, engine maps, wing angles, or major setup parameters until the race start.'
  },
  {
    category: 'rules',
    term: 'Safety Car (SC) & Virtual Safety Car (VSC)',
    summary: 'Race Pace Control Systems',
    details: 'The Physical Safety Car leads the field at reduced speeds during major track clearances. The Virtual Safety Car (VSC) requires all drivers to maintain a mandatory delta time around the entire track without needing a physical car on track.'
  },
  {
    category: 'rules',
    term: 'Cost Cap Financial Regulations',
    summary: 'Annual Team Budget Ceiling',
    details: 'An FIA enforced annual spending ceiling (baseline ~$135M USD per team) governing performance-related expenditure including car development, manufacturing, and trackside operations.'
  },
  {
    category: 'rules',
    term: 'Power Unit Component Allocations',
    summary: 'Engine Penalty Thresholds',
    details: 'Each car is limited to a fixed annual quota of Power Unit components (Internal Combustion Engine, Turbocharger, MGU-K, MGU-H, Energy Store, and Control Electronics). Exceeding quotas triggers grid position penalties.'
  },
  {
    category: 'rules',
    term: 'Track Limits',
    summary: 'White Boundary Line Enforcement',
    details: 'Drivers must keep at least one wheel on or inside the white boundary lines surrounding the circuit at all times. Exceeding track limits during qualifying deletes the lap time. In races, 3 strikes yield a black-and-white warning flag, and 4 strikes yield a 5-second time penalty.'
  },

  // TEAMS & CONSTRUCTORS
  {
    category: 'teams',
    term: 'Oracle Red Bull Racing',
    summary: 'Milton Keynes, United Kingdom (Honda RBPT Engine)',
    details: 'Premier championship-winning team known for cutting-edge aerodynamic design led by Adrian Newey and relentless pit stop efficiency.'
  },
  {
    category: 'teams',
    term: 'Scuderia Ferrari',
    summary: 'Maranello, Italy (Ferrari Power Unit)',
    details: 'The oldest and most successful team in Formula 1 history, competing in every single World Championship season since 1950.'
  },
  {
    category: 'teams',
    term: 'Mercedes-AMG PETRONAS F1 Team',
    summary: 'Brackley & Brixworth, United Kingdom (Mercedes Power Unit)',
    details: 'Dominant era champions who secured eight consecutive Constructors World Championships from 2014 through 2021.'
  },
  {
    category: 'teams',
    term: 'McLaren F1 Team',
    summary: 'Woking, United Kingdom (Mercedes Power Unit)',
    details: 'Historic British team founded by Bruce McLaren, boasting multiple legendary drivers including Senna, Prost, and Hakkinen.'
  },
  {
    category: 'teams',
    term: 'Aston Martin Aramco F1 Team',
    summary: 'Silverstone, United Kingdom (Mercedes Power Unit)',
    details: 'Ambitious team based at a state-of-the-art Silverstone technology campus, featuring world champion drivers and strong technical investment.'
  },
  {
    category: 'teams',
    term: 'Alpine F1 Team',
    summary: 'Enstone, UK & Viry-Châtillon, France (Renault Power Unit)',
    details: 'The works Formula 1 entry representing the Renault Group brand with dual chassis and power unit facilities in England and France.'
  },
  {
    category: 'teams',
    term: 'Williams Racing',
    summary: 'Grove, United Kingdom (Mercedes Power Unit)',
    details: 'Iconic independent British team founded by Sir Frank Williams, winner of 9 Constructors Championships and 7 Drivers Championships.'
  },
  {
    category: 'teams',
    term: 'Visa Cash App RB (RB / AlphaTauri)',
    summary: 'Faenza, Italy (Honda RBPT Engine)',
    details: 'Red Bull sister team dedicated to developing top motorsport talent and competing as a high-tech midfield contender.'
  },
  {
    category: 'teams',
    term: 'Stake F1 Team Kick Sauber',
    summary: 'Hinwil, Switzerland (Ferrari Power Unit)',
    details: 'Swiss engineering squad operating out of Hinwil, preparing for transition into the Audi factory entry in 2026.'
  },
  {
    category: 'teams',
    term: 'MoneyGram Haas F1 Team',
    summary: 'Kannapolis, US & Banbury, UK (Ferrari Power Unit)',
    details: 'The sole American constructor on the grid, utilizing an efficient technical partnership model with Ferrari and Dallara.'
  },

  // DRIVERS & GRID
  {
    category: 'drivers',
    term: 'Lead Driver & Teammate Dynamics',
    summary: 'Internal Team Structure',
    details: 'Each team fields two identical cars. While drivers work together to score Constructors points, their teammate is their primary baseline benchmark, as they drive the exact same equipment.'
  },
  {
    category: 'drivers',
    term: 'FIA Superlicence System',
    summary: 'Driver Qualification Points',
    details: 'A qualification licence issued by the FIA. Drivers must accumulate at least 40 Superlicence points over three seasons in junior categories (F2, F3, IndyCar) and log 300 km in a modern F1 car to qualify.'
  },
  {
    category: 'drivers',
    term: 'Driver & Ballast Weight Minimums',
    summary: '80kg Minimum Driver & Seat Weight',
    details: 'Regulations dictate a minimum driver + seat weight of 80 kg. Lighter drivers must carry ballast added directly into the cockpit seat area to prevent weight-based unfair physical advantages.'
  },
  {
    category: 'drivers',
    term: 'Reserve & Test Drivers',
    summary: 'Backup & Development Drivers',
    details: 'Contracted backup drivers who execute simulator setup development, test aerodynamic parts, and stand in immediately if a race driver is injured or unfit.'
  }
];

const Technical = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTerms = GLOSSARY_DATA.filter((item) => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white orbitron tracking-tight">
              TECHNICAL
            </h1>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60 font-mono text-xs scrollbar-none">
          {GLOSSARY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40 orbitron'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Glossary Textual Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((item, idx) => (
              <div
                key={`${item.term}-${idx}`}
                className="bg-zinc-950/80 border border-zinc-800/80 hover:border-red-600/40 rounded-xl p-5 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="mb-2">
                    <h2 className="text-base font-bold text-white orbitron tracking-wide">
                      {item.term}
                    </h2>
                  </div>

                  <h3 className="text-xs font-semibold text-red-400 font-mono mb-3">
                    {item.summary}
                  </h3>

                  <p className="text-xs text-zinc-300 font-inter leading-relaxed whitespace-pre-line">
                    {item.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
              No matching F1 terms found for this category.
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Technical;