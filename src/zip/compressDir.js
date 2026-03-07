import { mkdir, access, readdir } from "node:fs/promises";
import { resolve, join, relative } from "node:path";
import { pipeline } from "node:stream/promises";
import { createBrotliCompress } from "node:zlib";
import { createReadStream, createWriteStream } from "node:fs";

/* ATTN:
For this function to run correctly workspace directory should be created in the root 
*/

const getFiles = async (dir) => {
 let files = [];
 const entries = await readdir(dir, { withFileTypes: true });

 for (const entry of entries) {
  const filePath = join(dir, entry.name);
  if (entry.isDirectory()) {
   const nestedFiles = await getFiles(filePath);
   files = [...files, ...nestedFiles];
  } else if (entry.isFile()) {
   files = [...files, filePath];
  }
 }

 return files;
};

const compressDir = async () => {
 const workspacePath = resolve("workspace");
 const sourceDir = resolve(workspacePath, "toCompress");
 const targetDir = resolve(workspacePath, "compressed");
 const archivePath = resolve(targetDir, "archive.br");

 try {
  await access(sourceDir);

  await mkdir(targetDir, { recursive: true });

  const extractedFiles = await getFiles(sourceDir);

  const brotliStream = createBrotliCompress();
  const writableStream = createWriteStream(archivePath);

  for (const file of extractedFiles) {
   const relativePath = relative(sourceDir, file);

   const fileHeader = Buffer.from(`${relativePath}\n`);
   brotliStream.write(fileHeader);

   const readableStream = createReadStream(file);

   await pipeline(readableStream, brotliStream, { end: false });

   brotliStream.write(Buffer.from("\n"));
  }

  brotliStream.end();

  await pipeline(brotliStream, writableStream);
 } catch {
  throw new Error("FS operation failed");
 }
};

await compressDir();
