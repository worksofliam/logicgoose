import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { LGFile } from "./types";
import JSON5 from "json5";
import { validateLGFile } from "./cli/validate";
import { generateTypesForCaller } from "./cli/types";
import { SAMPLE_LG_FILE } from "./cli/sample";
import { generateCallersFor } from "./cli/callers";
import { generateSqlCreate } from "./cli/sql";
import { generateRpgleFor } from "./cli/rpgle";

const LG_FILE = `.logicgoose`;
const isCli = process.argv.length >= 2 && (process.argv[1].endsWith(`so`) || process.argv[1].endsWith(`index.js`) || process.argv[1].endsWith(`logicgoose`));

if (isCli || process.env.VSCODE_INSPECTOR_OPTIONS) {
	main();
}

async function main() {
  console.log(`Thanks for using Logicgoose.`);
  
  const parms = process.argv.slice(2);
  let cwd = process.cwd();

  let sample = false;

  for (let i = 0; i < parms.length; i++) {
    const parm = parms[i];
    switch (parm) {
      case `--cwd`:
        cwd = parms[i + 1];
        break;

      case `--sample`:
        sample = true;
        break;
    }
  }

  if (sample) {
    const sampleFile = path.join(cwd, LG_FILE);
    // validateLGFile(SAMPLE_LG_FILE);
    writeFileSync(sampleFile, JSON.stringify(SAMPLE_LG_FILE, null, 2), { encoding: `utf8` });
    console.log(`Sample .logicgoose file created at ${sampleFile}`);
    process.exit(0);
  }

  let settings: LGFile;

  try {
    settings = getLgFile(cwd);
  } catch (e: any) {
    console.warn(`Error reading ${LG_FILE} file: ${e.message}`);
    process.exit(1);
  }

  const baseOutDir = path.join(cwd, settings.generateIn || `.`, `logicgoose`);
  let hasWritten = false;

  const writeFile = (content: string, ...remainingPath: string[]) => {
    const filePath = path.join(baseOutDir, ...remainingPath);
    mkdirSync(path.parse(filePath).dir, { recursive: true });
    writeFileSync(filePath, content, { encoding: `utf8` });

    if (!hasWritten) {
      hasWritten = true;
      writeFile(`*.*`, `.gitignore`);
      writeFile(`**/**`, `.gitignore`);
    }
  }

  if (settings.callers) {
    if (settings.generateCaller) {
      const callerCode = generateCallersFor(settings.callers);
      writeFile(callerCode, `callers.ts`);
    }

    if (settings.generateTypes) {
      const newTypes = settings.callers.map(c => generateTypesForCaller(c)).join(`\n`);

      writeFile(newTypes, `types.ts`);
    }

    if (settings.generateSql) {
      const needsProcs = settings.callers.filter(c => `bufferOut` in c);

      if (needsProcs) {
        const sql = needsProcs.filter(c => `bufferOut` in c).map(c => generateSqlCreate(c)).join(`\n\n`);
        writeFile(sql, `callers.sql`);
      }
    }

    if (settings.generateRpgle) {
      for (const caller of settings.callers) {
        const rpgle = generateRpgleFor(caller);
        writeFile(rpgle, `callers`, `${caller.programName}.rpgle`);
      }
    }
  }
}

function getLgFile(dir: string): LGFile {
  const file = path.join(dir, LG_FILE);
  const content = readFileSync(file, { encoding: `utf8` });
  const settings = JSON5.parse(content) as LGFile;

  validateLGFile(settings);

  return settings;
}

export * from "./types";
export { LogicGoose } from "./logicgoose";