import * as WebSocket from "ws";
import { WebSocketQueue } from "queue-protocol";
import config from "./config";
import { hashCode } from "./utils";

/**
 * Generates a WebSocketQueue from a given index. It connects to a producer from the config list.
 * @param index The index of the producer to connect to.
 */
export async function connectToAProducer(index: number) {
  const ws = new WebSocket("ws://"+config.producers[index % config.producers.length]);
  return new Promise<WebSocketQueue>((res, rej) => {
    let opened = false;

    ws.on("open", () => {
      const result = new WebSocketQueue(ws, config.psk);
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

/**
 * Generates a WebSocketQueue from a given topic. It connects to a consumer from the config list, depending on the hash of the topic.
 * @param index The index of the producer to connect to.
 */
export function subscribeToAConsumer(topic: string) {
  const ws = new WebSocket("ws://"+config.consumers[hashCode(topic) % config.consumers.length] + "/" + encodeURIComponent(topic));
  return new Promise<WebSocketQueue>((res, rej) => {
    let opened = false;

    ws.on("open", () => {
      const result = new WebSocketQueue(ws, config.psk);
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
