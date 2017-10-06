# WebSocket based queue system

This is the documentation of the scenario of WebSocket based queue system. It features scalable, balanced, docker-image microservices which are connected 
together using WebSockets, using an auth-based protocol.

![Model](https://raw.githubusercontent.com/lilezek/queue-demo/master/doc/model.png)

* [Producers](https://github.com/lilezek/queue-producer) Every producer listens to messages, and then it sends the message to a consumer.
* [Consumer](https://github.com/lilezek/queue-consumer) Every consumer listens to messages from producers, and then it sends the message to all the subscribers.
* [queue-protocol](https://github.com/lilezek/websocket-queue) Repository with the comm protocol, based on WebSockets.
* Demo (this repo). It connects to a random producer and the given consumer to produce messages, and to get them back to test the system.

See [this video of the usage](https://github.com/lilezek/queue-demo/blob/master/demo.ogv?raw=true).

# Scalability and balance.
The scalability and the balance of the system is based on the ease of making multiple instances of producers and consumers. Every producer
client (demo) can connect to any producer.

Every produced message is **inside a topic**. This means that a client can subscribe to a consumer to listen to a **topic**, and will not
receive any other message from any other topic.

Consumer scalability is based on exploiting the topic distribution. For a given message:

```js
message = "Hi"
topic = "topic1"
```

The producer generates a hash from the topic and then uses that hash to select a consumer, example in pseudocode:

```js
h = hash(topic)
consumers[h % consumers.length].send(message, topic)
```

This way we could expect that different messages from different topics may fall into different consumers, balancing the CPU, memory and 
network usage.

# Deployment

## Docker based deployment.

The deployment of the scenario must be done in this order:

1. Consumers must be deployed first. For this, build the docker image of the consumer, and deploy some instances.
2. Then producers must be configured. At queue-producer in [src/config.ts](https://github.com/lilezek/queue-producer/blob/8cfe6a15ff9b9c0a4030c7fe240577fbd3e19bbe/src/config.ts), the array
of consumers must contain string based addresses like `192.168.1.126:10001/producer`.
3. After configuration, build the docker image of the producer, and deploy some instances.
4. Repeat the same with the demo config. At queue-demo in [src/config.ts](https://github.com/lilezek/queue-demo/blob/7fb374833538450c0d26e8b8673219032e1ab623/src/config.ts),
populate the arrays of consumers and producers. 
5. With the configuration filled, either build the docker image of the demo or just compile typescript `npm run build` and then run tests
`npm test` or run interactive terminal `npm run TOPIC`.

# Protocol

The protocol begins with a WebSocket based connection (using [ws](https://www.npmjs.com/package/ws) library). After establishing the initial
connection, before sending any data, both ends must answer a challenge.

Which data travels on every message [is here](https://github.com/lilezek/websocket-queue/blob/master/src/messages.ts). Subscribe and 
unsubscribe packets are unused right now.

## Hello

![Model](https://raw.githubusercontent.com/lilezek/queue-demo/master/doc/hello.png)

Each endpoint sends a `once` (a random number) and then expects a response with this content:

```
answer = SHA256hash(hex(once) + psk)
```

Note: `psk` means pre shared key. Every node must know this value, it is private and it must be protected. It can be changed in `config.ts`
on every service (demo, producer and consumer).

## Message

![Model](https://raw.githubusercontent.com/lilezek/queue-demo/master/doc/demo.png)

Here, a demo `demo1` is connected to a producer X, and a `demo2` is listening to a topic at the consumer Y.

1. `demo1` subscribes to a topic. If it subscribes to consumer Y is becase `hash(topic) % consumers = Y`. 
2. `demo2` also subscribes to the same topic.
3. Any time after, `demo1` produces and sends a message **to any producer** (in this case producer X), with the same topic as in 1 and 2.
4. The producer generates the same hash, and send the message to the consumer Y.
5. Then the subscriber Y sends the message to `demo1` and `demo2` because they are subscribed to that topic.
6. Same as above.


## Endpoints

### Consumer
The consumer have two endpoints, based on queue-protocol.

* `producer` Every producer must connect to this endpoint. It expects messages here.
* `subscribe/:topic` Every client (demo) may connect to this endpoint to subscribe to that topic.

### Producer
The producer have an endpoint, based also on queue-protocol.

* `produce` Every client (demo) may connect here to produce new messages.

### Demo
Has no endpoints.

# Testing

The testing is based on mocha and chai, used on node with node-ts to test using TypeScript code.

## E2E testing using mocha and chai

This project have an small set of tests. These do:

1. Connect to every producer to see if they are working or not.
2. Sending a random message to a random topic to see if we can get it back unmodified.
3. Trying to connect to every producer/consumer with a wrong PSK, and expect it to fail.

In order to execute the test, the consumers and producers must be deployed, and the demo must be properly configured. Then:

```
npm test
```

over demo node will run testing.

# Conclusion and future roads

The lack of time didn't let me to make a better scenario. If I would have more time, I would added Amazon Elastic Beanstalk support to the 
nodes, I would made a more secure protocol (using TLS, for instance), and I would have written unit tests for every node, plus the E2E 
testing. 
