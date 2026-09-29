#!/usr/bin/env node
/**
 * shadcn CLI 生成的文件用 "@/..." 别名导入。在 monorepo 里这个别名会撞上
 * 各 app 自己的 "@/*"（指向 app 的 src），导致库内部导入解析到错误位置。
 * 库代码必须用相对路径——每次 `npx shadcn add` 之后跑一次这个脚本。
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.tsx?$/.test(e.name)) yield p;
  }
}

let changed = 0;
for await (const file of walk(SRC)) {
  const before = await readFile(file, "utf8");
  const after = before.replace(
    /(["'])@\/([^"']+)\1/g,
    (_m, q, sub) => {
      let rel = relative(dirname(file), join(SRC, sub)).replace(/\\/g, "/");
      if (!rel.startsWith(".")) rel = `./${rel}`;
      return `${q}${rel}${q}`;
    },
  );
  if (after !== before) {
    await writeFile(file, after);
    changed++;
    console.log(`  ${relative(SRC, file)}`);
  }
}
console.log(changed ? `已规范化 ${changed} 个文件` : "无需改动");
