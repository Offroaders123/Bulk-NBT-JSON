import { promises as fs } from "fs";
import * as NBT from "nbtify";

let data = await fs.readFile("./nbt/hello_world.nbt");
console.log(data);

let content = await NBT.read(data);
console.log(content);

let result = await NBT.write(content);
console.log(result);