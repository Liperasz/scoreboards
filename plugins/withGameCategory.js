const { withAndroidManifest } = require('expo/config-plugins');

// marca o app como jogo no android: appCategory agrupa na pasta de jogos e isGame
// ativa o modo de jogo do sistema (a categoria na play store é escolhida no console)
module.exports = function withGameCategory(config) {

    return withAndroidManifest(config, mod => {

        const application = mod.modResults.manifest.application[0];

        application.$['android:appCategory'] = 'game';
        application.$['android:isGame'] = 'true';

        return mod;

    });

};
