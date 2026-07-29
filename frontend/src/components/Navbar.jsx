import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '/logo.png';

const Navbar = () => {
  return (
    <nav className="sticky top-0 left-0 w-full z-50 text-white bg-[#000000] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-10 py-6 grid grid-cols-3 items-center orbitron">

        <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="hidden" />

        <div className="flex items-center gap-2">
          <Link to="/">
            <img src={logo} alt="ApexData Logo" className="h-8 md:h-10 object-contain" />
          </Link>
        </div>

        <ul className="flex items-center justify-center gap-9 text-md text-white">
          {[
            { name: "Home", path: "/" },
            { name: "Analytics", path: "/analytics" },
            { name: "RaceSimAI", path: "/racesim-ai" },
            { name: "News", path: "/news" },
            { name: "Technical", path: "/technical" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="
                  relative cursor-pointer
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-[#ff0000]
                  after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </nav>
  );
};

export default Navbar;