import "./App.css";

import FingerprintCapture from "./pages/fingerprintCapture";
import WebcamList from "./pages/WebcamList";

function App() {
  return (
    <>
      <WebcamList />
      <FingerprintCapture />
    </>
  );
}

export default App;
