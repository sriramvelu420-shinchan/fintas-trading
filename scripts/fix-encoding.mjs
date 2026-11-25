import fs from "fs";
import path from "path";

const replacements = [
  ["â€¢", "•"],
  ["â‚¹", "₹"],
  ["âš ï¸", "⚠️"],
  ["âš ï¸", "⚠️"],
  ["âš ", "⚠️ "],
  ["â€™", "’"],
  ["â€“", "–"],
  ["â€”", "—"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["Ã©", "é"],
  ["Ã¨", "è"],
  ["Ã¡", "á"],
  ["Ã³", "ó"],
  ["Ã¼", "ü"],
  ["Ã±", "ñ"],
  ["Â·", "·"],
  ["Â", ""],
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|css|md|json)$/.test(entry)) out.push(full);
  }
  return out;
}

const roots = ["app", "components", "lib"].filter((root) => fs.existsSync(root));
let changed = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, "utf8");
    let fixed = original;
    for (const [from, to] of replacements) fixed = fixed.split(from).join(to);
    if (fixed !== original) {
      fs.writeFileSync(file, fixed, "utf8");
      changed++;
      console.log("fixed", file);
    }
  }
}
console.log(`Repaired ${changed} file(s).`);
