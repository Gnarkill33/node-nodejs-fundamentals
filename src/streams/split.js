import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { argv } from "node:process";

/* ATTN:
For this function to run correctly source.txt should be created in the root 
*/

const __dirname = dirname(fileURLToPath(import.meta.url));
const __filename = join(__dirname, "../../source.txt");

const split = async () => {
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

 const linesperChunk = parseInt(params.lines) || 10;
 let linesCount = 0;
 let chunkNumber = 1;

 const readableStream = createReadStream(__filename);
 let currentWriteStream = createWriteStream(`chunk_${chunkNumber}.txt`);

 const transformStream = new Transform({
  transform(chunk, _, callback) {
   const lines = chunk.toString().split(".");

   for (const line of lines) {
    if (linesCount === linesperChunk) {
     currentWriteStream.end();
     chunkNumber++;
     currentWriteStream = createWriteStream(`chunk_${chunkNumber}.txt`);
     linesCount = 0;
    }

    currentWriteStream.write(line + "\n");
    linesCount++;
   }

   callback();
  },
 });

 try {
  await pipeline(readableStream, transformStream);
 } catch {
  console.log("Can't split file");
 }
};

await split();
