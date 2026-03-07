import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { argv } from "node:process";

/* ATTN:
For this function to run correctly workspace directory should be located in the root 
*/

const merge = async () => {
 const getCommandLineArgs = () => {
  const args = argv.slice(2);
  const filesIndex = args.indexOf("--files");

  if (filesIndex === -1) {
   return { customFiles: null };
  }

  const filesValue = args[filesIndex + 1];
  if (!filesValue) {
   return { customFiles: [] };
  }

  return {
   customFiles: filesValue.split(",").filter((name) => name.trim() !== ""),
  };
 };

 const { customFiles } = getCommandLineArgs();

 const workspaceDir = resolve(import.meta.dirname, "../../workspace");
 const partsFolder = resolve(workspaceDir, "parts");
 const outputFile = resolve(workspaceDir, "merged.txt");

 try {
  let fileContents = [];

  if (customFiles) {
   if (customFiles.length === 0) {
    throw new Error("No files specified");
   }

   for (const fileName of customFiles) {
    const filePath = resolve(partsFolder, fileName);
    try {
     const content = await readFile(filePath, "utf-8");
     fileContents.push(content);
    } catch {
     throw new Error("File not found");
    }
   }
  } else {
   try {
    const allFiles = await readdir(partsFolder);
    const textFiles = allFiles
     .filter((file) => file.endsWith(".txt"))
     .sort((a, b) => a.localeCompare(b));

    if (textFiles.length === 0) {
     throw new Error("No text files found");
    }

    for (const fileName of textFiles) {
     const filePath = resolve(partsFolder, fileName);
     const content = await readFile(filePath, "utf-8");
     fileContents.push(content);
    }
   } catch {
    throw new Error("Parts folder not found");
   }
  }

  const mergedContent = fileContents.join("");
  await writeFile(outputFile, mergedContent, "utf-8");
 } catch (error) {
  throw new Error("FS operation failed");
 }
};

await merge();
