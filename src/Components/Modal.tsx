export function Modal() {
  return (
    <div id="gameModal" className="modal">
      <div className="modal-content">
        <h2>Enter Your Name</h2>
        <input type="text" id="playerNameInput" placeholder="Your Name" />
        <div id="gameOptions">
          <button id="createGameBtn">Create Game</button>
          <button id="joinGameBtn">Join Game</button>
        </div>
      </div>
    </div>
  );
}
