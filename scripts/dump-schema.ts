import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(projectRoot, process.env.DATABASE_PATH)
  : existsSync(path.resolve(projectRoot, "data/han-li.sqlite"))
    ? path.resolve(projectRoot, "data/han-li.sqlite")
    : path.resolve(projectRoot, "../data/han-li.sqlite");

function sqlite(args: string[]) {
  return execFileSync("sqlite3", args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 12,
  }).trim();
}

const tables = JSON.parse(
  sqlite([
    "-json",
    dbPath,
    "select name from sqlite_schema where type = 'table' and name not like 'sqlite_%' order by name;",
  ]) || "[]",
) as { name: string }[];

for (const { name } of tables) {
  const createSql = sqlite([
    "-json",
    dbPath,
    `select sql from sqlite_schema where type = 'table' and name = '${name.replaceAll("'", "''")}';`,
  ]);
  const sample = sqlite(["-json", dbPath, `select * from "${name.replaceAll('"', '""')}" limit 3;`]);

  console.log(`\n## ${name}`);
  console.log(JSON.parse(createSql)[0]?.sql ?? "(missing CREATE TABLE)");
  console.log("\nSample rows:");
  console.log(JSON.stringify(JSON.parse(sample || "[]"), null, 2));
}
