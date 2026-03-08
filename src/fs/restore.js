import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const restore = async () => {
 const targetDir = resolve(import.meta.dirname, "../../workspace_restored");

 try {
  await access(targetDir);
  throw new Error("FS operation failed");
 } catch {
  console.log("FS operation failed");
 }

 let snapshotData;

 try {
  const snapshotContent = await readFile(
   resolve(import.meta.dirname, "snapshot.json"),
   "utf-8",
  );
  snapshotData = JSON.parse(snapshotContent);
 } catch {
  throw new Error("FS operation failed");
 }

 const { entries } = snapshotData;

 for (const item of entries) {
  const itemPath = resolve(targetDir, item.path);

  if (item.type === "directory") {
   await mkdir(itemPath, { recursive: true });
   continue;
  }

  if (item.type === "file") {
   const directoryPath = dirname(itemPath);
   await mkdir(directoryPath, { recursive: true });

   const fileContent = Buffer.from(item.content, "base64");
   await writeFile(itemPath, fileContent);
  }
 }
};

await restore();
