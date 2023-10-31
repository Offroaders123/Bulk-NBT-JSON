import { readFile } from "node:fs/promises";
import * as NBT from "nbtify";

const data = await readFile(new URL("./nbt/hello_world.nbt",import.meta.url));
console.log(data,"\n");

const result = await NBT.read(data);
console.log(result,"\n");

const recompile = await NBT.write(result);
console.log(Buffer.from(recompile));