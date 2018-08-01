const fs = require('fs');

module.exports = filepath => {
    const fd = fs.openSync(filepath, 'r');
    const buffer = Buffer.allocUnsafe(1);
    let line = '';
    let chars = 0;

    while (++chars < 100) {
        fs.readSync(fd, buffer, 0, 1);
        char = buffer.toString('utf8');
        if (char === '\n' && (line = line.trim())) break;
        line += char;
    }

    return line;
};
