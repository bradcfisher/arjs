
// !=illegal/undocumented
// #=immediate (1 byte: literal operand. No access modes implied / no label mapping)
// $=byte (1 byte: Read zero page addr. Label access mode 'r' is implied)
// %=byte (1 byte: Write zero page addr. Label access mode 'w' is implied)
// ^=byte (1 byte: rel addr. Label access mode 'x' is implied)
// $$=lohi (2 bytes: absolute address. Label access mode 'r' is implied)
// %%=lohi (2 bytes: absolute address. Label access mode 'w' is implied)
// ^^=lohi (2 bytes: absolute address. Label access mode 'x' is implied)

const mnemonics = [
['BRK',    'ORA ($,X)', '!JAM',   '!SLO ($,X)', '!NOP $',   'ORA $',   'ASL %',   '!SLO %',   'PHP', 'ORA #',    'ASL',  '!ANC #',    '!NOP $$',   'ORA $$',   'ASL %%',    '!SLO %%'  ],
['BPL ^',  'ORA ($),Y', '!JAM',   '!SLO ($),Y', '!NOP $,X', 'ORA $,X', 'ASL %,X', '!SLO %,X', 'CLC', 'ORA $$,Y', '!NOP', '!SLO %%,Y', '!NOP $$,X', 'ORA $$,X', 'ASL %%,X',  '!SLO %%,X'],
['JSR ^^', 'AND ($,X)', '!JAM',   '!RLA ($,X)', 'BIT $',    'AND $',   'ROL %',   '!RLA %',   'PLP', 'AND #',    'ROL',  '!ANC #',    'BIT $$',    'AND $$',   'ROL %%',    '!RLA %%'  ],
['BMI ^',  'AND ($),Y', '!JAM',   '!RLA ($),Y', '!NOP $,X', 'AND $,X', 'ROL %,X', '!RLA %,X', 'SEC', 'AND $$,Y', '!NOP', '!RLA %%,Y', '!NOP $$,X', 'AND $$,X', 'ROL %%,X',  '!RLA %%,X'],
['RTI',    'EOR ($,X)', '!JAM',   '!SRE ($,X)', '!NOP $',   'EOR $',   'LSR %',   '!SRE %',   'PHA', 'EOR #',    'LSR',  '!ALR #',    'JMP ^^',    'EOR $$',   'LSR %%',    '!SRE %%'  ],
['BVC ^',  'EOR ($),Y', '!JAM',   '!SRE ($),Y', '!NOP $,X', 'EOR $,X', 'LSR %,X', '!SRE %,X', 'CLI', 'EOR $$,Y', '!NOP', '!SRE %%,Y', '!NOP $$,X', 'EOR $$,X', 'LSR %%,X',  '!SRE %%,X'],
['RTS',    'ADC ($,X)', '!JAM',   '!RRA ($,X)', '!NOP $',   'ADC $',   'ROR %',   '!RRA %',   'PLA', 'ADC #',    'ROR',  '!ARR #',    'JMP ($$)',  'ADC $$',   'ROR %%',    '!RRA %%'  ],
['BVS ^',  'ADC ($),Y', '!JAM',   '!RRA ($),Y', '!NOP $,X', 'ADC $,X', 'ROR %,X', '!RRA %,X', 'SEI', 'ADC $$,Y', '!NOP', '!RRA %%,Y', '!NOP $$,X', 'ADC $$,X', 'ROR %%,X',  '!RRA %%,X'],
['!NOP #', 'STA ($,X)', '!NOP #', '!SAX ($,X)', 'STY %',    'STA %',   'STX %',   '!SAX %',   'DEY', '!NOP #',   'TXA',  '!ANE #',    'STY %%',    'STA %%',   'STX %%',    '!SAX %%'  ],
['BCC ^',  'STA ($),Y', '!JAM',   '!SHA ($),Y', 'STY %,X',  'STA %,X', 'STX %,Y', '!SAX %,Y', 'TYA', 'STA %%,Y', 'TXS',  '!TAS %%,Y', '!SHY %%,X', 'STA %%,X', '!SHX %%,Y', '!SHA %%,Y'],
['LDY #',  'LDA ($,X)', 'LDX #',  '!LAX ($,X)', 'LDY $',    'LDA $',   'LDX $',   '!LAX $',   'TAY', 'LDA #',    'TAX',  '!LXA #',    'LDY $$',    'LDA $$',   'LDX $$',    '!LAX $$'  ],
['BCS ^',  'LDA ($),Y', '!JAM',   '!LAX ($),Y', 'LDY $,X',  'LDA $,X', 'LDX $,Y', '!LAX $,Y', 'CLV', 'LDA $$,Y', 'TSX',  '!LAS $$,Y', 'LDY $$,X',  'LDA $$,X', 'LDX $$,Y',  '!LAX $$,Y'],
['CPY #',  'CMP ($,X)', '!NOP #', '!DCP ($,X)', 'CPY $',    'CMP $',   'DEC %',   '!DCP %',   'INY', 'CMP #',    'DEX',  '!SBX #',    'CPY $$',    'CMP $$',   'DEC %%',    '!DCP %%'  ],
['BNE ^',  'CMP ($),Y', '!JAM',   '!DCP ($),Y', '!NOP $,X', 'CMP $,X', 'DEC %,X', '!DCP %,X', 'CLD', 'CMP $$,Y', '!NOP', '!DCP %%,Y', '!NOP $$,X', 'CMP $$,X', 'DEC %%,X',  '!DCP %%,X'],
['CPX #',  'SBC ($,X)', '!NOP #', '!ISC ($,X)', 'CPX $',    'SBC $',   'INC %',   '!ISC %',   'INX', 'SBC #',    'NOP',  '!USBC #',   'CPX $$',    'SBC $$',   'INC %%',    '!ISC %%'  ],
['BEQ ^',  'SBC ($),Y', '!JAM',   '!ISC ($),Y', '!NOP $,X', 'SBC $,X', 'INC %,X', '!ISC %,X', 'SED', 'SBC $$,Y', '!NOP', '!ISC %%,Y', '!NOP $$,X', 'SBC $$,X', 'INC %%,X',  '!ISC %%,X']
];

export class LabelEntry {
    /**
     * (1) Label applies to read context.
     */
    static FLAG_READ  = 1;

    /**
     * (2) Label applies to write context.
     */
    static FLAG_WRITE   = 2;

    /**
     * (4) Label applies to write context.
     */
    static FLAG_EXECUTE = 4;

    /**
     * (7) Label applies to read, write and execute contexts.
     */
    static FLAG_ALL = 7;

    /**
     * The address the label is defined for.
     * @type {number}
     */
    offset;

    /**
     * The name assigned to the label.
     * @type {string}
     */
    name;

    /**
     * The size in bytes of the memory area the label references.
     * Default is 1 byte.
     * @type {number}
     */
    size;

    /**
     * Flags indicating the contexts the label applies to.
     * Default is {@link LabelEntry.FLAG_ALL}
     */
    flags;

    /**
     *
     * @param {number} offset
     * @param {string} name
     * @param {number?} size
     * @param {number?} flags
     */
    constructor(offset, name, size, flags) {
        this.offset = offset;
        this.name = name;
        this.size = (size != null ? size : 1);
        this.flags = (flags != null ? flags : LabelEntry.FLAG_ALL);
    }

    compare(other) {
        return LabelEntry.compare(this, other);
    }

    /**
     * Default ordering function.
     * Orders by ascending start offset and descending size when offsets are equal.
     * @param {LabelEntry} other the other entry to compare this one to.
     * @returns {number} 0 if this entry is less than other, 1 if greater, 0 if equal (same offset and size)
     */
    static compare(a, b) {
        if (a.offset < b.offset) return -1;  // Sort lower offsets earlier
        if (a.offset > b.offset) return 1;   // Sort higher offsets later

        if (a.size > b.size) return -1;      // Sort larger blocks earlier
        if (a.size < b.size) return 1;       // Sort smaller blocks later

        return 0;   // Both offset and size are identical
    }

    matchAddress(address) {
        if (address < this.offset) return 1;
        if (address >= this.offset + this.size) return -1;
        return 0;
    }

    toString() {
        return ((this.flags & LabelEntry.FLAG_READ) ? 'r' : '') +
            ((this.flags & LabelEntry.FLAG_WRITE) ? 'w' : '') +
            ((this.flags & LabelEntry.FLAG_EXECUTE) ? 'x' : '') +
            " " + fmtHex(this.offset) + "," + fmtHex(this.size) +
            " " + this.name;
    }
}

/**
 * @extends {Array<LabelEntry>}
 */
export class LabelCollection extends Array {

    /**
     * Collections to defer lookups to if no match is found in this collection.
     * This property allows defining a hierarchy of collections.
     * @type {LabelCollection[]}
     */
    extendedCollections = [];

    /**
     * Creates a new collection containing the specified LabelEntries
     * @param  {...(LabelCollection|LabelEntry|object)} items list of LabelCollections to extend or LabelEntries
     *         to include in this collection.
     */
    constructor(...items) {
        super();
        if (items != null) {
            for (var entry of items) {
                if (entry instanceof LabelCollection) {
                    this.extendedCollections.push(entry);
                } else if (entry instanceof LabelEntry) {
                    this.push(entry);
                } else {
                    this.push(new LabelEntry(entry.offset, entry.name, entry.size, entry.flags));
                }
            }
        }
    }

    /**
     * Retrieve a label reference for an address or null if no label covers the specified address.
     *
     * <p>
     * If a label entry is found and the address exactly matches the offset of the label, this will return the name
     * of the label. For example, `SOME_LABEL`.
     *
     * <p>
     * If requireExactMatch is false and the address isn't an exact match for the label's offset, but it falls
     * inside the range of bytes identified for the label, the return value will be the label name followed by
     * the '+' operator and the relative byte offset of the address from the label offset in decimal.
     * For example, `SOME_LABEL+3`.
     *
     * <p>
     * If no matching label entry is matched, or requireExactMatch is false and the entry is not an exact match,
     * the method returns the address converted to a hex value. Example, `$72ab`.
     *
     * @param {number} address the address to retrieve a label for.
     * @param {number} flags the access modes (rwx) to match. Only labels with one or more of the specified access
     *        mode flags will be matched and returned.
     * @param {boolean} requireExactMatch whether an exact match of the label's base offset is required (true) or
     *        if any match within the label's range of bytes is sufficient (false, the default).
     * @param {boolean} returnUndefinedIfNotFound whether to return undefined if no matching label is found or
     *        the formatted hex form of the address.
     *
     * @returns {string} label reference for the address or the address in hex if no label covers the specified
     *          address.
     */
    labelForAddress(
        address,
        flags,
        requireExactMatch,
        returnUndefinedIfNotFound
    ) {
        const found = this.entryForAddress(address, flags);
        if (found != null) {
            if (found.offset == address) {
                return found.name;
            } else if (!requireExactMatch) {
                return found.name + "+" + (address - found.offset);
            }
        }

        return (returnUndefinedIfNotFound ? undefined : '$' + fmtHex(address, (address < 256) ? 2 : 4));
    }

    /**
     * Retrieve a label entry for an address or null if no label covers the specified address.
     *
     * @param {number} address the address to retrieve a label entry for.
     * @param {number} flags the access modes (rwx) to match. Only labels with one or more of the specified access
     *        mode flags will be matched and returned.
     *
     * @returns {LabelEntry|undefined} a matching LabelEntry or undefined if no match was found.
     */
    entryForAddress(address, flags) {
        if (flags == null) {
            flags = LabelEntry.FLAG_ALL;
        }

        let matches = [];
        for (let entry of this) {
            if (entry.matchAddress(address) == 0 && (entry.flags & flags) != 0) {
                matches.push(entry);
            }
        }

        // If any matches found, sort and the last one in the list should be the most specific one
        if (matches.length > 0) {
            matches.sort(LabelEntry.compare);
            return matches[matches.length - 1];
        }

        // If no match found yet, check the extended collections
        for (let extended of this.extendedCollections) {
            const f = extended.entryForAddress(address, flags);
            if (f != null) {
                return f;
            }
        }

        return undefined;
    }

    sort(compareFn) {
        return super.sort(compareFn ? compareFn : LabelEntry.compare);
    }

    optimize() {
        //this.sort();
    }

    /**
     * Parses a set of label definitions into the collection.
     *
     * Two formats are currently supported (auto detected):
     * - Altirra symbol file - Detected if the first line starts with "Altirra symbol file"
     * - .lab file - assumed if other formats not detected. Each line should contain a hexadecimal number followed by
     *   a valid label name, separated by whitespace. Comments starting with ';' are permitted.
     *
     * TODO: Add support for other formats?
     * - MADS/XASM listing file
     * - .lbl file
     *
     * <p>
     * Each line of the input should contain an offset in hex and a label name, separated by whitespace
     * Comments may be specified with a ';' character and continue to the end of line
     * Blank lines and lines containing only whitespace or comments are ignored.
     *
     * @param {string} str the labels string to parse
     *
     * @return {this} the collection.
     */
    parse(str) {
        /** @type {LabelParser} */
        let format = null;
        String(str).split(/\r\n|\n|\r/).forEach((line) => {
            if (format == null) {
                if (line.startsWith("Altirra symbol file")) {
                    format = new AltirraSymbolFormat(this);
                    console.log("Parsing as an Altirra symbol file");
                } else {
                    format = new LabFileFormat(this);
                    console.log("Parsing as a '.lab' file");
                }
            }

            format.parse(line);
        });

        this.optimize();

        console.log("Read labels: ", this);
        return this;
    }

}

class LabelParser {
    /**
     * @type {LabelCollection}
     */
    labels;

    /**
     * @type {RegExp}
     */
    commentRe;

    /**
     * @type {number}
     */
    lastIndex;

    /**
     * @type {number}
     */
    lineNumber;

    /**
     * @type {string}
     */
    line;

    constructor(labels, commentPattern = ";.*") {
        this.labels = labels;
        this.commentRe = new RegExp(commentPattern, 'y');
        this.lineNumber = 0;
    }

    parse(line) {
        this.lastIndex = 0;
        this.line = line;
        ++this.lineNumber;

        this.skipWhitespaceAndComments();
        if (!this.isEndOfLine()) {
            this.processLine();
        }
    }

    throwParseError(message, index) {
        if (index == null) {
            index = this.lastIndex;
        }

        throw new Error("Parse error: " + message + " (at " + this.lineNumber + ":" + (index + 1) + " '" +
            this.line.substring(index, Math.min(this.line.length, this.lastIndex + 25)) + "')");
    }

    isEndOfLine() {
        return this.lastIndex >= this.line.length;
    }

    skipWhitespace(required) {
        const whitespaceRe = /\s+/y;
        whitespaceRe.lastIndex = this.lastIndex;

        const m = whitespaceRe.exec(this.line);
        if (m != null) {
            this.lastIndex = whitespaceRe.lastIndex;
        } else if (required) {
            this.throwParseError("Whitespace required");
        }
    }

    skipComment() {
        this.commentRe.lastIndex = this.lastIndex;
        const m = this.commentRe.exec(this.line);
        if (m != null) {
            this.lastIndex = this.commentRe.lastIndex;
        }
    }

    skipWhitespaceAndComments() {
        this.skipWhitespace(false);
        this.skipComment();
    }

    throwErrorIfNotEndOfLine() {
        if (!this.isEndOfLine()) {
            this.throwParseError("Unexpected trailing characters on line");
        }
    }

    readNumber(radix) {
        const numberRe = new RegExp('[' + '0123456789abcdefghijklmnopqrstuvwxyz'.substring(0, radix) + ']+', 'yi');
        numberRe.lastIndex = this.lastIndex;
        const m = numberRe.exec(this.line);
        if (m == null) {
            this.throwParseError("Expected base " + radix + " number");
        }

        this.lastIndex = numberRe.lastIndex;
        return Number.parseInt(m[0], radix);
    }

    readLabel() {
        const labelRe = /[a-zA-Z][a-zA-Z0-9_]*/y;
        labelRe.lastIndex = this.lastIndex;
        const m = labelRe.exec(this.line);
        if (m == null) {
            this.throwParseError("Expected label");
        }
        this.lastIndex = labelRe.lastIndex;
        return m[0];
    }
}


class AltirraSymbolFormat extends LabelParser {

    inSymbolsSection = false;

    /**
     *
     * @param {LabelCollection} labels
     */
    constructor(labels) {
        super(labels);
    }

    processLine() {
        if (this.line.charAt(this.lastIndex) == '[') {
            const section = this.readSection();
            this.inSymbolsSection = (section == "symbols");
            this.skipWhitespaceAndComments();
            this.throwErrorIfNotEndOfLine();
            return;
        }

        if (!this.inSymbolsSection) {
            return;
        }

        const flags = this.readFlags();

        this.skipWhitespace(true);
        const value = this.readNumber(16);

        this.skipWhitespace(false);
        if (this.line.charAt(this.lastIndex) == ',') {
            ++this.lastIndex;
        } else {
            this.throwParseError("Expected ','");
        }

        this.skipWhitespace(false);
        const size = this.readNumber(16);

        this.skipWhitespace(true);
        const label = this.readLabel();

        this.skipWhitespaceAndComments();
        this.throwErrorIfNotEndOfLine();

        this.labels.push(new LabelEntry(value, label, size, flags));
    }

    readSection() {
        const sectionRe = /\[([^\]]+)\]/y;
        sectionRe.lastIndex = this.lastIndex;
        const m = sectionRe.exec(this.line);
        if (m == null) {
            this.throwParseError("Invalid section heading");
        }
        this.lastIndex = sectionRe.lastIndex;
        this.skipWhitespaceAndComments();
        this.throwErrorIfNotEndOfLine();

        return m[1];
    }

    readFlags() {
        let flags = 0;
        let reading = true;

        while (reading && !this.isEndOfLine()) {
            const ch = this.line.charAt(this.lastIndex);
            switch (ch) {
            case 'r':
                flags |= LabelEntry.FLAG_READ;
                break;
            case 'w':
                flags |= LabelEntry.FLAG_WRITE;
                break;
            case 'x':
                flags |= LabelEntry.FLAG_EXECUTE;
                break;
            default:
                reading = false;
            }

            if (reading) {
                this.lastIndex++
            }
        }

        if (flags == 0) {
            this.throwParseError("Expected one or more of 'rwx' flags");
        }

        return flags;
    }

}

class LabFileFormat extends LabelParser {

    constructor(labels) {
        super(labels);
    }

    processLine() {
        const value = this.readNumber(16);
        this.skipWhitespace(true);

        const label = this.readLabel();
        this.skipWhitespaceAndComments();
        this.throwErrorIfNotEndOfLine();

        this.labels.push(new LabelEntry(value, label));
    }

}


/**
 * Searches a sorted collection of items to find the index of the first entry matching a given value and
 * predicate function.
 *
 * @template T the type of items in the collection
 * @param {ArrayLike<T>} collection the collection to search.
 * @param {number} startIncl the starting index of the range to search (inclusive).
 * @param {number} endExcl the ending index of the range to search (exclusive).
 * @param {*} value the value to find a match for.
 * @param {((entry: T, value: *) => number)?} matchFunction match predicate function to use. Returns <0 if should
 *        search to left of entry, >0 if should search to right and =0 if entry is a match.
 *
 * @returns {[ number, number, number ]} three element array. The first element is the index of the match found or
 *          -1 if no match was found or startIncl >= endExcl. The second element is the index of the closest match
 *          that was found, or -1 if the collection is empty. The third element is the comparison result for the
 *          closest match or undefined if the collection is empty.
 */
function binarySearch(collection, startIncl, endExcl, value, matchFunction) {
    let min = startIncl;
    let index = -1;
    let cmp;

    while (min < endExcl) {
        index = (min + endExcl) >>> 1;
        const entry = collection[index];
        cmp = matchFunction(entry, value);
        if (cmp == 0) {
            /*
            // Found a match. Scan backward to find the first such match to return.
            while (index > startIncl && (matchFunction(collection[index - 1], value) == 0)) {
                --index;
            }
            */

            //console.log("bs: " + collection.source + ": value=" + value + ": match=" + index + " ", entry);

            return [ index, index, 0 ];
        }

        if (cmp < 0) {
            //console.log("bs: " + collection.source + ": value=" + value + ": check to left: index=" + index + " ", entry);

            min = index + 1;
        } else {
            //console.log("bs: " + collection.source + ": value=" + value + ": check to right: index=" + index + " ", entry);

            endExcl = index;
        }
    }

    //console.log("bs: " + collection.source + ": value=" + value + ": not found: closest=" + index + " cmp=" + cmp);

    return [ -1, index, cmp ];
}


export class SegmentEntry {
    /**
     * Name assigned to the segment.
     * @type {string?}
     */
    name;

    /**
     * The offset within the source data where the segment data starts.
     * @type {number}
     */
    offset = 0;

    /**
     * The starting offset in memory where the segment should be loaded.
     * @type {number}
     */
    start = 0x1000;

    /**
     * The size of the segment data in bytes.
     * @type {number}
     */
    size;

    /**
     * If true, data inside the segment should be interpreted as raw bytes instead of executable code.
     * @type {boolean}
     */
    rawBytes = false;

    constructor(from) {
        if (from != null) {
            this.offset = (from.offset != null) ? Number.parseInt(from.offset) : undefined;
            this.size = (from.size != null) ? Number.parseInt(from.size) : undefined;
            this.start = (from.start != null) ? Number.parseInt(from.start) : 0x1000;
            this.name = (from.name != null) ? String(from.name) : undefined;
            this.rawBytes = !!from.rawBytes;
        }
    }

    matchOffset(offset) {
        if (this.offset + this.size - 1 < offset) return -1;
        if (this.offset > offset) return 1;
        return 0;
    }

    matchAddress(offset) {
        const delta = offset - this.start;
        if (delta < 0) {
            return 1;
        }

        if (delta >= this.size) {
            return -1;
        }

        return 0;
    }

    /**
     * Determines the offset within memory for a given source data offset.
     * @param {number} offset The offset within the source data to compute the memory offset for.
     * @return {number} the computed in memory offset or undefined if the provided source offset falls outside this
     *         segment.
     */
    getAddressForOffset(offset) {
        const delta = offset - this.offset;
        if (delta < 0) {
            return undefined;
        }

        if (delta >= this.size) {
            return undefined;
        }

        return this.start + delta;
    }

    toString() {
        // "0000 L0000 @0000 [raw]: Name"
        return fmtHex(this.offset) + " L" + fmtHex(this.size) + " @" + fmtHex(this.start)
            + (this.rawBytes ? " [raw]" : " [exe]")
            + (this.name != null ? " " + this.name : "");
    }
}

/**
 * Formats a number as a fixed width hex string.
 *
 * @param {number} value the value to format.
 * @param {number=} width the width to format the output to. Defaults to 4 if not provided.
 * @returns the formatted hex string.
 */
function fmtHex(value, width) {
    if (width == null) {
        width = 4;
    }
    if (value == null) {
        return " ".repeat(Math.max(0, width));
    }
    let v = Number(value);
    if (isNaN(v)) {
        return "?".repeat(Math.max(0, width));
    }
    v = v.toString(16);
    return '0'.repeat(Math.max(0, width - v.length)) + v;
}

/**
 * @extends {Array<SegmentEntry>}
 */
export class SegmentCollection extends Array {

    constructor(...items) {
        super();
        if (items != null) {
            for (var entry of items) {
                this.push(new SegmentEntry(entry));
            }
        }
    }

    /**
     * Returns the offset of the first segment in the collection or 0x1000 if the collection is empty.
     * @returns the offset of the first segment in the collection or 0x1000 if the collection is empty.
     */
    firstSegmentOffset() {
        if (this.length > 0) {
            return this[0].offset;
        }

        return 0x1000;
    }

    /**
     * Retrieve an entry from the collection matching the specified source byte offset.
     * @param {number} offset The offset within the source data to retrieve the segment entry for.
     * @returns {SegmentEntry} the segment that was found for the provided offset or a default SegmentEntry if
     *          the collection does not contain a match.
     */
    forOffset(offset) {
        const [ matchIndex, closestIndex ] =
            binarySearch(this, 0, this.length, offset, (entry, offset) => entry.matchOffset(offset));

        if (matchIndex >= 0) {
            return this[matchIndex];
        }

        return new SegmentEntry();
    }

    /**
     * Retrieve an entry from the collection matching the specified memory byte offset.
     * @param {number} address The offset within memory to retrieve the segment entry for.
     * @returns {SegmentEntry} the segment that was found for the provided offset or undefined if
     *          the collection does not contain a match.
     */
    entryForAddress(address) {
        const [ matchIndex, closestIndex ] =
            binarySearch(this, 0, this.length, address, (segment, address) => segment.matchAddress(address) );

        if (matchIndex >= 0) {
            return this[matchIndex];
        }

        return undefined;
    }

    sort(compareFn) {
        return super.sort(compareFn ? compareFn : (a, b) => a.matchOffset(b.offset));
    }

    optimize() {
        this.sort();
    }
}

export class DisasmOptions {
    /**
     * The starting source offset to assign to the first byte of the input data.
     *
     * This offset will be added to the current source byte offset to determine the segment
     * which applies.
     *
     * Defaults to 0.
     *
     * @type {number}
     */
    baseOffset = 0;

    /**
     * Collection of label entries.
     * Default is unassigned.
     * @type {LabelCollection}
     */
    labels = new LabelCollection();

    /**
     * Collection of segment entries.
     * @type {SegmentCollection}
     */
    segments = new SegmentCollection();

    /**
     * Whether to decode invalid instructions or not. When false, any invalid instructions
     * are output as raw bytes until the next valid instruction is encountered.
     * Default is false.
     * @type {boolean}
     */
    permitInvalidInstructions = false;

    /**
     * Whether to include the byte offset for each instruction in the listing.
     * Default is true.
     *
     * When offsets are visible, they are displayed in the first 6 characters of the line
     * as four hexadecimal digits, followed by a colon and a single space.
     *
     * For example: `1234: `
     *
     * @type {boolean}
     */
    showOffsets = true;

    /**
     * Whether to include the raw bytes in the listing.
     * Default is true.
     *
     * When visible, the raw bytes begin following the offset. Each byte is output as two
     * hexadecimal digits and is separated from any previously output byte by a single space.
     *
     * The last value output is followed by a minimum of two spaces. More spaces may be
     * present, depending on the value assigned to the rawBytesWidth option.
     *
     * For example: `00 01 02  `
     *
     * @type {boolean}
     */
    showRawBytes = true;

    /**
     * Minimum number of columns to output for the raw bytes if showRawBytes is true.
     * Default is 10 to accommodate for 3-byte instructions plus two spaces.
     *
     * Properly assigning this value can help ensure more consistent (less ragged) alignment
     * of labels and mnemonics in the output.
     *
     * @type {number}
     */
    rawBytesWidth = 10;

    /**
     * The maximum number of raw bytes to group into a single .BYTE directive.
     * Default is 8.
     * @type {number}
     */
    maxRawBytesPerGroup = 8;

    /**
     * The preferred number of characters to reserve for displaying labels.
     * Default is 16 to accommodate 14 characters for the label and 2 spaces following it.
     *
     * Note that this value is not guaranteed to be enforced. It is used to compute a desired
     * leftmost column to align mnemonics at, which is computed based on the visibility of
     * offsets and rawbytes along with their respective widths.
     *
     * For example, the default values for {@link showOffsets}, {@link showRawBytes},
     * {@link rawBytesWidth} and {@link labelWidth} ensures that mnemonics are displayed
     * starting at column 32 (computed as `6 + rawBytesWidth + labelWidth`
     * where 6 is the fixed offset column width).
     *
     * @type {number}
     */
    labelWidth = 16;

    /**
     * The preferred width to apply for displaying mnemonics.
     * Default is 18.
     * @type {number}
     */
    mnemonicWidth = 21;

    /**
     * Whether to display mnemonics in lowercase or uppercase.
     * Default is false.
     * @type {boolean}
     */
    lowerCaseMnemonics = false;

    /**
     * Whether to automatically infer labels for unlabelled addresses inside known segments which
     * are referenced by an instruction.
     * Default is true.
     * @type {boolean}
     */
    defineInferredLabels = true;

    /**
     * The preferred starting column for labels, based on the values of the showOffsets,
     * showRawBytes and rawBytesWidth options.
     *
     * This value is computed as the sum of the following, plus one:
     *  - The offset width of 6 (when {@link showOffsets} is true)
     *  - The {@link rawBytesWidth} (when {@link showRawBytes} is true)
     */
    get preferredLabelColumn() {
        const result =
            (this.showOffsets ? 6 : 0) +
            (this.showRawBytes ? Math.max(this.rawBytesWidth, 4) : 0);  // A single byte takes a min of 4 cols

        return result;
    }

    /**
     * The preferred starting column for mnemonics, based on the values of the {@link showOffsets},
     * {@link showRawBytes}, {@link rawBytesWidth} and {@link labelWidth} options.
     *
     * This value is computed as `preferredLabelColumn + labelWidth`.
     */
    get preferredMnemonicColumn() {
        return this.preferredLabelColumn + Math.max(0, this.labelWidth);
    }

    /**
     * The preferred starting column for comments, based on the values of the {@link showOffsets},
     * {@link showRawBytes}, {@link rawBytesWidth}, {@link labelWidth} and {@link mnemonicWidth}
     * options.
     *
     * This value is computed as `preferredMnemonicColumn + mnemonicWidth`.
     */
    get preferredCommentColumn() {
        return this.preferredMnemonicColumn + Math.max(0, this.mnemonicWidth);
    }

    constructor(from) {
        if (from != null) {
            Object.assign(this, from);
        }
    }

}

/**
 * Default disassembly options applied if no other options are specified.
 */
DisasmOptions.DEFAULT_OPTIONS = new DisasmOptions();

export class AsmOp {
    /**
     * Starting offset of the operation's byte codes in memory.
     * @type {number}
     */
    offset;

    /**
     * Raw bytes as stored in memory.
     * @type {byte[]}
     */
    bytes = [];

    /**
     * Whether the op should be represented as raw bytes or a mnemonic.
     */
    rawBytes = false;

    /**
     * When assigned, indicates the expected number of bytes for a complete instruction.
     * This property is automatically updated when a template is assigned.
     * @type {number?}
     */
    expectedSize;

    /**
     * The mnemonic template applicable to the first byte of the operation.
     * @type {string?}
     */
    #template;

    /**
     * Label assigned to the operation's offset.
     * @type {string?}
     */
    label;

    /**
     * Comment associated with the operation.
     * @type {string?}
     */
    comment;

    constructor(offset, label) {
        this.offset = offset;
        this.label = label;
    }

    /**
     * Mnemonic template to apply when formatting as a string.
     * If not assigned, will be output as raw bytes.
     */
    get template() {
        return this.#template;
    }

    set template(value) {
        if (value == null) {
            this.expectedSize = undefined;
        } else {
            const matches = value.match(/(?:[$#^%])/g);
            this.expectedSize = 1 + (matches == null ? 0 : matches.length);
        }
        this.#template = value;
    }

    /**
     * Returns a string representation of this operation.
     * @param {DisasmOptions?} options options to use for formatting the result. If not provided, will default to
     *        {@link DisasmOptions.DEFAULT_OPTIONS}.
     */
    toString(options) {
        if (options == null) {
            options = DisasmOptions.DEFAULT_OPTIONS;
        }

        let result = "";

        if (options.showOffsets) {
            result += fmtHex(this.offset) + ": ";
        }

        if (options.showRawBytes) {
            result += this.bytes.map((byte) => fmtHex(byte, 2)).join(" ") + "  ";
        }

        if (this.label) {
            result += " ".repeat(Math.max(0, options.preferredLabelColumn - result.length));
            result += this.label + "  ";
        }

        result += " ".repeat(Math.max(0, options.preferredMnemonicColumn - result.length));

        if (this.rawBytes) {
            result += ".BYTE " + this.bytes.map((byte) => "$" + fmtHex(byte, 2)).join(",");
        } else {
            // #=immediate (1 byte: literal operand. No access modes implied / no label mapping)
            // $=byte (1 byte: Read zero page addr. Label access mode 'r' is implied)
            // %=byte (1 byte: Write zero page addr. Label access mode 'w' is implied)
            // ^=byte (1 byte: rel addr. Label access mode 'x' is implied)
            // $$=lohi (2 bytes: absolute address. Label access mode 'r' is implied)
            // %%=lohi (2 bytes: absolute address. Label access mode 'w' is implied)
            // ^^=lohi (2 bytes: absolute address. Label access mode 'x' is implied)
            let ofs = 0;
            const template = (options.lowerCaseMnemonics ? this.template.toLowerCase() : this.template);

            result += template.replace(/\$\$|\^\^|%%|[$#^%]/, (substr) => {
                switch (substr) {
                // Literal
                case '#':
                    ++ofs;
                    return '#$' + fmtHex(this.bytes[ofs], 2);

                // Zero page read
                case '$':
                    ++ofs;
                    return options.labels.labelForAddress(this.bytes[ofs], LabelEntry.FLAG_READ);

                // Zero page write
                case '%':
                    ++ofs;
                    return options.labels.labelForAddress(this.bytes[ofs], LabelEntry.FLAG_WRITE);

                // Relative exec
                case '^': {
                    ++ofs;
                    let rel = this.bytes[ofs];
                    return options.labels.labelForAddress(this.offset + 2 + ((rel & 0x80) ? -((~rel & 0xff) + 1) : rel),
                        LabelEntry.FLAG_EXECUTE);
                    break;
                }

                // Absolute read
                case '$$':
                    ofs += 2;
                    return options.labels.labelForAddress((this.bytes[ofs] * 256) + this.bytes[ofs - 1],
                        LabelEntry.FLAG_READ);

                // Absolute write
                case '%%':
                    ofs += 2;
                    return options.labels.labelForAddress((this.bytes[ofs] * 256) + this.bytes[ofs - 1],
                        LabelEntry.FLAG_WRITE);

                // Absolute exec
                case '^^':
                    ofs += 2;
                    return options.labels.labelForAddress((this.bytes[ofs] * 256) + this.bytes[ofs - 1],
                        LabelEntry.FLAG_EXECUTE);

                default:
                    console.warn("Unexpected substr matched: '" + substr + "'");
                    return substr;
                }
            });

            ++ofs;
            if (ofs < this.bytes.length) {
                console.warn(`Template did not consume all bytes: ${ofs} bytes used, ${this.bytes.length} bytes expected`);
            }
        }

        let comment = this.comment;
        if (comment == null) {
            comment = this.bytes.map((byte) => {
                if (byte >= 0x20 && byte <= 0x7f) {
                    return String.fromCharCode(byte);
                } else {
                    return ".";
                }
            }).join('');
        }

        if (comment != null) {
            result += " ".repeat(Math.max(1, options.preferredCommentColumn - result.length - 1)) + " ; " + comment;
        }

        return result;
    }
}

class AsmOpListEntry {

    /**
     * @type {AsmOp|string}
     */
    op;

    /**
     * @type {AsmOpListEntry}
     */
    next;

    /**
     *
     * @param {AsmOp|string} op
     * @param {AsmOpListEntry} next
     */
    constructor(op, next) {
        this.op = op;
        this.next = next;
    }

    /**
     * Inserts an operation or sequence of operations between this operation and the next one in the list.
     * @param {AsmOpList|AsmOp|string} op the operation or operations to insert.
     */
    insertNext(op) {
        if (op instanceof AsmOpList) {
            if (op.first != null) {
                op.last.next = this.next;
                this.next = op.first;
            }
        } else {
            this.next = new AsmOpListEntry(op, this.next);
        }
    }

    /**
     *
     * @param {AsmOpListEntry?} entry
     * @returns {Iterator<AsmOpListEntry>}
     */
    static iteratorFor(entry) {
        let current = false;

        return {
            next() {
                let value;
                if (current === false) {
                    current = entry;
                } else if (current != null) {
                    current = current.next;
                }

                if (current == null) {
                    return { done: true };
                }

                return {
                    done: false,
                    value: current
                }
            },
            [Symbol.iterator]() {
                return this;
            }
        };
    }

}

/**
 * Linked list of operations.
 * @implements {Iterable<AsmOpListEntry>}
 */
class AsmOpList {

    /**
     * @type {AsmOpListEntry}
     */
    first;

    /**
     * @type {AsmOpListEntry}
     */
    last;

    constructor(...entries) {
        if (entries != null && entries.length) {
            this.add(...entries);
        }
    }

    /**
     * Adds one or more AsmOp or string entries to the end of the list.
     * @param  {...AsmOp|string} entries
     */
    add(...entries) {
        for (let op of entries) {
            const entry = new AsmOpListEntry(op);
            if (this.first == null) {
                this.first = this.last = entry;
            } else {
                this.last.next = this.last = entry;
            }
        }
    }

    [Symbol.iterator]() {
        return AsmOpListEntry.iteratorFor(this.first);
    }

}

/**
 *
 * @param {Uint8Array} bytes the bytes to disassemble
 * @param {DisasmOptions?} options disassembly options to apply. If not provided, will default to
 *        {@link DisasmOptions.DEFAULT_OPTIONS}.
 */
export function disassemble(bytes, options) {
    if (options == null) {
        options = DisasmOptions.DEFAULT_OPTIONS;
    } else if (!(options instanceof DisasmOptions)) {
        options = new DisasmOptions(options);
    }

    console.log("DisasmOptions: ", options);

    let i = 0;
    let baseOffset = options.baseOffset;
    /** @type {SegmentEntry} */
    let segment;
    /** @type {number} */
    let segmentOfs;
    /** @type {number} */
    let segmentEndOfs;
    /** @type {AsmOp} */
    let op;
    /** @type {AsmOpListEntry} */
    let prevOpEntry;
    let srcOfs = 0;
    /** @type {AsmOpList} */
    let ops = new AsmOpList();

    const newOperation = () => {
            // Next segment?
            let newSegment = false;
            if (segment == null || (segmentOfs >= segmentEndOfs && srcOfs < bytes.length)) {
                segment = options.segments.forOffset(srcOfs + baseOffset);
                segmentOfs = segment.getAddressForOffset(srcOfs + baseOffset);
                segmentEndOfs = segmentOfs + segment.size;
                newSegment = true;

                ops.add(
                    "\n" +
                    "; " + segment + "\n" +
                    "* = $" + fmtHex(segmentOfs, 4) + "\n"
                );
            }

            // Check if a label is defined that covers the current address
            // This check does not require an exact match as it's primary purpose is to
            // determine whether execution is expected at this location or if raw bytes
            // should be collected instead.
            const labelEntry = options.labels.entryForAddress(segmentOfs);
            if (labelEntry != null) {
                console.log("Found label entry for address " + segmentOfs + " (" + fmtHex(segmentOfs) + "): ", labelEntry);
            }

            const rawBytes = (segment.rawBytes || (labelEntry != null && ((labelEntry.flags & LabelEntry.FLAG_EXECUTE) == 0)));

            if (rawBytes && !newSegment && op.rawBytes && !(labelEntry != null && labelEntry.offset == segmentOfs)
                && (op.bytes.length < options.maxRawBytesPerGroup)) {
                // Was collecting raw bytes and we will still be collecting raw bytes
                // Don't need a new operation if no label for the current offset and
                // we haven't reached the max length yet.
                return;
            }

            // Start collecting the next operation
            prevOpEntry = ops.last;

            op = new AsmOp(segmentOfs);

            // Collect as raw bytes by default if the segment is data only
            // or if a non-executable label exists for the offset
            if (rawBytes) {
                op.rawBytes = true;
            }

            ops.add(op);
        };

    newOperation();

    for (; srcOfs < bytes.length && i < 100000; ++i) {
        const b = bytes[srcOfs];
        if (!segment.rawBytes) {
            // Segment may contain executable code
            // Map to mnemonic template
            let template = mnemonics[(b & 0xf0) >>> 4][b & 0xf];
            let invalid = (template.charAt(0) == '!');

            if (!invalid || options.permitInvalidInstructions) {
                if (op.bytes.length > 0) {
                    // Was collecting raw bytes, but now we found a valid instruction
                    // Output the raw bytes collected so far and start a new operation
                    newOperation();
                }

                op.bytes.push(b);
                if (!op.rawBytes) {
                    op.template = invalid ? template.substring(1) : template;
                }
            } else {
                // Invalid/undocumented instruction
                op.bytes.push(b);
                op.rawBytes = true;
            }
        } else {
            op.bytes.push(b);
        }

        if (op.rawBytes) {
            ++srcOfs;
            ++segmentOfs;

            if (op.bytes.length >= options.maxRawBytesPerGroup
                || srcOfs >= bytes.length
                || segmentOfs >= segmentEndOfs
            ) {
                newOperation();
            }
        } else {
            // Read any remaining operands for this operation
            while (true) {
                ++srcOfs;
                ++segmentOfs;

                if (srcOfs >= bytes.length || segmentOfs >= segmentEndOfs) {
                    // past end of current segment OR past end of input
                    if (op.bytes.length < op.expectedSize) {
                        // This is a truncated operation, output as plain bytes
                        op.rawBytes = true;
                    }
                    break;
                }

                if (op.bytes.length < op.expectedSize) {
                    op.bytes.push(bytes[srcOfs]);
                } else {
                    break;
                }
            }

            newOperation();
        }
    }

    // Remove last op if nothing was accumulated
    if (op.bytes.length == 0) {
        if (prevOpEntry == null) {
            ops.first = null;
            ops.last = null;
        } else {
            prevOpEntry.next = null;
            ops.last = prevOpEntry;
        }
    }

    const origLabels = options.labels;
    if (options.defineInferredLabels) {
        options.labels = new LabelCollection(options.labels);
        options.labels.source = "[Inferred labels]";
        const d = new Set();

        for (let opEntry of ops) {
            const op = opEntry.op;
            if (op.rawBytes === false) {
                let ofs = 0;
                const matches = op.template.match(/\$\$|\^\^|%%|[$#^%]/g);
                if (matches != null) {
                    matches.forEach((substr) => {
                        let addr = null;
                        let labelMode;
                        let requireExactMatch = false;

                        switch (substr) {
                            // Literal
                            case '#':
                                ++ofs;
                                return;

                            // Relative exec
                            case '^':
                            {
                                ++ofs;
                                let rel = op.bytes[ofs];
                                addr = op.offset + 2 + ((rel & 0x80) ? -((~rel & 0xff) + 1) : rel);
                                labelMode = LabelEntry.FLAG_ALL;
                                requireExactMatch = true;
                                break;
                            }

                            // Zero page read/write
                            case '$':
                            case '%':
                                ++ofs;
                                addr = op.bytes[ofs]
                                labelMode = LabelEntry.FLAG_READ | LabelEntry.FLAG_WRITE;
                                break;

                            // Absolute exec
                            case '^^':
                                ofs += 2;
                                addr = (op.bytes[ofs] * 256) + op.bytes[ofs - 1];
                                labelMode = LabelEntry.FLAG_ALL;
                                requireExactMatch = true;
                                break;

                            // Absolute read/write
                            case '$$':
                            case '%%':
                                ofs += 2;
                                addr = (op.bytes[ofs] * 256) + op.bytes[ofs - 1];
                                labelMode = LabelEntry.FLAG_READ | LabelEntry.FLAG_WRITE;
                                break;

                            default:
                                throw new Error("Unexpected value matched: " + substr);
                        }

                        if (isNaN(addr)) {
                            throw new Error("Address is not a number? addr=", addr);
                        }

                        // Define a label for the offset if the address falls in a known segment
                        // and there is no label defined for it yet
                        const segment = options.segments.entryForAddress(addr);
                        if (segment != null) {
                            console.log("Segment found, checking for label: addr=" + addr + " (" + fmtHex(addr) + ") mode=" + labelMode);
                            const found = options.labels.entryForAddress(addr, labelMode);
                            if ((found == null || (requireExactMatch && found.offset != addr)) && !d.has(addr)) {
                                // If this op is a JSR, use the 'sub_' prefix instead of 'loc_'
                                const prefix = (op.bytes[0] == 0x20 ? 'sub_' : 'loc_');

                                const label = new LabelEntry(addr, prefix + fmtHex(addr, 4), 1, labelMode);
                                console.log("Defining implied label: " + label);
                                options.labels.push(label);
                                d.add(addr);
                            }
                        }
                    });
                }
            }
        }

        //options.labels.optimize();
        console.log("inferred labels: ", options.labels);
    }

    let result = [];
    for (let opEntry of ops) {
        const op = opEntry.op;
        if (op.offset != null) {
            const labelFlags = op.rawBytes ? LabelEntry.FLAG_READ | LabelEntry.FLAG_WRITE : LabelEntry.FLAG_ALL;

            op.label = options.labels.labelForAddress(op.offset, labelFlags, true, true);

            if (op.rawBytes) {
                // Check remaining bytes for labels and split op if a label is found
                for (let i = 1; i < op.bytes.length; ++i) {
                    const label = options.labels.labelForAddress(op.offset + i, labelFlags, true, true);
                    if (label != null) {
                        // Split the op
                        const newOp = new AsmOp();
                        newOp.bytes = op.bytes.slice(i);
                        newOp.label = label;
                        newOp.offset = op.offset + i;
                        newOp.rawBytes = true;

                        op.bytes.splice(i);

                        opEntry.insertNext(newOp); // Modifies list, but safe to do while iterating
                    }
                }
            }
        }

        result.push(op.toString(options));
    }

    // Output the result
    options.labels = origLabels;

    return result.join("\n");
}


export const atari800Labels = new LabelCollection().parse(
`Altirra symbol file

[symbols]
; rwx address,length name
;   address & length are parsed as unsigned base 16

; Page 0
rw  0000,2  LINZBS
rw  0002,2  CASINI
rw  0004,2  RAMLO
rw  0006,1  TRAMSZ
rw  0007,1  TSTDAT
rw  0008,1  WARMST
rw  0009,1  BOOT
rw  000A,2  DOSVEC
rw  000C,2  DOSINI
rw  000E,2  APPMHI
rw  0010,1  POKMSK
rw  0011,1  BRKKEY
rw  0012,3  RTCLOK
rw  0015,2  BUFADR
rw  0017,1  ICCOMT
rw  0018,2  DSKFMS
rw  001A,2  DSKUTL
rw  001C,1  PTIMOT
rw  001D,1  PBPNT
rw  001E,1  PBUFSZ
rw  001F,1  PTEMP
; 0020 to 002F are the ZIOCB (Zero page IO control block)
rw  0020,1  ICHIDZ
rw  0021,1  ICDNOZ
rw  0022,1  ICCOMZ
rw  0023,1  ICSTAZ
rw  0024,1  ICBALZ
rw  0025,1  ICBAHZ
rw  0026,1  ICPTLZ
rw  0027,1  ICPTHZ
rw  0028,1  ICBLLZ
rw  0029,1  ICBLHZ
rw  002A,1  ICAX1Z
rw  002B,1  ICAX2Z
rw  002C,1  ICAX3Z
rw  002D,1  ICAX4Z
rw  002E,1  ICAX5Z
rw  002F,1  CIOCHR      ; Also called ICAX6Z
rw  0030,1  STATUS
rw  0031,1  CHKSUM
rw  0032,1  BUFRLO
rw  0033,1  BUFRHI
rw  0034,1  BFENLO
rw  0035,1  BFENHI
rw  0036,1  CRETRY
rw  0037,1  DRETRY
rw  0038,1  BUFRFL
rw  0039,1  RECVDN
rw  003A,1  XMTDON
rw  003B,1  CHKSNT
rw  003C,1  NOCKSM
rw  003D,1  BPTR
rw  003E,1  FTYPE
rw  003F,1  FEOF
rw  0040,1  FREQ
rw  0041,1  SOUNDR
rw  0042,1  CRITIC
rw  0043,7  FMZSPG
rw  0043,2  ZBUFP
rw  0045,2  ZDRVA
rw  0047,2  ZSBA
rw  0049,1  ERRNO
rw  004A,1  CKEY
rw  004B,1  CASSBT
rw  004C,1  DSTAT
rw  004D,1  ATRACT
rw  004E,1  DRKMSK
rw  004F,1  COLRSH
rw  0050,1  TEMP
rw  0051,1  HOLD1
rw  0052,1  LMARGN
rw  0053,1  RMARGN
rw  0054,1  ROWCRS
rw  0055,2  COLCRS
rw  0057,1  DINDEX
rw  0058,2  SAVMSC
rw  005A,1  OLDROW
rw  005B,2  OLDCOL
rw  005D,1  OLDCHR
rw  005E,2  OLDADR
rw  0060,1  NEWROW
rw  0061,2  NEWCOL
rw  0063,1  LOGCOL
rw  0064,2  ADRESS
rw  0066,2  MLTTMP
rw  0068,2  SAVADR
rw  006A,1  RAMTOP
rw  006B,1  BUFCNT
rw  006C,2  BUFSTR
rw  006E,1  BITMSK
rw  006F,1  SHFAMT
rw  0070,2  ROWAC       ; ANTIC_BLANK8?
rw  0072,2  COLAC
rw  0074,2  ENDPT
rw  0076,1  DELTAR
rw  0077,2  DELTAC
rw  0079,1  ROWINC
rw  007A,1  COLINC
rw  007B,1  SWPFLG
rw  007C,1  HOLDCH
rw  007D,1  INSDAT
rw  007E,2  COUNTR
; User memory/BASIC memory begins here at 0080
rw  0080,2  LOMEM
rw  0082,2  VNTP
rw  0084,2  VNTD
rw  0086,2  VVTP
rw  0088,2  STMTAB
rw  008A,2  STMCUR
rw  008C,2  STARP
rw  008E,2  RUNSTK
rw  0090,2  MEMTOP
rw  00BA,2  STOPLN
rw  00C3,1  ERRSAVE
rw  00C9,1  PTABW
; FP work area is 00D4-00FF
rw  00D4,6  FR0
rw  00E0,6  FR1
rw  00E6,6  FR2
rw  00EC,6  FRX
rw  00ED,1  EEXP
rw  00EE,1  NSIGN
rw  00EF,1  ESIGN
rw  00F0,1  FCHRFLG
rw  00F1,1  DIGRT
rw  00F2,1  CIX
rw  00F3,2  INBUFF
rw  00F5,2  ZTEMP1
rw  00F7,2  ZTEMP2
rw  00F9,2  ZTEMP3
rw  00FB,1  RADFLG  ; Also called DEGFLG (0 = radians, 6 = degrees)
rw  00FC,2  FLPTR
rw  00FE,2  FPTR2

; Page 2
rw  0200,2  VDSLST
rw  0202,2  VPRCED
rw  0204,2  VINTER
rw  0206,2  VBREAK
rw  0208,2  VKEYBD
rw  020A,2  VSERIN
rw  020C,2  VSEROR
rw  020E,2  VSEROC
rw  0210,2  VTIMR1
rw  0212,2  VTIMR2
rw  0214,2  VTIMR4
rw  0216,2  VIMIRQ
rw  0218,2  CDTMV1
rw  021A,2  CDTMV2
rw  021C,2  CDTMV3
rw  021E,2  CDTMV4
rw  0220,2  CDTMV5
rw  0222,2  VVBLKI
rw  0224,2  VVBLKD
rw  0226,2  CDTMA1
rw  0228,2  CDTMA2
rw  022A,1  CDTMF3
rw  022B,1  SRTIMR
rw  022C,1  CDTMF4
rw  022D,1  INTEMP
rw  022E,1  CDTMF5
rw  022F,1  SDMCTL
rw  0230,2  SDLST
rw  0232,1  SSKCTL
; 0233 is a spare byte
rw  0234,1  LPENH
rw  0235,1  LPENV
rw  0236,2  BRKKY
; 0238 and 0239 are spare bytes
rw  023A,1  CDEVIC
rw  023B,1  CCOMND
rw  023C,1  CAUX1
rw  023D,1  CAUX2
rw  023E,1  TEMP
rw  023F,1  ERRFLG
rw  0240,1  DFLAGS
rw  0241,1  DBSECT
rw  0242,2  BOOTAD
rw  0244,1  COLDST
; 0245 is a spare byte
rw  0246,1  DSKTIM
rw  0247,28 LINBUF      ; 40 byte temp line buffer
rw  026F,1  GPRIOR
rw  0270,1  PADDL0
rw  0271,1  PADDL1
rw  0272,1  PADDL2
rw  0273,1  PADDL3
rw  0274,1  PADDL4
rw  0275,1  PADDL5
rw  0276,1  PADDL6
rw  0277,1  PADDL7
rw  0278,1  STICK0
rw  0279,1  STICK1
rw  027A,1  STICK2
rw  027B,1  STICK3
rw  027C,1  PTRIG0
rw  027D,1  PTRIG1
rw  027E,1  PTRIG2
rw  027F,1  PTRIG3
rw  0280,1  PTRIG4
rw  0281,1  PTRIG5
rw  0282,1  PTRIG6
rw  0283,1  PTRIG7
rw  0284,1  STRIG0
rw  0285,1  STRIG1
rw  0286,1  STRIG2
rw  0287,1  STRIG3
rw  0288,1  CSTAT
rw  0289,1  WMODE
rw  028A,1  BLIM
; Bytes 28B to 28F are spare bytes
rw  0290,1  TXTROW
rw  0291,2  TXTCOL
rw  0293,1  TINDEX
rw  0294,2  TXTMSC
rw  0296,6  TXTOLD
rw  029C,1  TMPX1
rw  029D,1  HOLD3
rw  029E,1  SUBTMP
rw  029F,1  HOLD2
rw  02A0,1  DMASK
rw  02A1,1  TMPLBT
rw  02A2,1  ESCFLG
rw  02A3,F  TABMAP
rw  02B2,4  LOGMAP
rw  02B6,1  INVFLG
rw  02B7,1  FILFLG
rw  02B8,1  TMPROW
rw  02B9,2  TMPCOL
rw  02BB,1  SCRFLG
rw  02BC,1  HOLD4
rw  02BD,1  HOLD5
rw  02BE,1  SHFLOK
rw  02BF,1  BOTSCR
rw  02C0,1  PCOLR0
rw  02C1,1  PCOLR1
rw  02C2,1  PCOLR2
rw  02C3,1  PCOLR3
rw  02C4,1  COLOR0
rw  02C5,1  COLOR1
rw  02C6,1  COLOR2
rw  02C7,1  COLOR3
rw  02C8,1  COLOR4
; 2C9-2DF are spare bytes
rw  02E0,2  RUNAD
rw  02E2,2  INITAD
rw  02E4,1  RAMSIZ
rw  02E5,2  MEMTOP
rw  02E7,2  MEMLO
; 2E9 is a spare byte
rw  02EA,4  DVSTAT
rw  02EE,1  CBAUDL
rw  02EF,1  CBAUDH
rw  02F0,1  CRSINH
rw  02F1,1  KEYDEL
rw  02F2,1  CH1
rw  02F3,1  CHACT
rw  02F4,1  CHBAS
; 02F5 to 02F9 are unused bytes
rw  02FA,1  CHAR
rw  02FB,1  ATACHR
rw  02FC,1  CH
rw  02FD,1  FILDAT
rw  02FE,1  DSPFLG
rw  02FF,1  SSFLAG

; Page 3
rw  0300,1  DDEVIC
rw  0301,1  DUNIT
rw  0302,1  DCOMND
rw  0303,1  DSTATS
rw  0304,1  DBUFLO
rw  0305,1  DBUFHI
rw  0306,1  DTIMLO
; 0307 is unused
rw  0308,1  DBYTLO
rw  0309,1  DBYTHI
rw  030A,1  DAUX1
rw  030B,1  DAUX2
rw  030C,2  TIMER1
rw  030E,1  ADDCOR
rw  030F,1  CASFLG
rw  0310,2  TIMER2
rw  0312,2  TEMP1
rw  0314,1  TEMP2
rw  0315,1  TEMP3
rw  0316,1  SAVIO
rw  0317,1  TIMFLG
rw  0318,1  STACKP
rw  0319,1  TSTAT
rw  031A,26 HATABS      ; 38 byte table of 3 byte handler entries (1 byte device name char, 2 byte addr to handler)
; IOCB0
rw  0340,1  IC0HID
rw  0341,1  IC0DNO
rw  0342,1  IC0CMD
rw  0343,1  IC0STA
rw  0344,1  IC0BAL
rw  0345,1  IC0BAH
rw  0346,1  IC0PTL
rw  0347,1  IC0PTH
rw  0348,1  IC0BLL
rw  0349,1  IC0BLH
rw  034A,1  IC0AX1
rw  034B,1  IC0AX2
rw  034C,1  IC0AX3
rw  034D,1  IC0AX4
rw  034E,1  IC0AX5
rw  034F,1  IC0AX6
; IOCB1
rw  0350,1  IC1HID
rw  0351,1  IC1DNO
rw  0352,1  IC1CMD
rw  0353,1  IC1STA
rw  0354,1  IC1BAL
rw  0355,1  IC1BAH
rw  0356,1  IC1PTL
rw  0357,1  IC1PTH
rw  0358,1  IC1BLL
rw  0359,1  IC1BLH
rw  035A,1  IC1AX1
rw  035B,1  IC1AX2
rw  035C,1  IC1AX3
rw  035D,1  IC1AX4
rw  035E,1  IC1AX5
rw  035F,1  IC1AX6
; IOCB2
rw  0360,1  IC2HID
rw  0361,1  IC2DNO
rw  0362,1  IC2CMD
rw  0363,1  IC2STA
rw  0364,1  IC2BAL
rw  0365,1  IC2BAH
rw  0366,1  IC2PTL
rw  0367,1  IC2PTH
rw  0368,1  IC2BLL
rw  0369,1  IC2BLH
rw  036A,1  IC2AX1
rw  036B,1  IC2AX2
rw  036C,1  IC2AX3
rw  036D,1  IC2AX4
rw  036E,1  IC2AX5
rw  036F,1  IC2AX6
; IOCB3
rw  0370,1  IC3HID
rw  0371,1  IC3DNO
rw  0372,1  IC3CMD
rw  0373,1  IC3STA
rw  0374,1  IC3BAL
rw  0375,1  IC3BAH
rw  0376,1  IC3PTL
rw  0377,1  IC3PTH
rw  0378,1  IC3BLL
rw  0379,1  IC3BLH
rw  037A,1  IC3AX1
rw  037B,1  IC3AX2
rw  037C,1  IC3AX3
rw  037D,1  IC3AX4
rw  037E,1  IC3AX5
rw  037F,1  IC3AX6
; IOCB4
rw  0380,1  IC4HID
rw  0381,1  IC4DNO
rw  0382,1  IC4CMD
rw  0383,1  IC4STA
rw  0384,1  IC4BAL
rw  0385,1  IC4BAH
rw  0386,1  IC4PTL
rw  0387,1  IC4PTH
rw  0388,1  IC4BLL
rw  0389,1  IC4BLH
rw  038A,1  IC4AX1
rw  038B,1  IC4AX2
rw  038C,1  IC4AX3
rw  038D,1  IC4AX4
rw  038E,1  IC4AX5
rw  038F,1  IC4AX6
; IOCB5
rw  0390,1  IC5HID
rw  0391,1  IC5DNO
rw  0392,1  IC5CMD
rw  0393,1  IC5STA
rw  0394,1  IC5BAL
rw  0395,1  IC5BAH
rw  0396,1  IC5PTL
rw  0397,1  IC5PTH
rw  0398,1  IC5BLL
rw  0399,1  IC5BLH
rw  039A,1  IC5AX1
rw  039B,1  IC5AX2
rw  039C,1  IC5AX3
rw  039D,1  IC5AX4
rw  039E,1  IC5AX5
rw  039F,1  IC5AX6
; IOCB6
rw  03A0,1  IC6HID
rw  03A1,1  IC6DNO
rw  03A2,1  IC6CMD
rw  03A3,1  IC6STA
rw  03A4,1  IC6BAL
rw  03A5,1  IC6BAH
rw  03A6,1  IC6PTL
rw  03A7,1  IC6PTH
rw  03A8,1  IC6BLL
rw  03A9,1  IC6BLH
rw  03AA,1  IC6AX1
rw  03AB,1  IC6AX2
rw  03AC,1  IC6AX3
rw  03AD,1  IC6AX4
rw  03AE,1  IC6AX5
rw  03AF,1  IC6AX6
; IOCB7
rw  03B0,1  IC7HID
rw  03B1,1  IC7DNO
rw  03B2,1  IC7CMD
rw  03B3,1  IC7STA
rw  03B4,1  IC7BAL
rw  03B5,1  IC7BAH
rw  03B6,1  IC7PTL
rw  03B7,1  IC7PTH
rw  03B8,1  IC7BLL
rw  03B9,1  IC7BLH
rw  03BA,1  IC7AX1
rw  03BB,1  IC7AX2
rw  03BC,1  IC7AX3
rw  03BD,1  IC7AX4
rw  03BE,1  IC7AX5
rw  03BF,1  IC7AX6
rw  03C0,28 PRNBUF      ; 40 byte buffer
; 03E8 to 03FC are reserved spare buffer area
rw  03FD,83 CASBUF      ; 131 byte buffer
rw  057E,1  LBPR1
rw  057F,1  LBPR2
rw  0580,80 LBUFF       ; 128 byte BASIC output line buffer

rw  1329,1  DBUFAL
rw  1331,1  DBUFAH

; GTIA
w   D000,1  HPOSP0
w   D001,1  HPOSP1
w   D002,1  HPOSP2
w   D003,1  HPOSP3
w   D004,1  HPOSM0
w   D005,1  HPOSM1
w   D006,1  HPOSM2
w   D007,1  HPOSM3
w   D008,1  SIZEP0
w   D009,1  SIZEP1
w   D00A,1  SIZEP2
w   D00B,1  SIZEP3
w   D00C,1  SIZEM
w   D00D,1  GRAFP0
w   D00E,1  GRAFP1
w   D00F,1  GRAFP2
w   D010,1  GRAFP3
w   D011,1  GRAFM
w   D012,1  COLPM0
w   D013,1  COLPM1
w   D013,1  COLPM2
w   D015,1  COLPM3
w   D016,1  COLPF0
w   D017,1  COLPF1
w   D018,1  COLPF2
w   D019,1  COLPF3
w   D01A,1  COLBK
w   D01B,1  PRIOR
w   D01D,1  GRACTL
rw  D01F,1  CONSOL
r   D000,1  M0PF
r   D001,1  M1PF
r   D002,1  M2PF
r   D003,1  M3PF
r   D004,1  P0PF
r   D005,1  P1PF
r   D006,1  P2PF
r   D007,1  P3PF
r   D008,1  M0PL
r   D009,1  M1PL
r   D00A,1  M2PL
r   D00B,1  M3PL
r   D00C,1  P0PL
r   D00D,1  P1PL
r   D00E,1  P2PL
r   D00F,1  P3PL
r   D010,1  TRIG0
r   D011,1  TRIG1
r   D012,1  TRIG2
r   D013,1  TRIG3
r   D013,1  PAL

; POKEY
w   D200,1  AUDF1
w   D201,1  AUDC1
w   D202,1  AUDF2
w   D203,1  AUDC2
w   D204,1  AUDF3
w   D205,1  AUDC3
w   D206,1  AUDF4
w   D207,1  AUDC4
w   D208,1  AUDCTL
w   D209,1  STIMER
w   D20A,1  SKRES
w   D20B,1  POTGO
w   D20D,1  SEROUT
w   D20E,1  IRQEN
w   D20F,1  SKCTL
r   D200,1  POT0
r   D201,1  POT1
r   D202,1  POT2
r   D203,1  POT3
r   D204,1  POT4
r   D205,1  POT5
r   D206,1  POT6
r   D207,1  POT7
r   D208,1  ALLPOT
r   D209,1  KBCODE
r   D20A,1  RANDOM
r   D20E,1  IRQST
r   D20F,1  SKSTAT

; PIA
rw  D300,1  PORTA
rw  D301,1  PORTB
rw  D302,1  PACTL
rw  D303,1  PBCTL

; ANTIC
w   D400,1  DMACTL
w   D401,1  CHACTL
w   D402,2  DLIST
w   D407,1  PMBASE
w   D409,1  CHBASE
w   D40A,1  WSYNC
r   D40B,1  VCOUNT
r   D40C,1  PENH
r   D40D,1  PENV
w   D40E,1  NMIEN
w   D40F,1  NMIRES
r   D40F,1  NMIST

; Math Pack
rwx D800,1  AFP
rwx D8E6,1  FASC
rwx D9AA,1  IPF
rwx D9D2,1  FPI         ; __ftol
rwx DA44,1  ZFR0
rwx DA46,1  ZF1
;rwx DA48,1  ZFL	     ; undocumented (used by Atari Basic) - zero Y bytes at (X)
;rwx DA51,1  LDBUFA      ; undocumented (used by Atari Basic) - mwa #ldbuf inbuff
rwx DA66,1  FADD
rwx DA60,1  FSUB
rwx DADB,1  FMUL
rwx DB28,1  FDIV
;rwx DBA1,1  SKPSPC      ; undocumented (used by Atari Basic) - skip spaces starting at INBUFF[CIX]
;rwx DBAF,1  ISDIGT      ; undocumented (used by Atari Basic) - set carry if INBUFF[CIX] is not a digit
;rwx DC00,1  NORMALIZE   ; undocumented (used by Atari Basic) - normalize mantissa/exponent in FR0
rwx DD40,1  PLYEVL
rwx DD89,1  FLD0R
rwx DD8D,1  FLD0P
rwx DD98,1  FLD1R
rwx DD9C,1  FLD1P
rwx DDA7,1  FST0R
rwx DDAB,1  FST0P
rwx DDB6,1  FMOVE
rwx DDC0,1  EXP
rwx DDCC,1  EXP10
;rwx DE95,1  REDRNG     ; undocumented (used by Atari Basic) - reduce range via y = (x-1)/(x+1)
rwx DECD,1  LOG
rwx DED1,1  LOG10

; Kernel
rwx E400,3  EDITRV
rwx E410,3  SCRENV
rwx E420,3  KEYBDV
rwx E430,3  PRINTV
rwx E440,3  CASETV
rwx E450,3  DISKIV
rwx E453,3  DSKINV
rwx E456,3  CIOV
rwx E459,3  SIOV
rwx E45C,3  SETVBV
rwx E45F,3  SYSVBV
rwx E462,3  XITVBV
rwx E465,3  SIOINV
rwx E468,3  SENDEV
rwx E46B,3  INTINV
rwx E46E,3  CIOINV
rwx E471,3  BLKBDV
rwx E474,3  WARMSV
rwx E477,3  COLDSV
rwx E47A,3  RBLOKV
rwx E47D,3  CSOPIV
rwx E480,3  VCTABL
`);
