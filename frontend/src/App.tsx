
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import DetectPage from "./pages/DetectPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="detect" element={<DetectPage />} />
          <Route path="train" element={<div>Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
