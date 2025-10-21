const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para excluir react-native-maps en web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configuración para resolver módulos específicos de plataforma
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Excluir react-native-maps de la compilación web
config.resolver.blockList = [
  // Bloquear react-native-maps en web
  /.*\/node_modules\/react-native-maps\/.*\.web\.js$/,
  /.*\/node_modules\/react-native-maps\/.*\.web\.ts$/,
  /.*\/node_modules\/react-native-maps\/.*\.web\.tsx$/,
];

module.exports = config;
