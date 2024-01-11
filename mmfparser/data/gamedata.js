const { DataLoader } = require('../loader');

const GAME_HEADER = 'PAME';
const UNICODE_GAME_HEADER = 'PAMU';
const CNCV1_VERSION = 0x207;

const products = {
  'MMF1': 0x0300,
  'MMF1.5': 0x0301,
  'MMF2': 0x0302,
};

class GameData extends DataLoader {
  constructor() {
    super();
    this.runtimeVersion = null;
    this.runtimeSubversion = null;
    this.productVersion = null;
    this.productBuild = null;
    this.chunks = null;

    this.name = null;
    this.author = null;
    this.copyright = null;
    this.aboutText = null;
    this.doc = null;

    this.editorFilename = null;
    this.targetFilename = null;

    this.exeOnly = null;

    this.menu = null;
    this.icon = null;

    this.header = null;
    this.extendedHeader = null;

    this.fonts = null;
    this.sounds = null;
    this.music = null;
    this.images = null;

    this.globalValues = null;
    this.globalStrings = null;

    this.extensions = null;

    this.frameItems = null;

    this.frames = null;
    this.frameHandles = null;

    this.serial = null;

    this.shaders = null;
  }

  initialize() {
    this.frames = [];
  }

  read(reader) {
    const header = reader.read(4);
    if (header === UNICODE_GAME_HEADER) {
      this.settings['unicode'] = true;
    } else if (header !== GAME_HEADER) {
      throw new Error('Invalid game header');
    }

    const firstShort = reader.readShort();
    if (firstShort === CNCV1_VERSION) {
      this.settings['cnc'] = true;
      this.readCnc(reader);
      return;
    }

    this.runtimeVersion = firstShort;
    this.runtimeSubversion = reader.readShort();
    this.productVersion = reader.readInt();
    this.productBuild = reader.readInt();

    this.settings['build'] = this.productBuild;

    const productName = this.getProduct();

    if (productName === 'MMF1.5') {
      this.settings['old'] = true;
    } else if (productName !== 'MMF2') {
      throw new Error(`Invalid product: ${productName}`);
    }

    const chunks = this.new(ChunkList, reader);

    if (this.settings.get('old', false)) {
      const old = require('/chunkloaders/onepointfive/all');
      this.header = chunks.popChunk(old.AppHeader);
      try {
        this.name = chunks.popChunk(AppName).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.copyright = chunks.popChunk(Copyright).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.aboutText = chunks.popChunk(AboutText).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.author = chunks.popChunk(AppAuthor).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.editorFilename = chunks.popChunk(EditorFilename).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.targetFilename = chunks.popChunk(TargetFilename).value;
      } catch (error) {
        // Ignore error
      }
      try {
        this.exeOnly = chunks.popChunk(ExeOnly).value;
      } catch (error) {
        // Ignore error
      }
      this.menu = chunks.popChunk(AppMenu, true);
      try {
        this.sounds = chunks.popChunk(SoundBank);
      } catch (error) {
        // Ignore error
      }
      try {
        this.music = chunks.popChunk(MusicBank);
      } catch (error) {
        // Ignore error
      }
      try {
        this.fonts = chunks.popChunk(FontBank);
      } catch (error) {
        // Ignore error
      }
      try {
        this.images = chunks.popChunk(ImageBank);
        console.log('Popping imagechunks');
      } catch (error) {
        console.log('Imagechunk error');
        // Ignore error
      }
      try {
        this.icon = chunks.popChunk(AppIcon);
      } catch (error) {
        // Ignore error
      }
      try {
        this.globalValues = chunks.popChunk(GlobalValues);
      } catch (error) {
        // Ignore error
      }
      this.extensions = chunks.popChunk(ExtensionList);

      this.frameItems = chunks.popChunk(old.FrameItems);
      this.frameHandles = chunks.popChunk(FrameHandles).handles;

      try {
        while (true) {
          this.frames.push(chunks.popChunk(old.Frame));
        }
      } catch (error) {
        // Ignore error
      }

      this.files = null;
      this.chunks = chunks;
      return;
    }

    this.header = chunks.popChunk(AppHeader);
    this.extendedHeader = chunks.popChunk(ExtendedHeader, true);

    try {
      this.name = chunks.popChunk(AppName).value;
    } catch (error) {
      // Ignore error
    }

    try {
      this.copyright = chunks.popChunk(Copyright).value;
    } catch (error) {
      // Ignore error
    }
    try {
      this.aboutText = chunks.popChunk(AboutText).value;
    } catch (error) {
      // Ignore error
    }
    try {
      this.author = chunks.popChunk(AppAuthor).value;
    } catch (error) {
      // Ignore error
    }

    try {
      this.editorFilename = chunks.popChunk(EditorFilename).value;
    } catch (error) {
      // Ignore error
    }

    try {
      this.targetFilename = chunks.popChunk(TargetFilename).value;
    } catch (error) {
      // Ignore error
    }

    try {
      this.exeOnly = chunks.popChunk(ExeOnly).value;
    } catch (error) {
      // Ignore error
    }

    this.menu = chunks.popChunk(AppMenu, true);

    try {
      this.sounds = chunks.popChunk(SoundBank);
    } catch (error) {
      // Ignore error
    }

    try {
      this.music = chunks.popChunk(MusicBank);
    } catch (error) {
      // Ignore error
    }

    try {
      this.fonts = chunks.popChunk(FontBank);
    } catch (error) {
      // Ignore error
    }

    try {
      this.images = chunks.popChunk(ImageBank);
    } catch (error) {
      // Ignore error
    }

    try {
      this.icon = chunks.popChunk(AppIcon);
    } catch (error) {
      // Ignore error
    }

    try {
      this.shaders = chunks.popChunk(Shaders);
    } catch (error) {
      // Ignore error
    }

    try {
      this.globalStrings = chunks.popChunk(GlobalStrings);
    } catch (error) {
      // Ignore error
    }
    try {
      this.globalValues = chunks.popChunk(GlobalValues);
    } catch (error) {
      // Ignore error
    }

    this.extensions = chunks.popChunk(ExtensionList);

    this.frameItems = chunks.popChunk(FrameItems);
    this.frameHandles = chunks.popChunk(FrameHandles).handles;

    try {
      while (true) {
        this.frames.push(chunks.popChunk(Frame));
      }
    } catch (error) {
      // Ignore error
    }

    this.serial = chunks.popChunk(SecNum);

    this.files = chunks.popChunk(BinaryFiles, true);

    this.chunks = chunks;
  }

  getProduct() {
    for (const [key, value] of Object.entries(products)) {
      if (value === this.runtimeVersion) {
        return key;
      }
    }
    return false;
  }

  setProduct(productName) {
    this.runtimeVersion = products[productName];
  }

  readCnc(reader) {
    // TODO: Implement readCnc method
  }

  write(reader) {
    reader.write(GAME_HEADER); // PAME
    reader.writeShort(this.runtimeVersion);
    reader.writeShort(this.runtimeSubversion);
    reader.writeInt(this.productVersion);
    reader.writeInt(this.productBuild);
    const newChunks = this.new(ChunkList);
    newChunks.append(this.header);
    if (this.name !== null) {
      newChunks.append(makeValueChunk(AppName, this.name));
    }
    if (this.targetFilename !== null) {
      newChunks.append(makeValueChunk(TargetFilename, this.targetFilename));
    }
    if (this.editorFilename !== null) {
      newChunks.append(makeValueChunk(EditorFilename, this.targetFilename));
    }
    if (this.icon !== null) {
      newChunks.append(this.icon);
    }
    if (this.extendedHeader !== null) {
      newChunks.append(this.extendedHeader);
    }
    if (this.globalValues !== null) {
      newChunks.append(this.globalValues);
    }
    if (this.globalStrings !== null) {
      newChunks.append(this.globalStrings);
    }
    if (this.menu !== null) {
      newChunks.append(this.menu);
    }
    newChunks.append(ExtData());
    newChunks.append(this.extensions);
    newChunks.append(this.frameItems);
    newChunks.append(this.serial);
    const frameHandles = FrameHandles();
    frameHandles.handles = this.frameHandles;
    newChunks.append(frameHandles);
    if (this.exeOnly !== null) {
      newChunks.append(makeValueChunk(ExeOnly, this.exeOnly));
    }
    for (const frame of this.frames) {
      newChunks.append(frame, false);
    }
    newChunks.append(Protection());
    newChunks.append(this.images);
    //newChunks.append(this.imageOffsets)
    newChunks.append(this.new(ImageOffsets, { bank: this.images }));
    if (this.fonts !== null) {
      newChunks.append(this.fonts);
      newChunks.append(FontOffsets({ bank: this.fonts }));
    }
    if (this.files !== null) {
      newChunks.append(this.files);
    }
    newChunks.append(Last(), false);
    newChunks.write(reader);
  }
}

const allChunks = require('./chunkloaders/all');
const chunk = require('chunk');

Object.keys(allChunks).forEach((key) => {
  global[key] = allChunks[key];
});

Object.keys(chunk).forEach((key) => {
  global[key] = chunk[key];
});

module.exports = {
  GameData,
};
