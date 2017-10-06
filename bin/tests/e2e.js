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
const chai = require("chai");
const config_1 = require("../config");
const app_1 = require("../app");
const expect = chai.expect;
class TimeoutError extends Error {
    constructor(ms) {
        super("Timeout of " + ms + " milseconds.");
    }
}
function PromiseTimeout(promise, ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            let timedOut = false;
            const timeout = setTimeout(() => {
                timedOut = true;
                rej();
            }, ms);
            promise.then((d) => {
                if (!timedOut) {
                    clearTimeout(timeout);
                    res(d);
                }
            }).catch((err) => {
                rej(err);
            });
        });
    });
}
describe("End-to-end testing", () => {
    it("Demo can connect to every producer", () => __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < config_1.default.producers.length; i++) {
            const producer = yield PromiseTimeout(app_1.connectToAProducer(i), 500);
            yield PromiseTimeout(new Promise((res, rej) => {
                producer.on("open", () => {
                    producer.close();
                    res();
                });
            }), 1000);
        }
    }));
    const producerIndex = ~~(Math.random() * config_1.default.producers.length);
    const topic = "topic" + Math.round(Math.random() * 9);
    it("Writing to " + config_1.default.producers[producerIndex] + " producer and reading from " + topic, () => __awaiter(this, void 0, void 0, function* () {
        const producer = yield PromiseTimeout(app_1.connectToAProducer(producerIndex), 500);
        const consumer = yield PromiseTimeout(app_1.subscribeToAConsumer(topic), 500);
        yield PromiseTimeout(new Promise((res, rej) => { consumer.on("open", () => { res(); }); }), 500);
        const message = (~~(Math.random() * 65535)).toString(16);
        producer.send({ t: "m", d: message, s: topic });
        yield PromiseTimeout(new Promise((res, rej) => {
            consumer.on("message", (d) => {
                expect(d.message).to.be.equal(message);
                expect(d.topic).to.be.equal(topic);
                res();
            });
        }), 1000);
        producer.close();
        consumer.close();
    }));
    it("Setting a bad PSK makes every connection to reject.", () => __awaiter(this, void 0, void 0, function* () {
        const realPsk = config_1.default.psk;
        config_1.default.psk = config_1.default.psk + "ñ";
        for (let i = 0; i < config_1.default.producers.length; i++) {
            const producer = yield PromiseTimeout(app_1.connectToAProducer(16 + i), 500);
            yield PromiseTimeout(new Promise((res, rej) => {
                producer.on("error", () => {
                    res();
                });
            }), 1000);
            producer.close();
        }
        for (let i = 0; i < config_1.default.consumers.length; i++) {
            const consumer = yield PromiseTimeout(app_1.subscribeToAConsumer(String.fromCharCode(i)), 500);
            yield PromiseTimeout(new Promise((res, rej) => {
                consumer.on("error", () => {
                    res();
                });
            }), 1000);
            consumer.close();
        }
        config_1.default.psk = realPsk;
    }));
});
