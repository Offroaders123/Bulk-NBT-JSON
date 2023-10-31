#!/usr/bin/env node

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { createInterface } from "node:readline";
import * as NBT from "nbtify";

const input = createInterface({ input: process.stdin, output: process.stdout });
input.on("close",() => process.exit(0));

/**
 * @param {string} query
 * @param {string | undefined} fallback
 * @param {string[]} values
*/
async function prompt(query,fallback,values = []){
  /** @type {string} */
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
console.log("  a) NBT => SNBT    b) SNBT => NBT");

const method = await prompt("> ","a",["a","b"]) === "a" ? 0 : 1;
const conversions = [
  {
    kind: "nbt",
    inverse: "snbt"
  },
  {
    kind: "snbt",
    inverse: "nbt"
  }
];

console.log(`\nEnter the path to your ${conversions[method].kind.toUpperCase()} directory:`);

const sourceDir = await prompt("> ",method ? "./test/nbt_snbt" : "./test/nbt");
const mirrorDir = `${sourceDir}_${conversions[method].inverse}`;

try {
  await stat(sourceDir);
} catch (error){
  console.error(`\nCouldn't find directory "${sourceDir}".`);
  input.close();
}

await mkdir(mirrorDir,{ recursive: true });

console.log(`\nCreated directory for ${method ? "re-compiled" : "mirrored"} ${conversions[method].inverse.toUpperCase()} files at "${mirrorDir}"`);
console.log(`Opening "${sourceDir}" to parse the source NBT...\n`);

const entries = await readdir(sourceDir,{ withFileTypes: true });

for (const entry of entries){
  const kind = entry.isDirectory() ? "directory" : "file";
  if (kind === "directory") continue;

  const { name } = entry;
  const extension = extname(name);
  if (extension !== `.${conversions[method].kind}`) continue;

  console.log(`Converting "${name}"...`);

  /** @type {string | Uint8Array} */
  let data = await readFile(join(sourceDir,name),{ encoding: method ? "utf8" : null });
  data = method ? await NBT.write(NBT.parse(/** @type {string} */ (data))) : NBT.stringify(await NBT.read(/** @type {Uint8Array} */ (data)),{ space: 2 });

  const mirrorName = `${basename(name,extension)}.${conversions[method].inverse}`;
  console.log(`Saving "${mirrorName}"...\n`);

  await writeFile(join(mirrorDir,mirrorName),data);
}

input.close();