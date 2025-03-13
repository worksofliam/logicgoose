import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { LGFile } from "./types";
import JSON5 from "json5";
import { validateLGFile } from "./cli/validate";
import { generateTypesForCaller } from "./cli/types";
import { SAMPLE_LG_FILE } from "./cli/sample";
import { generateCallersFor } from "./cli/callers";
import { generateSqlCreate } from "./cli/sql";

const LG_FILE = `.logicgoose`;
const isCli = process.argv.length >= 2 && (process.argv[1].endsWith(`so`) || process.argv[1].endsWith(`index.js`));

if (isCli || process.env.VSCODE_INSPECTOR_OPTIONS) {
	main();
}

async function main() {

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

  const outDir = path.join(cwd, settings.generateIn || `.`, `logicgoose`);
  let hasMadeDir = false;
  let hasWritten = false;

  const writeFile = (file: string, content: string) => {
    if (!hasMadeDir) {
      hasMadeDir = true;
      mkdirSync(outDir, { recursive: true });
    }

    const filePath = path.join(outDir, file);
    writeFileSync(filePath, content, { encoding: `utf8` });

    if (!hasWritten) {
      hasWritten = true;
      writeFile(`.gitignore`, `*.*`);
    }
  }

  if (settings.callers) {
    if (settings.generateCaller) {
      const callerCode = generateCallersFor(settings.callers);
      writeFile(`callers.ts`, callerCode);
    }

    if (settings.generateTypes) {
      const newTypes = settings.callers.map(c => generateTypesForCaller(c)).join(`\n`);

      writeFile(`types.ts`, newTypes);
    }

    if (settings.generateSql) {
      const sql = settings.callers.map(c => generateSqlCreate(c)).join(`\n\n`);
      writeFile(`callers.sql`, sql);
    }

    if (settings.generateRpgle) {
      console.warn(`generateRpgle is not yet implemented.`);
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