const struct = require('bufferpack');

const BYTE = 'b';
const UBYTE = 'B';
const SHORT = 'h';
const USHORT = 'H';
const FLOAT = 'f';
const DOUBLE = 'd';
const INT = 'i';
const UINT = 'I';

class ByteReader {
    constructor(input, fp, file) {
        if (input instanceof file) {
            let buffer = new Buffer(String(input));
            this.write = buffer.write.bind(buffer);
        } else {
            let buffer;
            if (input !== null) {
                buffer = input;
            } else {
                buffer = Buffer.alloc(0);
                this.write = (data) => {
                    buffer = Buffer.concat([buffer, Buffer.from(data)]);
                };
            }
            this.buffer = buffer;
            this.tell = () => buffer.length;
            this.lastPosition = this.tell();
        }
    }

    data() {
        const currentPosition = this.tell();
        this.seek(0);
        const data = this.read();
        this.seek(currentPosition);
        return data;
    }

    seek(...args) {
        this.buffer = Buffer.from(this.buffer);
        this.buffer.seek(...args);
        this.lastPosition = this.tell();
    }

    read(...args) {
        this.lastPosition = this.tell();
        return this.buffer.read(...args);
    }

    size() {
        const currentPosition = this.tell();
        this.seek(0, 2);
        const size = this.tell();
        this.seek(currentPosition);
        return size;
    }

    length() {
        return this.size();
    }

    toString() {
        return this.data();
    }

    inspect() {
        return JSON.stringify(this.toString());
    }

    readByte(asUnsigned = false) {
        const format = asUnsigned ? UBYTE : BYTE;
        const [value] = this.readStruct(format);
        return value;
    }

    readShort(asUnsigned = false) {
        const format = asUnsigned ? USHORT : SHORT;
        const [value] = this.readStruct(format);
        return value;
    }

    readFloat() {
        const [value] = this.readStruct(FLOAT);
        return value;
    }

    readDouble() {
        const [value] = this.readStruct(DOUBLE);
        return value;
    }

    readInt(asUnsigned = false) {
        const format = asUnsigned ? UINT : INT;
        const [value] = this.readStruct(format);
        return value;
    }

    readString(size) {
        if (size !== undefined) {
            return this.readReader(size).readString();
        }
        const currentPosition = this.tell();
        let store = '';
        while (true) {
            const readChar = this.read(1);
            if (readChar === '\x00' || readChar === '') {
                break;
            }
            store += readChar;
        }
        this.lastPosition = currentPosition;
        return store;
    }

    readUnicodeString() {
        const currentPosition = this.tell();
        const startPos = this.tell();
        while (true) {
            const short = this.readShort();
            if (short === 0) {
                break;
            }
        }
        const size = this.tell() - 2 - startPos;
        this.seek(startPos);
        const data = this.read(size);
        this.skipBytes(2);
        this.lastPosition = currentPosition;
        return data.toString('utf-16-le');
    }

    readColor() {
        const currentPosition = this.tell();
        const r = this.readByte(true);
        const g = this.readByte(true);
        const b = this.readByte(true);
        this.skipBytes(1);
        this.lastPosition = currentPosition;
        return [r, g, b];
    }

    readReader(size) {
        const reader = new ByteReader();
        reader.write(this.read(size));
        reader.seek(0);
        return reader;
    }

    readFormat(format) {
        const size = struct.calcLength(format);
        return struct.unpack(format, this.read(size));
    }

    readStruct(structType) {
        return struct.unpack(structType, this.read(structType.size));
    }

    writeByte(value, asUnsigned = false) {
        const format = asUnsigned ? UBYTE : BYTE;
        this.writeStruct(format, value);
    }

    writeShort(value, asUnsigned = false) {
        const format = asUnsigned ? USHORT : SHORT;
        this.writeStruct(format, value);
    }

    writeFloat(value) {
        this.writeStruct(FLOAT, value);
    }

    writeDouble(value) {
        this.writeStruct(DOUBLE, value);
    }

    writeInt(value, asUnsigned = false) {
        const format = asUnsigned ? UINT : INT;
        this.writeStruct(format, value);
    }

    writeString(value) {
        this.write(value + '\x00');
    }

    writeUnicodeString(value) {
        this.write(Buffer.from(value, 'utf-16-le') + '\x00\x00');
    }

    writeColor(colorTuple) {
        const [r, g, b] = colorTuple;
        this.writeByte(r, true);
        this.writeByte(g, true);
        this.writeByte(b, true);
        this.writeByte(0);
    }

    writeFormat(format, ...values) {
        this.write(struct.pack(format, ...values));
    }

    writeStruct(structType, ...values) {
        this.write(struct.pack(structType, ...values));
    }

    writeReader(reader) {
        this.write(reader.data());
    }

    skipBytes(n) {
        this.seek(n, 1);
    }

    rewind(n) {
        this.seek(-n, 1);
    }

    truncate(value) {
        this.buffer = this.buffer.slice(0, value);
    }

    checkDefault(value, ...defaults) {
        const size = this.tell() - this.lastPosition;
        const reprDefaults = defaults.length === 1 ? defaults[0] : defaults;
        const message = `unimplemented value at ${this.lastPosition}, size ${size} (should be ${reprDefaults} but was ${value})`;
        if (defaults.includes(value)) {
            return;
        }
        console.trace(message);
        if (process.stdin.isTTY) {
            this.openEditor();
        }
        process.exit();
    }

    openEditor() {
        if (!this.buffer.name) {
            const fp = require('fs').writeFileSync(require('path').join(__dirname, 'tempfile'), this.data());
            const name = fp.name;
            const isTemp = true;
        } else {
            const name = this.buffer.name;
            const isTemp = false;
        }

        try {
            require('readline-sync').question('Press enter to open hex editor...');
            openEditor(name, this.tell());
        } catch (error) {
            // Ignore error
        }

        require('readline-sync').question('(enter)');
    }
}

function openEditor(filename, position) {
    return require('child_process').spawnSync('010editor', [`${filename}@${position}`], { stdio: 'inherit' });
}

function checkDefault(reader, value, ...defaults) {
    const size = reader.tell() - reader.lastPosition;
    const reprDefaults = defaults.length === 1 ? defaults[0] : defaults;
    const message = `unimplemented value at ${reader.lastPosition}, size ${size} (should be ${reprDefaults} but was ${value})`;
    if (defaults.includes(value)) {
        return;
    }
    console.trace(message);
    if (process.stdin.isTTY) {
        reader.openEditor();
    }
    process.exit();
}
