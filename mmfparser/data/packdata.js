const { DataLoader } = require("../loader")
const { ByteReader } = require("../bytereader")
const { const: {UNICODE_GAME_HEADER}, const: {GAME_HEADER}} = require("./gamedata")

const zlib = require("zlib")
const struct = require('bufferpack');

PACK_HEADER = '\x77\x77\x77\x77\x49\x87\x47\x12'

class PackFile extends DataLoader {
    constructor() {
        this.data = null;
        this.filename = null;
        this.bingo = null;
        this.compressed = false;
    }

    read(reader) {
        this.filename = this.readString(reader, reader.readShort())
        if (this.settings['hasBingo']) {
            this.bingo = reader.readInt()
        }
        this.data = reader.read(reader.readInt())
        try {
            this.data = zlib.decompress(this.data)
            this.compressed = true
        }
        catch {
            zlib.error
            pass
        }
        this.data = data;
      }
}