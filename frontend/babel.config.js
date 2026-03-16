module.exports = function(api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: ["nativewind/babel"], // ¡Esta es la línea mágica!
    };
};
