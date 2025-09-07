import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import TeamCard from "../components/TeamCard"

const year = new Date().getFullYear();

const Teams = () => {
  return (
    <div>
        <Navbar />
        <h1 className='text-4xl fontStyle p-4 m-4 font-bold'><span className="text-blue-600">{year}</span> TEAMS</h1>
        <TeamCard />
        <Footer />
    </div>
  )
}

export default Teams