import { spawn } from "node:child_process";
import { argv, stdout, stderr } from "node:process";

const execCommand = () => {
 const commandString = argv[2];
 const [command, ...args] = commandString.split(" ");

 const childProcess = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
 });

 childProcess.stdout.pipe(stdout);

 childProcess.stderr.pipe(stderr);

 childProcess.on("exit", (code) => {
  process.exit(code);
 });
};

execCommand();
