const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .glb / .gltf 3D model files as static assets
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
