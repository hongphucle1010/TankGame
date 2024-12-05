// import { WebSocketServer } from "ws";

// const server = new WebSocketServer({ port: 8080 });
// const players: { [id: string]: any } = {};

// server.on("connection", (socket) => {
//   const id = generateUniqueId();
//   players[id] = { socket, tank: null };

//   // Handle incoming messages
//   socket.on("message", (message) => {
//     try {
//       const data = JSON.parse(message.toString());
//       handlePlayerMessage(id, data);
//     } catch (err) {
//       console.error("Failed to parse message:", err);
//     }
//   });

//   // Handle player disconnect
//   socket.on("close", () => {
//     delete players[id];
//     broadcast({ type: "playerDisconnected", id });
//   });

//   // Send initial connection acknowledgment
//   socket.send(JSON.stringify({ type: "connected", id }));
// });

// function handlePlayerMessage(id: string, data: any) {
//   if (data.type === "move") {
//     players[id].tank = data.tank;
//     broadcast({ type: "update", players: Object.values(players).map((p) => p.tank) });
//   } else if (data.type === "shoot") {
//     broadcast({ type: "bullet", bullet: data.bullet });
//   }
// }

// function broadcast(data: any) {
//   Object.values(players).forEach(({ socket }) => {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(JSON.stringify(data));
//     }
//   });
// }

// function generateUniqueId(): string {
//   return Math.random().toString(36).substr(2, 9);
// }

// console.log("WebSocket server running on ws://localhost:8080");
