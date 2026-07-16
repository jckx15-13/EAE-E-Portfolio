console.log("WebSocket is available:", typeof globalThis.WebSocket !== "undefined");
console.log("WebSocket type:", typeof globalThis.WebSocket);
if (typeof globalThis.WebSocket !== "undefined") {
  console.log("WebSocket constructor name:", globalThis.WebSocket.name);
}
