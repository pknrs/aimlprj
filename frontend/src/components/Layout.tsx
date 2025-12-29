
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="text-center p-4 border-t border-gray-700">
        © 2024 Pehchan Kaun?
      </footer>
    </div>
  );
};

export default Layout;
