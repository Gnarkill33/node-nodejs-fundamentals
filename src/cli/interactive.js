import readline from "node:readline";
import { stdout, stdin, cwd, uptime } from "node:process";

const interactive = () => {
 const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: "> ",
 });

 rl.prompt();

 rl
  .on("line", (userInput) => {
   switch (userInput.trim()) {
    case "uptime":
     console.log(`Process uptime: ${uptime().toFixed(2)}s`);
     break;
    case "cwd":
     console.log(`Current working directory: ${cwd()}`);
     break;
    case "date":
     console.log(`Date and time: ${new Date().toISOString()}`);
     break;
    case "exit":
     console.log("Goodbye!");
     process.exit(0);
    default:
     console.log("Unknown command");
     break;
   }
   rl.prompt();
  })
  .on("close", () => {
   console.log("Goodbye!");
  });
};

interactive();
