import { promises as fs } from "fs";
import path from "path";
import readline from "readline";
import NBT from "nbt-parser";

const input = readline.createInterface({ input: process.stdin, output: process.stdout });
input.on("close",() => process.exit(0));

async function prompt(query,fallback,values = []){
  let response = await new Promise(resolve => input.question(query,resolve));
  if (response === "" || values.length && !values.includes(response)){
    if (fallback === undefined) fallback = values[0];
    response = fallback;
    process.stdout.moveCursor(0,-1);
    process.stdout.clearLine(1);
    console.log(`${query}${fallback}`);
  }
  return response;
}

console.log("------ Bulk NBT to JSON Converter ------\n");
console.log("Which conversion method would you like to use?");
console.log("  a) NBT => JSON    b) JSON => NBT");

const method = await prompt("> ","a",["a","b"]) === "a" ? 0 : 1;
const conversions = [
  {
    kind: "nbt",
    inverse: "json"
  },
  {
    kind: "json",
    inverse: "nbt"
  }
];

console.log(`\nEnter the path to your ${conversions[method].kind.toUpperCase()} directory:`);

const sourceDir = await prompt("> ",method ? "./nbt_json" : "./nbt");
const mirrorDir = `${sourceDir}_${conversions[method].inverse}`;

try {
  await fs.stat(sourceDir);
} catch (error){
  console.error(`\nCouldn't find directory "${sourceDir}".`);
  input.close();
}

await fs.mkdir(mirrorDir,{ recursive: true });

console.log(`\nCreated directory for ${method ? "re-compiled" : "mirrored"} ${conversions[method].inverse.toUpperCase()} files at "${mirrorDir}"`);
console.log(`Opening "${sourceDir}" to parse the source NBT...\n`);

const entries = await fs.readdir(sourceDir,{ withFileTypes: true });

for (const entry of entries){
  const kind = entry.isDirectory() ? "directory" : "file";
  if (kind === "directory") continue;
  const { name } = entry;
  const extension = path.extname(name);
  if (extension !== `.${conversions[method].kind}`) continue;

  console.log(`Converting "${name}"...`);
  let data = await fs.readFile(path.join(sourceDir,name),{ encoding: method ? "utf8" : null });
  data = method ? await NBT.write(JSON.parse(data)) : await NBT.parse(data);

  const mirrorName = `${path.basename(name,extension)}.${conversions[method].inverse}`;
  console.log(`Saving "${mirrorName}"...\n`);
  await fs.writeFile(path.join(mirrorDir,mirrorName),method ? data : JSON.stringify(data,null,"  "));
}

input.close();