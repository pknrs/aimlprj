import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="text-center p-4 border-t border-gray-700 bg-gray-900">
        © 2024 Pehchan Kaun?
      </footer>
    </div>
  );
};

export default Layout;
