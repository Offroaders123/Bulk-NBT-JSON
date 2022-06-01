import { promises as fs } from "fs";
import NBT from "nbt-parser";

let data = await fs.readFile("./nbt/hello_world.nbt");
console.log(data);

let content = await NBT.parse(data);
console.log(JSON.stringify(content,null,"  "));

data = await NBT.write(content);
console.log(data);