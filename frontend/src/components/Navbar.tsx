import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Pehchan Kaun?
        </Link>
        <div className="space-x-4">
          <Link to="/detect" className="hover:text-gray-400">
            Detect Image
          </Link>
          <Link to="/train" className="hover:text-gray-400">
            Train Image
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
