"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    consumers: [],
    producers: [],
    psk: process.env.PSK || "pre-shared-key",
    connectionTimeout: parseInt(process.env.TIMEOUT || "", 10) || 3000,
};
exports.default = config;
