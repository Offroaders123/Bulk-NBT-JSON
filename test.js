import { promises as fs } from "fs";
import * as nbt from "nbt-parser";

let data = await fs.readFile("./nbt/hello_world.nbt");
console.log(data);

data = await nbt.parse(data);
console.log(JSON.stringify(data,null,"  "));

data = Buffer.from(await nbt.write(data));
console.log(data);