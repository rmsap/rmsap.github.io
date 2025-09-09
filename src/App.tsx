import { HashRouter, Navigate, Route, Routes } from "react-router";
import Home from "./home";
import ScrollToHash from "./components/ScrollToHash";

function App() {
  return (
    <HashRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Navigate to="Home" />} />
        <Route path="/Home/*" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
