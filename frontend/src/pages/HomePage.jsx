import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Hero from "../components/Hero";
import PastResults from "../components/PastResults";
import NewsCard from "../components/UpcomingRace";

const HomePage = () => {
  return (
    <div className="">
    <Navbar />
    <Hero />
    <NewsCard />
    <PastResults />
    <Footer />
    </div>
  )
}

export default HomePage;