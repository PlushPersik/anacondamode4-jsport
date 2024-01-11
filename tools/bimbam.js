const fs = require('fs');
const path = require('path');
const { ByteReader } = require('../mmfparser/bytereader');
const { ExecutableData } = require('../mmfparser/data/exe');
const { GameData } = require('../mmfparser/data/gamedata');
const { MFA } = require('../mmfparser/data/mfa');
const { translate } = require('../mmfparser/translators/pame2mfa');

function main() {
  console.log('Anaconda Decompiler');
  console.log('ONLY for educational purpose, or game datamining ;)');
  console.log('');

  let input = '';
  try {
    input = process.argv[2];
  } catch (error) {
    console.log('Usage: node bimbam.js yourGameExe.exe');
    process.exit();
  }

  let output = '';
  try {
    output = process.argv[3];
  } catch (error) {
    output = './Out/';
  }

  const fp = new ByteReader(fs.readFileSync(input));
  let newGame = null;

  if (input.endsWith('.ccn')) {
    newGame = new GameData(fp);
  } else {
    const newExe = new ExecutableData(fp, true);

    for (const file in newExe.packData.items) {
      const name = file.filename.split('/').pop();
      console.log(`Writing pack file ${name}`);
      fs.writeFileSync(path.join(output, name), file.data);
    }

    newGame = newExe.gameData;
  }

  if (newGame.files !== null) {
    for (const file in newGame.files.items) {
      const name = file.name.split('/').pop();
      console.log(`Writing embedded file ${name}`);
      fs.writeFileSync(path.join(output, name), file.data.toString());
    }
    newGame.files = null;
  }

  function out(value) {
    console.log(value);
  }

  console.log('Translating MFA...');
  const newMfa = translate(newGame, { print_func: out });
  const s = newGame.name;
  const whitelist = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let new_s = '';
  for (const char of s) {
    if (whitelist.includes(char)) {
      new_s += char;
    }
  }
  console.log(new_s);
  const out_path = path.join(output, `${new_s}-compressed.mfa`);
  console.log('Writing MFA...');
  const outBuffer = newMfa.exportBuffer();
  fs.writeFileSync(out_path, outBuffer);

  console.log('Decompilation Finished!');
}

main();