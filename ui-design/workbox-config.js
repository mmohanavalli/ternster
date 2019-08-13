module.exports = {
  globDirectory: "./build/",
  globPatterns: ["index.html", "*.js", "assets/**/*.webp", "manifest.json"],
  dontCacheBustURLsMatching: new RegExp(".+.[a-f0-9]{20}..+"),
  maximumFileSizeToCacheInBytes: 5000000,
  swSrc: "./src/service-worker.js",
  swDest: "./build/service-worker.js"
};
