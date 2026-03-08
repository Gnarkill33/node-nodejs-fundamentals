import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

/* ATTN:
For this function to run correctly checksums.json and corresponding files to check (e.g. file1.txt, file2.txt) should be created in the root 
*/

const calculateHash = (filePath) => {
 return new Promise((resolve, reject) => {
  const hash = createHash("sha256");
  const readableStream = createReadStream(filePath);

  readableStream.on("data", (chunk) => hash.update(chunk));
  readableStream.on("end", () => resolve(hash.digest("hex")));
  readableStream.on("error", reject);
 });
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const __filename = join(__dirname, "../../checksums.json");
const checksumsDir = dirname(__filename);

const verify = async () => {
 try {
  await access(__filename);

  const rawData = await readFile(__filename, { encoding: "utf8" });
  const parsedData = JSON.parse(rawData);

  for (const [fileName, expectedHash] of Object.entries(parsedData)) {
   const filePath = join(checksumsDir, fileName);
   const actualHash = await calculateHash(filePath);

   if (actualHash === expectedHash) {
    console.log(`${fileName} - OK`);
   } else {
    console.log(`${fileName} - FAIL`);
   }
  }
 } catch {
  throw new Error("FS operation failed");
 }
};

await verify();
