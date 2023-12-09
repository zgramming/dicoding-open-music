const fs = require('fs');

class StorageService {
  constructor(folder) {
    this.folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {
        recursive: true,
      });
    }
  }

  async writeFile(file, meta) {
    const filename = +new Date() + meta.filename;

    const path = `${this.folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    const result = new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);

      file.on('end', () => resolve(filename));
    });

    return result;
  }
}

module.exports = StorageService;
