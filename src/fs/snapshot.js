import { stat, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join, relative } from "node:path";

/* ATTN:
For this function to run correctly workspace directory should be created in the root 
*/

const snapshot = async () => {
 const getDirectoryInfo = async (directory) => {
  const files = await readdir(directory, { withFileTypes: true });

  for (const file of files) {
   const filePath = join(directory, file.name);
   const relativePath = relative(workspaceDir, filePath);

   if (file.isDirectory()) {
    entries.push({
     path: relativePath,
     type: "directory",
    });
    await getDirectoryInfo(filePath);
   }

   if (file.isFile()) {
    const fileStats = await stat(filePath);
    const fileContent = await readFile(filePath);

    entries.push({
     path: relativePath,
     type: "file",
     size: fileStats.size,
     content: fileContent.toString("base64"),
    });
   }
  }
 };

 const workspaceDir = resolve(import.meta.dirname, "../../workspace");
 const entries = [];

 try {
  const workspaceStats = await stat(workspaceDir);
  if (!workspaceStats.isDirectory()) {
   throw new Error("FS operation failed");
  }
 } catch {
  throw new Error("FS operation failed");
 }

 await getDirectoryInfo(workspaceDir);

 const jsonContent = {
  rootPath: workspaceDir,
  entries,
 };

 const snapshotJsonPath = resolve(import.meta.dirname, "snapshot.json");
 await writeFile(snapshotJsonPath, JSON.stringify(jsonContent, null, 2));
};

await snapshot();
