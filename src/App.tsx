import { HashRouter, Navigate, Route, Routes } from "react-router";
import Home from "./home";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="Home" />} />
        <Route path="/Home/*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
