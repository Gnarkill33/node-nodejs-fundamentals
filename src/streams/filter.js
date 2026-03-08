import { argv } from "node:process";
import { stdin, stdout } from "node:process";
import { Transform } from "node:stream";

/* ATTN:
To check this function please use the following script: 
"streams:filter": "printf 'hello\\nworld\\ntest' | node src/streams/filter.js --pattern test",
because the original script may not work properly for your system
*/

const filter = () => {
 const args = argv.slice(2);
 const params = {};

 for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
   const key = args[i].slice(2);
   if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
    params[key] = args[i + 1];
    i++;
   }
  }
 }

 const pattern = params.pattern;

 const patternedStream = new Transform({
  transform(chunk, _, callback) {
   const filteredLines = chunk
    .toString()
    .split("\n")
    .filter((line) => line.includes(pattern))
    .join("\n");

   if (filteredLines) {
    callback(null, filteredLines + "\n");
   } else {
    callback();
   }
  },
 });

 stdin.pipe(patternedStream).pipe(stdout);
};

filter();
