// Do not call this constructor directly to get or create a settings object
// Always call UserDataHandle.getSettings();
class UserSettings {
    static LINKED_SETTINGS_KEYS = {
        'shelterEnable': 'QoLShelterFeatures',
        'publicFieldEnable': 'QoLPublicFieldFeatures',
        'privateFieldEnable': 'QoLPrivateFieldFeatures'
    };
    static FEATURE_SETTINGS_KEYS = [
        MultiUser.SETTING_KEY
    ];

    constructor() {
        console.log('Initializing QoL settings');
        this.setDefaults();
        this.loadSettings();
        this.changeListeners = [];
    }
    // Set the default settings values (does not save to storage)
    // These are used when someone first enables the script, when settings are reset,
    // or when a new setting is added that the user doesn't have already in storage
    setDefaults() {
        this.QoLSettings = {
            customCss : '',
            enableDaycare : true,
            shelterEnable : true,
            fishingEnable : true,
            publicFieldEnable : true,
            privateFieldEnable : true,
            partyMod : true,
            easyEvolve : true,
            labNotifier : true,
            dexFilterEnable : true,
            condenseWishforge : true,
            interactionsEnable : true,
            summaryEnable : true
        }
        this.QoLShelterFeatures = {
            search: true,
            sort: true,
        };
        this.QoLPublicFieldFeatures = {
            search: true,
            sort: true,
            release: true,
            tooltip: true,
            pkmnlinks: true
        };
        this.QoLPrivateFieldFeatures = {
            search: true,
            release: true,
            tooltip: true,
            pkmnlinks: true
        };
        this.setPageDefaults('ALL');
    }
    // Page should be a valid local storage key, starting with QoL
    // When "ALL", all page defaults are set
    // Set commit to true to also save the settings to storage
    setPageDefaults(page, commit=false) {
        let pageList = [];
        if(page==='ALL') {
            pageList = UserSettings.FEATURE_SETTINGS_KEYS;
        }
        else {
            pageList.push(page);
        }
        for(let i=0; i<pageList.length; i++) {
            const pDefs = this.pageDefaults(pageList[i]);
            if(pDefs) {
                this[pageList[i]] = pDefs;
                if(commit) {
                    LocalStorageManager.setItem(pageList[i], this[pageList[i]]);
                }
            }
        }
    }
    pageDefaults(page) {
        switch(page) {
            case MultiUser.SETTING_KEY:
                return {
                    partyModType: 'noMod',
                    hideDislike: false,
                    hideAll: false,
                    niceTable: false,
                    customParty: false,
                    stackNextButton: true,
                    stackMoreButton: true,
                    showPokemon: true,
                    compactPokemon: true,
                    clickablePokemon: false,
                    showTrainerCard: true,
                    showFieldButton: false,
                    showModeChecks: false,
                    showUserName: true
                };
            case PrivateFields.SETTING_KEY:
                return this.fieldDefaults(false);
            case PublicFields.SETTING_KEY:
                return this.fieldDefaults(true);
            case Lab.SETTING_KEY:
                return {
                    findLabEgg: '',
                    customEgg: true,
                    findLabType: '',
                    findTypeEgg: true,
                };
            case Shelter.SETTING_KEY:
                return {
                    findNewEgg: true,
                    findNewPokemon: true,
                    findShiny: true,
                    findAlbino: true,
                    findMelanistic: true,
                    findPrehistoric: true,
                    findDelta: true,
                    findMega: true,
                    findStarter: true,
                    findCustomSprite: true,
                    findTotem: false,
                    findLegendary: false,
                    shelterGrid: true,
                    shelterSpriteSize: 'auto',
                    quickTypeSearch: [],
                    fullOptionSearch: {},
                    quickPkmnSearch: [],
                    fullPkmnSearch: {}
                }
            default:
                ErrorHandler.warn('Cannot set page defaults for unknown page: '+page);
                return null;
        }
    }
    // Most field settings are shared, build defaults here
    fieldDefaults(isPublic) {
        let fieldSettings = {
            fieldNewPokemon: true,
            fieldShiny: false,
            fieldAlbino: false,
            fieldMelanistic: false,
            fieldPrehistoric: false,
            fieldDelta: false,
            fieldMega: false,
            fieldStarter: false,
            fieldCustomSprite: false,
            fieldItem: false,
            fieldMale: true,
            fieldFemale: true,
            fieldNoGender: true,
            fieldCustomItem: true, // unused
            fieldCustomPokemon: true,
            fieldCustomEgg: true,
            fieldCustomPng: false,
            tooltipEnableMods: false,
            fieldCustom: '',
            fieldType: '',
            fieldNature: '',
            fieldEggGroup: ''
        };
        // Additional public-only settings
        if(isPublic) {
            fieldSettings.tooltipNoBerry = false;
            fieldSettings.tooltipBerry = false;
            fieldSettings.fieldByBerry = false;
            fieldSettings.fieldByMiddle = false;
            fieldSettings.fieldByGrid = false;
            fieldSettings.fieldClickCount = true;
        }
    }
    // Change a single setting
    // Note: this effectively re-stores the whole group, due to how settings are stored
    // But it does NOT re-store all settings in all groups
    // When done, calls any registered listeners, and provides them the change details
    changeSetting(settingGroup, settingName, newValue) {
        console.log('Changing QoL setting: '+settingGroup+'.'+settingName+' = '+newValue);
        if(this[settingGroup]) {
            this[settingGroup][settingName] = newValue;
            LocalStorageManager.setItem(settingGroup, this[settingGroup]);
            const changeDetails = {
                settingGroup: settingGroup,
                settingName: settingName,
                newValue: newValue
            };
            for(let i=0; i<this.changeListeners.length; i++) {
                if(typeof this.changeListeners[i] == 'function') {
                    this.changeListeners[i](changeDetails);
                }
            }
        }
        else {
            ErrorHandler.error('Cannot change setting in unknown group: '+settingGroup+'.'+settingName);
        }
    }
    // Loads all settings in storage into the UserSettings object
    loadSettings() {
        console.log('Loading QoL settings from storage');
        const storedSettings = LocalStorageManager.getAllQoLSettings();
        for(const settingKey in storedSettings) {
            // remove user ID from setting
            let settingGroup = settingKey.split('.');
            if(settingGroup.length == 2) {
                // Try to read the JSON recieved from storage (use full key with user id, not just name)
                let loadedSettings = {}; 
                try {
                    loadedSettings = JSON.parse(storedSettings[settingKey]);
                } catch(e) {
                    ErrorHandler.error('Could not parse stored settings for '+settingGroup+': '+storedSettings[settingKey],e);
                }
                // For convenience, replace with the setting name string
                settingGroup = settingGroup[1];
                if(this[settingGroup] != undefined) {
                    for(const settingName in loadedSettings) {
                        this[settingGroup][settingName] = loadedSettings[settingName];
                    }
                }
                else {
                    ErrorHandler.warn('Loaded unknown setting group: '+settingGroup);
                }
            }
            else {
                ErrorHandler.warn('Invalid setting key: '+settingKey);
            }
        }
    }

    // Allows pages to take actions when settings change, without watching inputs directly
    // (inputs should not be watched directly, since those events may get cleared in addSettingsListeners())
    // callbacks may include change details as their parameter - see changeSetting
    registerChangeListener(callback) {
        this.changeListeners.push(callback);
    }

    // ** Everything below here is for interfacing with the DOM (show current values, handle changes, etc) ** //

    // Get details about a setting from a DOM setting input
    // All settings inputs should have the qolsetting class, as well as the following attributes:
    // data-group: indicator of which set of settings (ex: "QoLSettings" for main settings)
    // name: the actual setting name/key
    // For example, "hide disliked" party setting should be data-group="QoLMultiuser" name="hideDislike"
    getSettingDetailsFromTarget(target) {
        const settingGroup = target.getAttribute('data-group');
        const settingName = target.getAttribute('name');
        if(settingGroup && settingName) {
            // try to read the setting from the active settings object
            let settingValue;
            if(this[settingGroup] && settingName in this[settingGroup]) {
                settingValue = this[settingGroup][settingName];
            }
            else {
                ErrorHandler.warn('Unrecognized setting input: '+settingGroup+'.'+settingName);
                console.warn(target);
            }
            // try to read the value of the DOM input
            let inputValue;
            if(target.type=='radio') {
                let element = document.querySelector('input[name="'+target.getAttribute('name')+'"]:checked');
                // there may not be a checked radio yet, especially when this is being used in displaySettingsValues
                if(element) {
                    inputValue = element.value;
                }
            }
            else if(target.type=='checkbox') {
                inputValue = target.checked;
            }
            else { // textbox dropdown etc
                inputValue = target.value;
            }
            return {
                settingGroup: settingGroup,
                settingName: settingName,
                settingValue: settingValue,
                inputValue: inputValue
            };
        }
        else {
            ErrorHandler.error('QoL setting could not be identified.');
            console.error(target);
            return null;
        }
    }
    // Listens for changes to settings inputs
    // Should be called after input elements are added (ex: after html builder, or after modal open, etc)
    addSettingsListeners() {
        const self = this;
        this.displaySettingsValues();
        // remove any existing listeners
        $('.qolsetting').off('change');
        $('.qolsetting').on('change', (function (event) {
            let settingDetails = self.getSettingDetailsFromTarget(event.target);
            if(settingDetails) {
                self.changeSetting(settingDetails.settingGroup, settingDetails.settingName, settingDetails.inputValue);
            }
        }));
    }
    // helper for addSettingsListeners, this ensures that inputs have the existing value shown
    displaySettingsValues() {
        const self = this;
        $('.qolsetting').each(function(){
            let settingDetails = self.getSettingDetailsFromTarget(this);
            if(settingDetails) {
                if(this.type=='radio') {
                    // if the value matches, this is the currently selected radio
                    this.checked = this.value==settingDetails.settingValue;
                }
                else if(this.type=='checkbox') {
                    this.checked = settingDetails.settingValue;
                }
                else {
                    this.value = settingDetails.settingValue;
                }
            }
            // special case for custom css textbox demo value
            if(this.id=='qolcustomcss' && this.value.trim()=='') {
                this.value = Resources.DEMO_CSS;
            }
        });
    }
}