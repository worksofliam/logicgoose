const isCli = process.argv.length >= 2 && (process.argv[1].endsWith(`so`) || process.argv[1].endsWith(`index.js`));

if (isCli || process.env.VSCODE_INSPECTOR_OPTIONS) {
	main();
}

async function main() {
  console.log(`hi!`);
}

export * from "./types";
export { LogicGoose } from "./logicgoose";