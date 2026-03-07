import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { cpus } from "node:os";
import { Worker } from "node:worker_threads";
import { readFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __workerPath = join(__dirname, "worker.js");

const splitIntoChunks = (array, numChunks) => {
 const chunks = [];
 const chunkSize = Math.ceil(array.length / numChunks);

 for (let i = 0; i < numChunks; i++) {
  const start = i * chunkSize;
  const end = Math.min(start + chunkSize, array.length);
  if (start < array.length) {
   chunks.push(array.slice(start, end));
  }
 }

 return chunks;
};

const kWayMerge = (sortedChunks) => {
 const result = [];
 const indices = new Array(sortedChunks.length).fill(0);

 while (true) {
  let minValue = Infinity;
  let minIndex = -1;

  for (let i = 0; i < sortedChunks.length; i++) {
   if (indices[i] < sortedChunks[i].length) {
    const currentValue = sortedChunks[i][indices[i]];
    if (currentValue < minValue) {
     minValue = currentValue;
     minIndex = i;
    }
   }
  }

  if (minIndex === -1) break;

  result.push(minValue);
  indices[minIndex]++;
 }

 return result;
};

const main = async () => {
 try {
  const cpuCores = cpus().length;
  const dataPath = resolve("data.json");
  const parsedData = JSON.parse(await readFile(dataPath, { encoding: "utf8" }));
  const parsedArray = parsedData.data;

  const chunks = splitIntoChunks(parsedArray, cpuCores);

  const workers = [];
  const promises = [];

  for (let i = 0; i < chunks.length; i++) {
   const worker = new Worker(__workerPath);
   workers.push(worker);

   const promise = new Promise((resolve, reject) => {
    worker.on("message", (sortedChunk) => {
     resolve(sortedChunk);
    });

    worker.on("error", (error) => {
     console.error("error");
     reject(error);
    });
   });

   promises.push(promise);

   worker.postMessage(chunks[i]);
  }

  const sortedChunks = await Promise.all(promises);

  workers.forEach((worker) => worker.terminate());

  const sortedArray = kWayMerge(sortedChunks);

  console.log(sortedArray);
 } catch (error) {
  console.error("error");
 }
};

await main();
