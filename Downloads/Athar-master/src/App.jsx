import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Library from './pages/Library';
import Study from './pages/Study';
import Login_Registertion from "./pages/Login_Registertion";
import List from "./pages/List";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* David */}
          {/* <Route path="/tips" element={} /> */}

          <Route path="/library" element={<Library />} />
          <Route path="/library/:bookId/:hadithId" element={<Study />} />

          {/* <Route path="/login" element={<Login_Registertion />} /> */}
          {/* <Route path="/list" element={<List />} /> */}

          {/* 404 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;