import React, { useState, useRef } from "react";
import {
  ChevronDown,
  User,
  Settings,
  Cpu,
  Wrench,
  MapPin,
  Award,
  Trophy,
  Calendar,
} from "lucide-react";

const TeamCard = (props) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);

  return (
    <div className={`border ${props.color} rounded-2xl m-4 shadow-lg bg-gradient-to-br text-white hover:shadow-xl transition-shadow duration-300`}>
      {/* Header Section */}
      <div
        className="flex justify-between items-center cursor-pointer p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-extrabold text-3xl tracking-wide">
          {props.teamName}
        </span>
        <ChevronDown
          className={`w-6 h-6 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expandable Section */}
      <div
        ref={contentRef}
        style={{
          maxHeight: expanded ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div className="p-4 rounded-b-2xl">
          <img src={props.image} alt={props.teamName} />

          {/* Modern List */}
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Drivers:</strong> {props.driver1} & {props.driver2}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Team Chief:</strong> {props.teamChief}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Technical Chief:</strong> {props.technicalChief}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Power Unit:</strong> {props.powerUnit}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Chassis:</strong> {props.chassis}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Base:</strong> {props.base}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>World Championships:</strong> {props.worldChampionships}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Podiums:</strong> {props.podiums}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>Reserve Driver:</strong> {props.reserveDriver}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-200" />
              <span className="text-base">
                <strong>First Team Entry:</strong> {props.firstTeamEntry}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
