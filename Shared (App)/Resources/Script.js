document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("button.open-preferences")?.addEventListener('click', openPreferences);
    document.getElementById("howtoButton")?.addEventListener('click', () => document.getElementById("howto")?.classList.toggle('hidden'));
    document.getElementById("localeButtonEN")?.addEventListener('click', () => translate('en'));
    document.getElementById("localeButtonRU")?.addEventListener('click', () => translate('ru'));

    const language = navigator.language.slice(0, 2);
    switch (language) {
        case 'ru':
            translate('ru');
            break;
        default:
            translate('en');
    }
});

function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    if (useSettingsInsteadOfPreferences) {
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

function translate(language) {
    const elements = document.querySelectorAll("[data-translate]");
    for (const elem of elements) {
        const key = elem.getAttribute("data-translate");
        elem.innerHTML = translations[language][key];
    }
}

var translations = {
    "en": {
        "howToEnable": "How to enable:",
        "openSettings": "Open <b>Settings</b> app",
        "clickSafari": "Tap <b>Safari</b>, then <b>Extensions</b>",
        "enableUsage": "Enable <b>Boosty Timecodes</b>",
        "allowIn": "Select <b>Allow</b> on <b>boosty.to</b>",
        "youCanEnable": "You can enable the Boosty Timecodes extension in settings",
        "extensionIsOn": "The Boosty Timecodes extension is on. You can turn it off in settings",
        "extensionIsOff": "The Boosty Timecodes extension is off. You can turn it on in settings",
        "goToSettings": "Open settings",
    },
    "ru": {
        "howToEnable": "Как включить:",
        "openSettings": "Открываем <b>Настройки</b>",
        "clickSafari": "Нажимаем <b>Safari</b>, потом <b>Расширения</b>",
        "enableUsage": "Включаем <b>Boosty Timecodes</b>",
        "allowIn": "Выбираем <b>Разрешить</b> в <b>boosty.to</b>",
        "youCanEnable": "Вы можете включить расширение Boosty Timecodes в настройках",
        "extensionIsOn": "Расширение Boosty Timecodes включено. Вы можете выключить его в настройках",
        "extensionIsOff": "Расширение Boosty Timecodes выключено. Вы можете включить его в настройках",
        "goToSettings": "Перейти в настройки",
    }
};