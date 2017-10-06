const config = {
  consumers: [],
  producers: [],
  psk: process.env.PSK || "pre-shared-key",
  connectionTimeout: parseInt(process.env.TIMEOUT || "", 10) || 3000, // Miliseconds
}

export default config;