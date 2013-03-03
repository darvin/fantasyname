/**
 * @file A fantasy name generator library.
 * @version 1.0
 * @license Public Domain
 *
 * This library is designed after the RinkWorks Fantasy Name Generator.
 * @see http://www.rinkworks.com/namegen/
 *
 * @example
 * var generator = NameGen.compile("sV'i");
 * generator.toString();  // Emits a new name on each call
 * // => "entheu'loaf"
 *
 * ## Pattern Syntax
 *
 *   The compile() function creates a name generator based on an input
 * pattern. The letters s, v, V, c, B, C, i, m, M, D, and d represent
 * different types of random replacements. Everything else is emitted
 * literally.
 *
 *   s - generic syllable
 *   v - vowel
 *   V - vowel or vowel combination
 *   c - consonant
 *   B - consonant or consonant combination suitable for beginning a word
 *   C - consonant or consonant combination suitable anywhere in a word
 *   i - for an insult
 *   m - for a mushy name
 *   M - for a mushy name ending
 *   D - or consonant suited for a stupid person's name
 *   d - suited for a stupid person's name (always begins with a vowel)
 *
 *   All characters between parenthesis () are emitted literally. For
 * example, the pattern "s(dim)", emits a random generic syllable
 * followed by "dim".
 *
 *   Characters between angle brackets <> emit patterns from the table
 * above. Imagine the entire pattern is wrapped in one of these.
 *
 *   In both types of groupings, a vertical bar | denotes a random
 * choice. Empty groups are allowed. For example, "(foo|bar)" emits
 * either "foo" or "bar". The pattern "<c|v|>" emits a constant,
 * vowel, or nothing at all.
 *
 * ## Internals
 *
 *   A name generator is anything with a toString() method, including,
 * importantly, strings themselves. The generator constructors
 * (Random, Sequence) perform additional optimizations when *not* used
 * with the `new` keyword: they may pass through a provided generator,
 * combine provided generators, or even return a simple string.
 *
 *   New pattern symbols added to NameGen.symbols will automatically
 * be used by the compiler.
 */

/**
 * @namespace NameGen Everything relevant to the name generators.
 */
var NameGen = NameGen || {};

/**
 * Strings generated by the symbol generators.
 */
NameGen.symbols = {
    s: ['ach', 'ack', 'ad', 'age', 'ald', 'ale', 'an', 'ang', 'ar', 'ard',
        'as', 'ash', 'at', 'ath', 'augh', 'aw', 'ban', 'bel', 'bur', 'cer',
        'cha', 'che', 'dan', 'dar', 'del', 'den', 'dra', 'dyn', 'ech', 'eld',
        'elm', 'em', 'en', 'end', 'eng', 'enth', 'er', 'ess', 'est', 'et',
        'gar', 'gha', 'hat', 'hin', 'hon', 'ia', 'ight', 'ild', 'im', 'ina',
        'ine', 'ing', 'ir', 'is', 'iss', 'it', 'kal', 'kel', 'kim', 'kin',
        'ler', 'lor', 'lye', 'mor', 'mos', 'nal', 'ny', 'nys', 'old', 'om',
        'on', 'or', 'orm', 'os', 'ough', 'per', 'pol', 'qua', 'que', 'rad',
        'rak', 'ran', 'ray', 'ril', 'ris', 'rod', 'roth', 'ryn', 'sam',
        'say', 'ser', 'shy', 'skel', 'sul', 'tai', 'tan', 'tas', 'ther',
        'tia', 'tin', 'ton', 'tor', 'tur', 'um', 'und', 'unt', 'urn', 'usk',
        'ust', 'ver', 'ves', 'vor', 'war', 'wor', 'yer'],
    v: ['a', 'e', 'i', 'o', 'u', 'y'],
    V: ['a', 'e', 'i', 'o', 'u', 'y', 'ae', 'ai', 'au', 'ay', 'ea', 'ee',
        'ei', 'eu', 'ey', 'ia', 'ie', 'oe', 'oi', 'oo', 'ou', 'ui'],
    c: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r',
        's', 't', 'v', 'w', 'x', 'y', 'z'],
    B: ['b', 'bl', 'br', 'c', 'ch', 'chr', 'cl', 'cr', 'd', 'dr', 'f', 'g',
        'h', 'j', 'k', 'l', 'll', 'm', 'n', 'p', 'ph', 'qu', 'r', 'rh', 's',
        'sch', 'sh', 'sl', 'sm', 'sn', 'st', 'str', 'sw', 't', 'th', 'thr',
        'tr', 'v', 'w', 'wh', 'y', 'z', 'zh'],
    C: ['b', 'c', 'ch', 'ck', 'd', 'f', 'g', 'gh', 'h', 'k', 'l', 'ld', 'll',
        'lt', 'm', 'n', 'nd', 'nn', 'nt', 'p', 'ph', 'q', 'r', 'rd', 'rr',
        'rt', 's', 'sh', 'ss', 'st', 't', 'th', 'v', 'w', 'y', 'z'],
    i: ['air', 'ankle', 'ball', 'beef', 'bone', 'bum', 'bumble', 'bump',
        'cheese', 'clod', 'clot', 'clown', 'corn', 'dip', 'dolt', 'doof',
        'dork', 'dumb', 'face', 'finger', 'foot', 'fumble', 'goof',
        'grumble', 'head', 'knock', 'knocker', 'knuckle', 'loaf', 'lump',
        'lunk', 'meat', 'muck', 'munch', 'nit', 'numb', 'pin', 'puff',
        'skull', 'snark', 'sneeze', 'thimble', 'twerp', 'twit', 'wad',
        'wimp', 'wipe'],
    m: ['baby', 'booble', 'bunker', 'cuddle', 'cuddly', 'cutie', 'doodle',
        'foofie', 'gooble', 'honey', 'kissie', 'lover', 'lovey', 'moofie',
        'mooglie', 'moopie', 'moopsie', 'nookum', 'poochie', 'poof',
        'poofie', 'pookie', 'schmoopie', 'schnoogle', 'schnookie',
        'schnookum', 'smooch', 'smoochie', 'smoosh', 'snoogle', 'snoogy',
        'snookie', 'snookum', 'snuggy', 'sweetie', 'woogle', 'woogy',
        'wookie', 'wookum', 'wuddle', 'wuddly', 'wuggy', 'wunny'],
    M: ['boo', 'bunch', 'bunny', 'cake', 'cakes', 'cute', 'darling',
        'dumpling', 'dumplings', 'face', 'foof', 'goo', 'head', 'kin',
        'kins', 'lips', 'love', 'mush', 'pie', 'poo', 'pooh', 'pook', 'pums'],
    D: ['b', 'bl', 'br', 'cl', 'd', 'f', 'fl', 'fr', 'g', 'gh', 'gl', 'gr',
        'h', 'j', 'k', 'kl', 'm', 'n', 'p', 'th', 'w'],
    d: ['elch', 'idiot', 'ob', 'og', 'ok', 'olph', 'olt', 'omph', 'ong',
        'onk', 'oo', 'oob', 'oof', 'oog', 'ook', 'ooz', 'org', 'ork', 'orm',
        'oron', 'ub', 'uck', 'ug', 'ulf', 'ult', 'um', 'umb', 'ump', 'umph',
        'un', 'unb', 'ung', 'unk', 'unph', 'unt', 'uzz']
};

/**
 * Return true if the given thing is a string.
 * @param object - The object to be tested
 * @returns {boolean}
 * @private
 */
NameGen._isString = function (object) {
    return Object.prototype.toString.call(object) === '[object String]';
};

/**
 * Combine adjacent strings in the array.
 * @param {Array} array - The array to be compressed (unmodified)
 * @returns {Array} A new array with the strings compressed
 * @private
 */
NameGen._compress = function (array) {
    var emit = [], accum = [];
    function dump() {
        if (accum.length > 0) {
            emit.push(accum.join(''));
            accum.length = 0;
        }
    }
    for (var i = 0; i < array.length; i++) {
        if (NameGen._isString(array[i])) {
            accum.push(array[i]);
        } else {
            dump();
            emit.push(array[i]);
        }
    }
    dump();
    return emit;
};

/**
 * @param {string} string
 * @returns {string}
 */
NameGen._capitalize = function(string) {
    return string.replace(/^./, function(c) {
        return c.toUpperCase();
    });
};


/**
 * When emitting, selects a random generator.
 * @param {Array} generators - An array of name generators
 * @returns A name generator, not necessarily a new one
 * @constructor
 */
NameGen.Random = function(generators) {
    if (!(this instanceof NameGen.Random)) {
        switch (generators.length) {
        case 0:
            return '';
        case 1:
            return generators[0];
        default:
            return new NameGen.Random(generators);
        }
    }
    this.sub = generators;
    return this;
};

/**
 * Generate a new name.
 * @returns {string}
 * @method
 */
NameGen.Random.prototype.toString = function() {
    if (this.sub.length > 0) {
        var i = Math.floor(Math.random() * this.sub.length);
        return this.sub[i].toString();
    } else {
        return '';
    }
};

/**
 * Runs each provided generator in turn when generating.
 * @param {Array} generators - An array of name generators
 * @returns A name generator, not necessarily a new one
 * @constructor
 */
NameGen.Sequence = function(generators) {
    generators = NameGen._compress(generators);
    if (!(this instanceof NameGen.Sequence)) {
        switch (generators.length) {
        case 0:
            return '';
        case 1:
            return generators[0];
        default:
            return new NameGen.Sequence(generators);
        }
    }
    this.sub = generators;
    return this;
};

/**
 * Generate a new name.
 * @returns {string}
 * @method
 */
NameGen.Sequence.prototype.toString = function() {
    return this.sub.join('');
};

/**
 * Decorate a generator by capitalizing its output.
 * @param generator - The generator to be decorated.
 * @returns A new generator.
 * @constructor
 */
NameGen.Capitalizer = function(generator) {
    if (!(this instanceof NameGen.Capitalizer)) {
        return new NameGen.Capitalizer(generator);
    }
    /** @method */
    this.toString = function() {
        return NameGen._capitalize(generator.toString());
    };
    return this;
};

/**
 * @returns Last element of the array.
 * @method
 */
Array.prototype.last = function() {
    return this[this.length - 1];
};

/**
 * Compile a generator specification string into a generator.
 * @param {string} input - The pattern string to compile
 * @param {boolean} [capitalize=false] - Capitalize generator output
 * @returns A name generator
 */
NameGen.compile = function(input, capitalize) {
    var SYMBOL = 0, LITERAL = 1;
    var stack = [];

    function push(mode) {
        stack.push({mode: mode, set: [[]]});
    }
    function pop() {
        return NameGen.Random(stack.pop().set.map(NameGen.Sequence));
    }

    push(SYMBOL);
    for (var i = 0; i < input.length; i++) {
        var c = input[i];
        switch (c) {
        case '<':
            push(SYMBOL);
            break;
        case '(':
            push(LITERAL);
            break;
        case '>':
        case ')':
            if (stack.length === 1) {
                throw new Error('Unbalanced brackets.');
            } else if (c === '>' && stack.last().mode === LITERAL) {
                throw new Error('Unexpected ">" in input.');
            } else if (c === ')' && stack.last().mode === SYMBOL) {
                throw new Error('Unexpected ")" in input.');
            }
            var top = pop();
            stack.last().set.last().push(top);
            break;
        case '|':
            stack.last().set.push([]);
            break;
        default:
            if (stack.last().mode === LITERAL) {
                stack.last().set.last().push(c);
            } else {
                var generators = NameGen.Random(NameGen.symbols[c] || [c]);
                stack.last().set.last().push(generators);
            }
            break;
        }
    }
    if (stack.length !== 1) {
        throw new Error('Missing closing bracket.');
    }
    if (capitalize) {
        return NameGen.Capitalizer(pop());
    } else {
        return pop();
    }
};
