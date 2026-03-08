import { stdout, argv } from "node:process";

/* ATTN:
For this function to run correctly color value in #RRGGBB format should be set in ""
*/

const progress = () => {
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

 const duration = parseInt(params.duration) || 5000;
 const interval = parseInt(params.interval) || 100;
 const barCharLength = parseInt(params.length) || 30;
 const color = params.color || "";

 const totalSteps = duration / interval;
 let currentStep = 0;

 function convertHex(hex) {
  try {
   hex = hex.replace("#", "");
   if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;

   const r = parseInt(hex.substring(0, 2), 16);
   const g = parseInt(hex.substring(2, 4), 16);
   const b = parseInt(hex.substring(4, 6), 16);

   if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

   return `\x1b[38;2;${r};${g};${b}m`;
  } catch {
   return null;
  }
 }

 function drawProgressBar() {
  currentStep++;
  const progress = Math.min(currentStep / totalSteps, 1);
  const percentage = Math.round(progress * 100);

  const completedChars = Math.round(progress * barCharLength);
  const incompleteChars = barCharLength - completedChars;
  const completedBars = "█".repeat(completedChars);
  const incompleteBars = " ".repeat(incompleteChars);

  let output;

  if (color && convertHex(color)) {
   const userColor = convertHex(color);
   const resetColorCode = "\x1b[0m";
   output = `[${userColor}${completedBars}${resetColorCode}${incompleteBars}] ${percentage}%`;
  } else {
   output = `[${completedBars}${incompleteBars}] ${percentage}%`;
  }

  stdout.write(`${output}\r`);

  if (progress >= 1) {
   clearInterval(intervalId);
   console.log("\nDone!");
  }
 }

 const intervalId = setInterval(drawProgressBar, interval);
};

progress();
