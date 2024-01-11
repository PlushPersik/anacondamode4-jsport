class DataLoader {
  init(reader = null, parent = null, settings = {}) {
    this.init(reader, parent, settings);
  }

  init(reader, parent, settings) {
    this.parent = parent;
    this.settings = settings;
    if (IS_PYPY) {
      getattr(this, 'initialize')();
    } else {
      this.initialize();
    }
    if (reader !== null) {
      this.read(reader);
    }
    return true;
  }

  new(loaderClass, reader = null, kw = {}) {
    kw = { ...kw, ...this.settings };
    const newLoader = loaderClass.new(loaderClass);
    newLoader.init(reader, this, kw);
    return newLoader;
  }

  readString(reader, size = null) {
    if (this.settings['unicode']) {
      return reader.readUnicodeString(size).encode('utf-8');
    } else {
      return reader.readString(size);
    }
  }

  initialize() {
    return;
  }

  read(reader) {
    if (IS_PYPY) {
      return getattr(this, 'read')(reader);
    } else {
      throw new Error(`${this.class.name} has not implemented a read method`);
    }
  }

  generate() {
    const newReader = new ByteReader();
    this.write(newReader);
    return newReader;
  }

  write(reader) {
    throw new Error(`${this.class.name} has not implemented a write method`);
  }
}

module.exports = { DataLoader };