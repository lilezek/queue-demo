import { connectToAProducer, subscribeToAConsumer } from "./app";
import readline = require("readline");

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
async function main() { 
  const consumer = await subscribeToAConsumer(topic);
  const producer = await connectToAProducer(~~(Math.random() * 65535));
  
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
        throw new Error("Wrong topic received.")
      }
      console.log(msg.message);
    });
  });
}

main();