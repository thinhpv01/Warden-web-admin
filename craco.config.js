const path = require('path');
module.exports = {
    webpack: {
        alias: {
            '@Core': path.resolve(__dirname, 'src/submodules/warden-ops-base-model/base-model'),
            '@LocationOps': path.resolve(__dirname, 'src/submodules/warden-ops-base-model/location-ops-model'),
            '@WardenOps': path.resolve(__dirname, 'src/submodules/warden-ops-base-model/warden-ops-model'),

            '@components': path.resolve(__dirname, 'src/components'),
            '@config': path.resolve(__dirname, 'src/config'),
            '@controllers': path.resolve(__dirname, 'src/controllers'),
            '@helpers': path.resolve(__dirname, 'src/helpers'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@i18n': path.resolve(__dirname, 'src/i18n'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@theme': path.resolve(__dirname, 'src/theme'),
        },
    },
};
