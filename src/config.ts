const config = {
  consumers: ["192.168.1.126:20001/subscribe", "192.168.1.126:20002/subscribe", "192.168.1.126:20003/subscribe"],
  producers: ["192.168.1.126:10001/produce", "192.168.1.126:10002/produce", "192.168.1.126:10003/produce"],
  psk: process.env.PSK || "pre-shared-key",
  connectionTimeout: parseInt(process.env.TIMEOUT || "", 10) || 3000, // Miliseconds
}

export default config;