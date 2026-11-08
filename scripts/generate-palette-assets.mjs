import { writeFile } from "node:fs/promises";
import { collections } from "../js/collections.js";
import { paletteSvg } from "../js/palette-engine.js";
for (const p of collections)
  await writeFile(`assets/palettes/${p.id}.svg`, paletteSvg(p.colors, p.name));
await writeFile("data/collections.json", JSON.stringify(collections, null, 2));
