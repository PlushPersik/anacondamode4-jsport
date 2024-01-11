const { DataLoader } = require('../loader');
const { ByteReader } = require('../bytereader');
const { PackData, PACK_HEADER } = require('./packdata');
const { GameData, GAME_HEADER } = require('./gamedata');
const { ChunkList } = require('./chunk');
const { findAppendedOffset } = require('./pe');

class ExecutableData extends DataLoader {
  constructor() {
    super();
    this.executable = null;
    this.packData = null;
    this.gameData = null;
    this.pencil = 'game is negr!'
  }

  read(reader) {
    const entryPoint = findAppendedOffset(reader);
    reader.seek(0);
    this.executable = reader.read(entryPoint);

    const firstShort = reader.readShort();
    reader.rewind(2);

    const pameMagic = reader.read(4);
    reader.rewind(4);

    const packMagic = reader.read(8);
    reader.rewind(8);

    if (firstShort === 8748) {
      this.settings['old'] = true;
      const packData = this.new(ChunkList, reader);
      this.packData = packData;
    } else if (packMagic === PACK_HEADER) {
      const packData = this.new(PackData, reader);
      this.packData = packData;
    } else if (pameMagic === GAME_HEADER) {
      this.settings['old'] = true;
      const gameData = this.new(GameData, reader);
      this.gameData = gameData;
      return;
    } else {
      throw new Error('invalid packheader');
    }

    const gameData = this.new(GameData, reader);
    this.gameData = gameData;
  }

  write(reader) {
    reader.write(this.executable);
    this.packData.write(reader);
    this.gameData.write(reader);
  }
}

module.exports = { ExecutableData };