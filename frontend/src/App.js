
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import SystemSelector from "./components/SystemSelector";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SystemSelector />} />
    
      </Routes>
    </Router>
  );
}

export default App;
