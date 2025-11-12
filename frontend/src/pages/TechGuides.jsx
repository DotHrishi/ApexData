import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TechGuides = () => {
  return (
    <div className="">
      <Navbar />
      <div className="m-4 p-4">
        <h1 className="fontStyle text-4xl font-bold">
          POPULAR <span className="text-blue-600">TERMS</span>
        </h1>
        <div className="bg-black text-white p-4 border-2 border-blue-600 rounded-2xl m-4">
          <p className="pt-3 text-xl">
            Here are some basic terms used in Formula 1:
          </p>
          <ol className="p-3 m-4 list-decimal space-y-3 text-lg gap-5">
            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Grid</h2>
            </li>
            <div className="flex flex-row">
              <p className="p-3 m-3">
                The grid is the lineup of cars at the start of a Formula 1 race.
                It is determined by the drivers’ qualifying times, with the
                fastest driver starting at the very front and the rest arranged
                in descending order of speed. The grid is crucial because
                starting closer to the front gives a better chance to control
                the race and avoid mid-pack traffic or incidents.
              </p>
              <img
                src="./terms-demonstration/grid.webp"
                alt="grid"
                className="w-125"
              />
            </div>

            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Pole Position</h2>
            </li>
            <div className="flex flex-row">
              <img
                src="./terms-demonstration/pole-position.avif"
                alt="grid"
                className="w-125"
              />
              <p className="p-3 m-3">
                Pole position is the top spot on the starting grid, earned by
                the driver who sets the fastest lap time during qualifying.
                Starting from pole is a huge advantage, as it gives the driver a
                clear track ahead and the best chance to lead into the first
                corner — often setting the tone for the rest of the race.
              </p>
            </div>

            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Points System</h2>
            </li>
            <div className="flex flex-row">
              <p className="p-3 m-3">
                In Formula 1, drivers and teams earn points based on where they
                finish in a race. The winner gets 25 points, second place earns
                18, third gets 15, and the points decrease down to 1 point for
                10th place. There’s also a bonus point for the fastest lap, as
                long as the driver finishes inside the top 10. These points
                decide both the Drivers’ Championship (individual title) and the
                Constructors’ Championship (team title) across the season.
              </p>
            </div>

            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Out Lap</h2>
            </li>
            <div className="flex flex-row">
              <p className="p-3 m-3">
                An out lap is the lap a driver completes after leaving the pit
                lane before starting a timed run. During an out lap, drivers
                focus on warming up their tires, brakes, and getting the car
                into the right rhythm for maximum performance. It’s not about
                speed — it’s about preparation, making sure everything is ready
                for the fast flying lap that follows.
              </p>
            </div>

            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Flying Lap</h2>
            </li>
            <div className="flex flex-row">
              <p className="p-3 m-3">
                A flying lap is a driver’s fastest possible lap, usually during
                qualifying, where they push the car to its absolute limit.
                Unlike the out lap, this lap is done at full speed from start to
                finish, aiming to set the best time and secure a strong position
                on the starting grid. Every detail matters — from tire
                temperature to braking points — as even a small mistake can cost
                valuable tenths of a second.
              </p>
            </div>

            <li className="flex flex-row">
              <h2 className="text-red-600 text-2xl">Flags</h2>
            </li>
            <div className="gap-5">
              <p className="p-3 m-3">
                Flags are used to communicate track conditions to drivers.
                Here’s what each one means:
                <ol className="gap-12 p-3">
                  <li>
                    <span className="text-[#d000ff]">Checkered Flag: </span>Race
                    or session has ended.
                  </li>
                  <li>
                    <span className="text-[#d000ff]">Yellow Flag: </span>
                    Caution! Slow down and no overtaking — there’s danger on
                    track (like an accident).
                  </li>
                  <li>
                    <span className="text-[#d000ff]">Green Flag: </span>Track is
                    clear, normal racing can resume / Race Start - Lights Out
                    and Away We Go!
                  </li>
                  <li>
                    <span className="text-[#d000ff]">Blue Flag: </span>A faster
                    car is approaching to lap you — let them pass safely.
                  </li>
                  <li>
                    <span className="text-[#d000ff]">Red Flag: </span>Session
                    stopped due to severe crash, debris, or dangerous
                    conditions.
                  </li>
                  <li>
                    <span className="text-[#d000ff]">White Flag: </span>Slow
                    vehicle or safety car ahead on track.
                  </li>
                  <li>
                    <span className="text-[#d000ff]">
                      Striped Green & White Flag:{" "}
                    </span>
                    Slippery track (due to rain, oil, etc.).
                  </li>
                  <li>
                    <span className="text-[#d000ff]">
                      Black & White Flag (Diagonal):{" "}
                    </span>
                    Warning for unsportsmanlike behavior — like a final warning
                    before a penalty.
                  </li>
                  <li>
                    <span className="text-[#d000ff]">Black Flag: </span>Driver
                    must return to the pits immediately (disqualification).
                  </li>
                  <li>
                    <span className="text-[#d000ff]">
                      Black with Orange Circle:{" "}
                    </span>
                    Mechanical issue with the car, driver must pit for repairs.
                  </li>
                </ol>
              </p>
              <img
                src="./terms-demonstration/flags.png"
                alt="grid"
                className="w-145 h-85"
              />
            </div>
          </ol>

          <li className="flex flex-row m-4">
            <h2 className="text-red-600 text-2xl">
              Slipstream (Also called “Tow”)
            </h2>
          </li>
          <div className="flex flex-row">
            <p className="p-3 m-3">
              The slipstream is the low-pressure air pocket that forms directly
              behind a fast-moving car. When another car follows closely behind,
              it encounters less air resistance (drag) — allowing it to go
              faster on the straight with less power.
            </p>
          </div>

          <li className="flex flex-row m-4">
            <h2 className="text-red-600 text-2xl">Undercut</h2>
          </li>
          <div className="flex flex-row">
            <p className="p-3 m-3">
              The undercut is a race strategy where a driver pits earlier than
              the car ahead to gain time on fresher tires, hoping to overtake
              when the other car pits later. In short: “Pit early, go faster on
              new tires, and jump your rival when they pit.”
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TechGuides;
