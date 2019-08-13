const brotli = require("brotli");
const fs = require("fs");

const brotliSettings = {
  extension: "br",
  skipLarger: true,
  mode: 1,
  quality: 10,
  lgwin: 12
};

fs.readdirSync("build/").forEach(file => {
  if (file.endsWith(".js") || file.endsWith(".css") || file.endsWith(".html")) {
    const result = brotli.compress(
      fs.readFileSync("build/" + file),
      brotliSettings
    );
    fs.writeFileSync("build/" + file + ".br", result);
  }
});
console.log("brotli compression completed.");
