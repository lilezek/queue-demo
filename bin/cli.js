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
const app_1 = require("./app");
const readline = require("readline");
const args = process.argv;
function usage() {
    console.log("Usage: \n" + args[0] + " TOPIC");
}
// Expect at least one argument.
if (args.length < 3) {
    usage();
    process.exit(127);
}
// The argument is the topic:
const topic = args[2];
// Open two websockets:
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = yield app_1.subscribeToAConsumer(topic);
        const producer = yield app_1.connectToAProducer(~~(Math.random() * 65535));
        producer.on("open", () => {
            console.log("Connected and ready to send data: ");
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false
            });
            // Send every input line to the producer 
            rl.on('line', function (line) {
                producer.send({ t: "m", d: line, s: topic });
            });
            // Print every line from the subscriber:
            consumer.on("message", (msg) => {
                // Assert topic.
                if (topic !== msg.topic) {
                    throw new Error("Wrong topic received.");
                }
                console.log(msg.message);
            });
        });
    });
}
main();
