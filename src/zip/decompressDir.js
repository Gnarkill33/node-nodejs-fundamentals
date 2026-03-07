import { mkdir, access, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createBrotliDecompress } from "node:zlib";
import { pipeline } from "node:stream/promises";

const decompressDir = async () => {
 const workspaceDir = resolve("workspace");
 const sourceDir = join(workspaceDir, "compressed");
 const archivePath = join(sourceDir, "archive.br");
 const targetDir = join(workspaceDir, "decompressed");

 try {
  await access(sourceDir);
  await access(archivePath);
  await mkdir(targetDir, { recursive: true });

  let leftover = Buffer.alloc(0);
  let currentFileName = "";
  let isReadingHeader = true;

  const readStream = createReadStream(archivePath);
  const brotliStream = createBrotliDecompress();

  brotliStream.on("data", async (chunk) => {
   leftover = Buffer.concat([leftover, chunk]);

   while (true) {
    if (isReadingHeader) {
     const newlineIndex = leftover.indexOf("\n");
     if (newlineIndex === -1) break;

     currentFileName = leftover.subarray(0, newlineIndex).toString("utf-8");
     leftover = leftover.subarray(newlineIndex + 1);
     isReadingHeader = false;
    } else {
     const newlineIndex = leftover.indexOf("\n");

     if (newlineIndex === -1) {
      break;
     }

     const contentBuffer = leftover.subarray(0, newlineIndex);
     leftover = leftover.subarray(newlineIndex + 1);

     const fullPath = join(targetDir, currentFileName);

     await mkdir(dirname(fullPath), { recursive: true });

     await writeFile(fullPath, contentBuffer);

     isReadingHeader = true;
    }
   }
  });

  brotliStream.on("end", async () => {
   if (leftover.length > 0 && !isReadingHeader) {
    const fullPath = join(targetDir, currentFileName);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, leftover);
   }
  });

  await pipeline(readStream, brotliStream);
 } catch {
  throw new Error("FS operation failed");
 }
};

await decompressDir();
