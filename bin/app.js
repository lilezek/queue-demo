"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const queue_protocol_1 = require("queue-protocol");
const config_1 = require("./config");
const utils_1 = require("./utils");
/**
 * Generates a WebSocketQueue from a given index. It connects to a producer from the config list.
 * @param index The index of the producer to connect to.
 */
function connectToAProducer(index) {
    return __awaiter(this, void 0, void 0, function* () {
        const ws = new WebSocket("ws://" + config_1.default.producers[index % config_1.default.producers.length]);
        return new Promise((res, rej) => {
            let opened = false;
            ws.on("open", () => {
                const result = new queue_protocol_1.WebSocketQueue(ws, config_1.default.psk);
                opened = true;
                res(result);
            });
            ws.on("error", (e) => {
                if (!opened) {
                    rej(e);
                }
            });
            ws.on("close", (e) => {
                if (!opened) {
                    rej(new Error("Closed before hello finished."));
                }
            });
        });
    });
}
exports.connectToAProducer = connectToAProducer;
/**
 * Generates a WebSocketQueue from a given topic. It connects to a consumer from the config list, depending on the hash of the topic.
 * @param index The index of the producer to connect to.
 */
function subscribeToAConsumer(topic) {
    const ws = new WebSocket("ws://" + config_1.default.consumers[utils_1.hashCode(topic) % config_1.default.consumers.length] + "/" + encodeURIComponent(topic));
    return new Promise((res, rej) => {
        let opened = false;
        ws.on("open", () => {
            const result = new queue_protocol_1.WebSocketQueue(ws, config_1.default.psk);
            opened = true;
            res(result);
        });
        ws.on("error", (e) => {
            if (!opened) {
                rej(e);
            }
        });
        ws.on("close", (e) => {
            if (!opened) {
                rej(new Error("Closed before hello finished."));
            }
        });
    });
}
exports.subscribeToAConsumer = subscribeToAConsumer;
