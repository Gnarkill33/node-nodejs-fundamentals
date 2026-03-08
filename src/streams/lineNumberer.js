import { stdin, stdout } from "node:process";
import { Transform } from "node:stream";

/* ATTN:
To check this function please use the following script: 
"streams:lineNumberer": "printf 'hello\\nworld' | node src/streams/lineNumberer.js",
because the original script may not work properly for your system
*/

const lineNumberer = () => {
 let lineCount = 1;
 let remainingLine = "";

 const numberedStream = new Transform({
  transform(chunk, _, callback) {
   const data = remainingLine + chunk.toString();
   const lines = data.split("\n");

   remainingLine = lines.pop() || "";

   for (const line of lines) {
    this.push(`${lineCount} | ${line}\n`);
    lineCount++;
   }

   callback();
  },

  flush(callback) {
   if (remainingLine) {
    this.push(`${lineCount} | ${remainingLine}\n`);
   }
   callback();
  },
 });

 stdin.pipe(numberedStream).pipe(stdout);
};

lineNumberer();
