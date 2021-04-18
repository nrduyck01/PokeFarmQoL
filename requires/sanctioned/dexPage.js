/* globals DexPageBase */
// eslint-disable-next-line no-unused-vars
class DexPage extends DexPageBase {
    constructor(jQuery, localStorageMgr, GLOBALS) {
        super(jQuery, localStorageMgr, GLOBALS);

        // when entering the dex page, update the local storage QoLPokedex
        // so the user can update their information
        if (jQuery('script#dexdata') && jQuery('script#dexdata').text()) {
            const text = jQuery('script#dexdata').text();
            GLOBALS.DEX_DATA = JSON.parse(text).split(',');
            this.localStorageMgr.updateLocalStorageDex(this.jQuery, document, undefined, GLOBALS);
        }
    }
}