import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="sticky top-0 left-0 w-full z-50 text-white bg-[#00000047]">
      <div className="max-w-7xl mx-auto px-10 py-6 grid grid-cols-3 items-center orbitron">

        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src={logo} alt="ApexData Logo" className="h-8 md:h-10 object-contain" />
          </Link>
        </div>

        {/* Center - Nav items */}
        <ul className="flex items-center justify-center gap-9 text-md">
          {[
            { name: "Home", path: "/" },
            { name: "Analytics", path: "/analytics" },
            { name: "Strategy", path: "https://dothrishi-ai-f1-strategy-maker-app-mqahah.streamlit.app/" },
            { name: "Contact", path: "#" }
          ].map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="
                  relative cursor-pointer
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0
                  after:bg-[#30ff41]
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
  )
}

export default Navbar