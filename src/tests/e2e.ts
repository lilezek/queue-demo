import * as chai from "chai";
import config from "../config";
import { connectToAProducer, subscribeToAConsumer } from "../app";
const expect = chai.expect;

class TimeoutError extends Error {
  constructor(ms: number) {
    super("Timeout of "+ms+" milseconds.");
  }
}

async function PromiseTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((res, rej) => {
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        rej();
      }, ms);

      promise.then((d: T) => {
        if (!timedOut) {
          clearTimeout(timeout);
          res(d);
        }
      }).catch((err) => {
        rej(err);
      });
    });
}


describe("End-to-end testing", () => {
  it("Demo can connect to every producer", async () => {
    for (let i = 0; i < config.producers.length; i++) {
      const producer = await PromiseTimeout(connectToAProducer(i), 500);
      await PromiseTimeout(new Promise<void>((res, rej) => {
        producer.on("open", () => {
          producer.close();
          res();
        }); 
      }), 1000);
    }
  });

  const producerIndex = ~~(Math.random()*config.producers.length);
  const topic = "topic" + Math.round(Math.random()*9);
  it("Writing to " + config.producers[producerIndex] + " producer and reading from " + topic, async () => {
    const producer = await PromiseTimeout(connectToAProducer(producerIndex), 500);
    const consumer = await PromiseTimeout(subscribeToAConsumer(topic), 500);
    await PromiseTimeout(new Promise<void>((res, rej) => {consumer.on("open", () => {res()})}), 500);
    
    const message = (~~(Math.random()*65535)).toString(16);
    producer.send({t: "m", d: message, s: topic});

    await PromiseTimeout(new Promise<void>((res, rej) => {
      consumer.on("message", (d) => {
        expect(d.message).to.be.equal(message);
        expect(d.topic).to.be.equal(topic);
        res();
      });
    }), 1000);

    producer.close();
    consumer.close();
  });

  it("Setting a bad PSK makes every connection to reject.", async () => {
    const realPsk = config.psk;
    config.psk = config.psk + "ñ";
    
    for (let i = 0; i < config.producers.length; i++) {
      const producer = await PromiseTimeout(connectToAProducer(16+i), 500);

      await PromiseTimeout(new Promise<void>((res, rej) => {
        producer.on("error", () => {
          res();
        });
      }), 1000);

      producer.close();
    }

    for (let i = 0; i < config.consumers.length; i++) {
      const consumer = await PromiseTimeout(subscribeToAConsumer(String.fromCharCode(i)), 500);

      await PromiseTimeout(new Promise<void>((res, rej) => {
        consumer.on("error", () => {
          res();
        });
      }), 1000);

      consumer.close();
    }

    config.psk = realPsk;
  });
});
