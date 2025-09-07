import HomePage from "./pages/HomePage.jsx";
import Teams from "./pages/Teams.jsx"
import {Routes, Route} from "react-router-dom";
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/teams" element={<Teams />} />
      </Routes>
    </>
  );
}

export default App;
