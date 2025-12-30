import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DetectImagePage from "./pages/DetectImagePage";
import DetectVideoPage from "./pages/DetectVideoPage";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="detect-image" element={<DetectImagePage />} />
          <Route path="detect-video" element={<DetectVideoPage />} />
          <Route path="train" element={<div>Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
