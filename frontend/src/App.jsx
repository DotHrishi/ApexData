import HomePage from "./pages/HomePage.jsx";
import Teams from "./pages/Teams.jsx"
import Drivers from "./pages/Drivers.jsx";
import AnalyzeData from "./pages/AnalyzeData.jsx"
import TechGuides from "./pages/TechGuides.jsx";
import {Routes, Route} from "react-router-dom";
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/health" />
        <Route path="/analytics" element={<AnalyzeData />} />
        <Route path="/technical_guides" element={<TechGuides />} />
      </Routes>
    </>
  );
}

export default App;
