import "./App.css";
import HuongDan from "./Components/HuongDan";
import { Modal } from "./Components/Modal";

function App() {
  return (
    <>
      <div id="app">
        <h1>HCMUT Xe Tăng Cuồng Nộ</h1>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
      </div>
      <HuongDan />
      <Modal />
    </>
  );
}

export default App;
