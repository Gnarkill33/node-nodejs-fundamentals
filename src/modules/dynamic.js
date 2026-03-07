import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { argv } from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dynamic = async () => {
 const [plugin] = argv.slice(2);

 if (!plugin) {
  console.log("Plugin not found");
  process.exit(1);
 }

 const pluginPath = join(__dirname, "plugins", `${plugin}.js`);

 const { run } = await import(pathToFileURL(pluginPath));

 console.log(run());
};

await dynamic();
