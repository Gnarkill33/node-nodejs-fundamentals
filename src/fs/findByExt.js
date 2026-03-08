import { readdir, stat } from "node:fs/promises";
import { join, relative, extname, resolve } from "node:path";
import { argv } from "node:process";

/* ATTN:
For this function to run correctly workspace directory should be located in the root 
*/

const findByExt = async () => {
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

 const fileExtension = params.ext || "txt";

 const workspaceDir = resolve(import.meta.dirname, "../../workspace");

 try {
  const workspaceStats = await stat(workspaceDir);
  if (!workspaceStats.isDirectory()) {
   throw new Error("FS operation failed");
  }
 } catch {
  throw new Error("FS operation failed");
 }

 const collectFiles = async (currentPath) => {
  let matchingFiles = [];

  try {
   const items = await readdir(currentPath, { withFileTypes: true });

   for (const item of items) {
    const fullPath = join(currentPath, item.name);

    if (item.isDirectory()) {
     const subDirectoryFiles = await collectFiles(fullPath);
     matchingFiles = [...matchingFiles, ...subDirectoryFiles];
    } else if (item.isFile()) {
     const fileExt = extname(item.name).replace(".", "");
     if (fileExtension === fileExt) {
      matchingFiles.push(fullPath);
     }
    }
   }
  } catch {
   console.error("FS operation failed");
  }

  return matchingFiles;
 };

 const foundFiles = await collectFiles(workspaceDir);

 foundFiles
  .map((filePath) => relative(workspaceDir, filePath))
  .sort((a, b) => a.localeCompare(b))
  .forEach((filePath) => console.log(filePath));
};

await findByExt();
