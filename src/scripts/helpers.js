class Helpers {
    // Custom error handler to output in the QoL error console
    // Level should be info, warn, or error; default is info
    // Message is also written to the JavaScript console
    static writeCustomError(message,level='info') {
        const logElement = document.getElementById('qolConsoleHolder');
        let prefix = undefined;
        if(level=='warn') {
            prefix = 'WARN: ';
            console.warn('QoL: '+message);
        }
        else if(level=='error') {
            prefix = 'ERROR: ';
            console.error('QoL: '+message);
        }
        else {
            prefix = 'INFO: ';
            console.log('QoL: '+message);
        }
        if(logElement) {
            logElement.innerHTML += '<li>' + prefix + message + '</li>';
        }
        else {
            console.error('Could not add custom log to log element');
        }
    }
    /** TamperMonkey polyfill to replace GM_addStyle function */
    static addGlobalStyle(css) {
        try {
            const head = document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            style.innerHTML = css;
            head.appendChild(style);
        } catch(err) {
            Helpers.writeCustomError('Error while applying global styling: '+err,'error');
            console.log(err);
        }
    }
    static buildOptionsString(arr) {
        let str = '<option value="none">None</option> ';
        for (let i = 0; i < arr.length; i++) {
            str += `<option value="${i}">${arr[i]}</option> `;
        }
        return str;
    }
    static toggleSetting(key, set, cls) {
        // provide default value for cls
        cls = cls || 'qolsetting';
        // update values for checkboxes
        if (typeof set === 'boolean') {
            const element = document.querySelector(`.${cls}[data-key="${key}"]`);
            if (element && element.type === 'checkbox') {
                element.checked = set;
            }
        }
    } // toggleSetting
    static setupFieldArrayHTML(arr, id, div, cls) {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            const rightDiv = i + 1;
            const rightValue = arr[i];
            $(`#${id}`).append(div);
            $(`.${cls}`).removeClass(cls).addClass('' + rightDiv + '').find('.qolsetting').val(rightValue);
        }
    }
    static loadSettings(KEY, DEFAULT, obj) {
        if (localStorage.getItem(KEY) === null) {
            this.saveSettings(KEY);
        } else {
            try {
                const countScriptSettings = Object.keys(obj).length;
                const localStorageString = JSON.parse(localStorage.getItem(KEY));
                const countLocalStorageSettings = Object.keys(localStorageString).length;
                if (countLocalStorageSettings < countScriptSettings) { // adds new objects (settings) to the local storage
                    const defaultsSetting = DEFAULT;
                    const userSetting = JSON.parse(localStorage.getItem(KEY));
                    const newSetting = $.extend(true, {}, defaultsSetting, userSetting);

                    obj = newSetting;
                    this.saveSettings(KEY, obj);
                }
                if (countLocalStorageSettings > countScriptSettings) {
                    this.saveSettings(KEY, obj);
                }
            }
            catch (err) {
                this.saveSettings(KEY, obj);
            }
            if (localStorage.getItem(KEY) != JSON.stringify(obj)) {
                obj = JSON.parse(localStorage.getItem(KEY));
            }
        }

        return obj;
    }
    static saveSettings(key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
    }
    static textSearchDiv(cls, dataKey, id, arrayName) {
        return `<div class='${cls}'><label><input type="text" class="qolsetting" data-key="${dataKey}" ` +
            `array-name='${arrayName}'` +
            `/></label><input type='button' value='Remove' id='${id}'></div>`;
    }
    static selectSearchDiv(cls, name, dataKey, options, id, divParent, arrayName) {
        return `<div class='${cls}'> <select name='${name}' class="qolsetting" data-key='${dataKey}' ` +
            `array-name='${arrayName}'> ${options} </select> <input type='button' value='Remove' id='${id}'> </div>`;
    }
    static parseFieldPokemonTooltip(tooltip) {
        const dataElements = $(tooltip).children(0).children();
        let index = 1;
        // nickname
        const nickname = dataElements[index].textContent;
        if (!nickname) {
            console.error(`Helpers.parseFieldPokemonTooltip - nickname '${nickname}' (is not a valid name)`);
        }
        index++;

        /*
         * Issue #59 - Pokefarm added a new h3 element after the nickname
         * that contains no data
         */
        index++;

        // species
        let species = '';
        if (dataElements[index].textContent) {
            const tc = dataElements[index].textContent;
            const tcSplit = tc.trim().split(':  ');
            if (tcSplit.length == 1) {
                console.error('Helpers.parseFieldPokemonTooltip - species text does not contain \':  \'');
            }
            else {
                species = tcSplit[1];
            }
        }
        index++;

        // dataElements[3] will be a forme if the pokemon has a forme
        let forme = '';
        if (dataElements[index].textContent &&
            dataElements[index].textContent.startsWith('Forme')) {
            forme = dataElements[index].textContent.substr('Forme: '.length);
            index++;
        }

        // types
        const typeElements = $(dataElements[index]).children().slice(1);
        const typeUrls = typeElements.map(idx => typeElements[idx]['src']);
        let types = typeUrls.map(idx =>
            typeUrls[idx].substring(typeUrls[idx].indexOf('types/') + 'types/'.length,
                typeUrls[idx].indexOf('.png')));
        types = types.map(idx => types[idx].charAt(0).toUpperCase() + types[idx].substring(1));
        types = types.map(idx => Globals.TYPE_LIST.indexOf(types[idx]));
        index++;

        // level
        let level = -1;
        if (dataElements[index].textContent) {
            const tcSplit = dataElements[index].textContent.split(' ');
            if (tcSplit.length > 1) {
                level = parseInt(tcSplit[1]);
            }
        } else {
            console.error('Helpers.parseFieldPokemonToolTip - could not load level because text was empty');
        }
        index++;

        // if the pokemon's happiness is less than max, skip the next index, since it will be a progress bar
        if (!dataElements[index].textContent ||
            !dataElements[index].textContent.startsWith('Happiness')) {
            index++;
        }

        // happiness
        let happiness = -1;
        if (dataElements[index].textContent) {
            const tcSplit = dataElements[index].textContent.split(' ');
            if (tcSplit.length > 1) {
                happiness = tcSplit[1].trim();
                happiness = (happiness == 'MAX') ? 100 : parseInt(happiness.substring(0, happiness.length - 1));
            }
        } else {
            console.error('Helpers.parseFieldPokemonToolTip - could not load happiness because text was empty');
        }
        index++;

        // nature
        let nature = -1;
        if (dataElements[index].textContent) {
            const tcSplit = dataElements[index].textContent.split(' ');
            if (tcSplit.length > 1) {
                nature = tcSplit[1].replace('(', '').trim();
                nature = Globals.NATURE_LIST.indexOf(nature); // .substring(0, nature.length-1))
            }
        } else {
            console.error('Helpers.parseFieldPokemonToolTip - could not load nature because text was empty');
        }
        index++;

        // held item
        let item = '';
        if (dataElements[index].textContent !== 'Item: None') {
            item = dataElements[index].textContent.substring(dataElements[8].textContent.indexOf(' ') + 1);
        } else {
            item = 'None';
        }
        index++;

        // egg groups
        let eggGroups = [];
        if (dataElements[index].textContent) {
            eggGroups = dataElements[index].textContent.substring('Egg Group: '.length).split('/');
        }
        else {
            console.error('Helpers.parseFieldPokemonToolTip - could not load egg groups because text was empty');
        }
        index++;

        const ret = {
            'nickname': nickname,
            'species': species,
            'types': types,
            'level': level,
            'happiness_percent': happiness,
            'nature': nature,
            'item': item,
            'eggGroups': eggGroups,
        };
        if (forme !== '') {
            ret.forme = forme;
        }
        return ret;
    } // parseFieldPokemonToolTip
    static getPokemonImageClass() {
        // this seems like PFQ's threshold based on my experimentation
        if (window.innerWidth >= 650 && window.innerHeight >= 650) {
            return 'big';
        } else {
            return 'small';
        }
    }
    // returns true if the page is equal to or smaller to the given size class
    // mobile cutoff (point when header changes): "mq2"
    static detectPageSize(size) {
        return $('html').hasClass(size);
    }

    static addPkmnLinksPopup() {
      var body = document.getElementsByTagName('body')[0];
      var header = document.getElementsByTagName('h1')[0];
      var core = document.getElementById('core');
      var newBtn = document.createElement('button');
      header.appendChild(newBtn);
      newBtn.innerText = 'View links';
      newBtn.style= 'vertical-align:middle;margin-left: 10px;';
      newBtn.onclick = function(){
  
          var content = '<h3>Pokemon links</h3><table style="border-collapse:collapse;">';
          var fieldmon = document.getElementsByClassName('fieldmon');
          for(var i=0; i<fieldmon.length; i++){
          if(i%4==0) {
              content += '<tr>';
          }
          var pkmnID = fieldmon[i].getAttribute('data-id');
              var small = fieldmon[i].children[1];
          var imgSRC = small.getAttribute('src');
          var pkmnName = small.getAttribute('alt');
          content += '<td style="padding:5px;border:1px solid;">' +
                     '<img style="vertical-align:middle;" src="'+imgSRC+'"> ' +
                     '<a href="/summary/'+pkmnID+'">'+pkmnName+'</a></td>';
          if(i%4==3) {
              content += '</tr>';
          }
          }
          content += '</table>';
  
          var dialog = document.createElement('div');
          var dialogDiv1 = document.createElement('div');
          var dialogDiv2 = document.createElement('div');
          var dialogDiv3 = document.createElement('div');
          var closeBtn = document.createElement('button');
          closeBtn.setAttribute('type','button');
          closeBtn.style = 'float:right;margin:8px;';
          closeBtn.innerText = 'Close';
          closeBtn.onclick = function() {
          dialog.remove();
          core.classList.remove('scrolllock');
          }
          dialog.classList.add('dialog');
          dialog.appendChild(dialogDiv1);
          dialogDiv1.appendChild(dialogDiv2);
          dialogDiv2.appendChild(dialogDiv3);
          dialogDiv3.innerHTML = content;
          dialogDiv3.appendChild(closeBtn);
          body.prepend(dialog);
          core.classList.add('scrolllock');
      };
    }
}