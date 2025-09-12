import teamsData from "../data/teamsData";
import TeamCard from "../components/TeamCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const year = new Date().getFullYear();

const Teams = () => {
  return (
    <div>
      <Navbar />
      <h1 className="text-4xl fontStyle p-4 m-4 font-bold">
        THE <span className="text-blue-600">{year}</span> TEAMS
      </h1>
      {teamsData.map((team, index) => (
        <TeamCard key={index} {...team} />
      ))}
      <Footer />
    </div>
  );
};

export default Teams;
