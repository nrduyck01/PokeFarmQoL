class PublicFieldsPage extends Page {
    constructor() {
        const defaultPageSettings = {
            fieldByBerry: false,
            fieldByMiddle: false,
            fieldByGrid: false,
            fieldClickCount: true,
            fieldCustom: '',
            fieldType: '',
            fieldNature: '',
            fieldEggGroup: '',
            fieldNewPokemon: true,
            fieldShiny: true,
            fieldAlbino: true,
            fieldMelanistic: true,
            fieldPrehistoric: true,
            fieldDelta: true,
            fieldMega: true,
            fieldStarter: true,
            fieldCustomSprite: true,
            fieldMale: true,
            fieldFemale: true,
            fieldNoGender: true,
            fieldCustomItem: true, // unused
            fieldCustomPokemon: true,
            fieldCustomEgg: true,
            fieldCustomPng: false,
            fieldItem: true,
            /* tooltip settings */
            tooltipEnableMods: false,
            tooltipNoBerry: false,
            tooltipBerry: false,
        };
        super(Globals.PUBLIC_FIELDS_PAGE_SETTINGS_KEY, defaultPageSettings, 'fields/');
        this.customArray = [];
        this.typeArray = [];
        this.natureArray = [];
        this.eggGroupArray = [];
        const obj = this;
        this.observer = new MutationObserver(function() {
            obj.customSearch();
            if(obj.USER_SETTINGS.publicFieldFeatureEnables.tooltip) {
                obj.handleTooltipSettings();
            }
        });
    }

    settingsChange(element, textElement, customClass, typeClass, arrayName) {
        if(super.settingsChange(element, textElement, customClass, typeClass, arrayName) === false) {
            return false;
        }

        const mutuallyExclusive = ['fieldByBerry', 'fieldByMiddle', 'fieldByGrid'];
        const idx = mutuallyExclusive.indexOf(element);
        if(idx > -1) {
            for(let i = 0; i < mutuallyExclusive.length; i++) {
                if(i !== idx) {
                    this.settings[mutuallyExclusive[i]] = false;
                }
            }
            return true;
        }
        else { return false; }
    }

    setupHTML() {
        if(this.USER_SETTINGS.publicFieldFeatureEnables.search) {
            document.querySelector('#field_field').insertAdjacentHTML('afterend', Resources.fieldSearchHTML());
            const theField = Helpers.textSearchDiv('numberDiv', 'fieldCustom', 'removeTextField', 'customArray');
            const theType = Helpers.selectSearchDiv('typeNumber', 'types', 'fieldType', Globals.TYPE_OPTIONS,
                'removeFieldTypeSearch', 'fieldTypes', 'typeArray');
            const theNature = Helpers.selectSearchDiv('natureNumber', 'natures', 'fieldNature', Globals.NATURE_OPTIONS,
                'removeFieldNature', 'natureTypes', 'natureArray');
            const theEggGroup = Helpers.selectSearchDiv('eggGroupNumber', 'eggGroups', 'fieldEggGroup', Globals.EGG_GROUP_OPTIONS,
                'removeFieldEggGroup', 'eggGroupTypes', 'eggGroupArray');
            this.customArray = this.settings.fieldCustom.split(',');
            this.typeArray = this.settings.fieldType.split(',');
            this.natureArray = this.settings.fieldNature.split(',');
            this.eggGroupArray = this.settings.fieldEggGroup.split(',');
            Helpers.setupFieldArrayHTML(this.customArray, 'searchkeys', theField, 'numberDiv');
            Helpers.setupFieldArrayHTML(this.typeArray, 'fieldTypes', theType, 'typeNumber');
            Helpers.setupFieldArrayHTML(this.natureArray, 'natureTypes', theNature, 'natureNumber');
            Helpers.setupFieldArrayHTML(this.eggGroupArray, 'eggGroupTypes', theEggGroup, 'eggGroupNumber');
        }
        if(this.USER_SETTINGS.publicFieldFeatureEnables.sort) {
            document.querySelector('#field_field').insertAdjacentHTML('beforebegin', Resources.fieldSortHTML());
        }
        if(this.USER_SETTINGS.publicFieldFeatureEnables.tooltip) {
            document.querySelector('#field_field').insertAdjacentHTML('beforebegin', Resources.publicFieldTooltipModHTML());
            this.handleTooltipSettings();
        }

        if(this.USER_SETTINGS.publicFieldFeatureEnables.pkmnlinks) {
            Helpers.addPkmnLinksPopup();
        }
    }
    setupCSS() {
        const fieldOrderCssColor = $('#field_field').css('background-color');
        const fieldOrderCssBorder = $('#field_field').css('border');
        $('#fieldorder').css('background-color', '' + fieldOrderCssColor + '');
        $('#fieldorder').css('border', '' + fieldOrderCssBorder + '');
        $('#fieldsearch').css('background-color', '' + fieldOrderCssColor + '');
        $('#tooltipenable').css('max-width', '600px');
        $('#tooltipenable').css('position', 'relative');
        $('#tooltipenable').css('margin', '16px auto');
        $('.collapsible').css('background-color', '' + fieldOrderCssColor + '');
        $('.collapsible').css('border', '' + fieldOrderCssBorder + '');
        $('.collapsible_content').css('background-color', '' + fieldOrderCssColor + '');

        $('.tooltiptext').css('background-color', $('.tooltip_content').eq(0).css('background-color'));
        $('.tooltiptext').css('border', '' + fieldOrderCssBorder + '');

        /*
         * Issue #47 - Since the default Pokefarm CSS for buttons does not use the same color
         * settings as most of the text on the site, manually set the text color for
         * '.collapsible' to match the text around it
         */
        $('.collapsible').css('color', $('#content').find('h1').eq(0).css('color'));
    }
    setupObserver() {
        this.observer.observe(document.querySelector('#field_field'), {
            childList: true,
            characterdata: true,
            subtree: true,
            characterDataOldValue: true,
        });
    }
    setupHandlers() {
        const obj = this;
        $(window).on('load', (function() {
            obj.loadSettings();
            obj.customSearch();
            if(obj.USER_SETTINGS.publicFieldFeatureEnables.tooltip) {
                obj.handleTooltipSettings();
            }
            obj.saveSettings();
        }));

        $(document).on('click input', '#fieldorder, #field_field, #field_berries, #field_nav', (function() { //field sort
            obj.customSearch();
        }));

        document.addEventListener('keydown', function() {
            obj.customSearch();
        });

        $(document).on('change', '.qolsetting', (function() {
            obj.loadSettings();
            obj.customSearch();
            obj.saveSettings();
        }));

        this.addSettingChangeListener(function() {
            obj.customSearch();
        });

        // enable all collapses
        $('.collapsible').on('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if(content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });

        if(this.USER_SETTINGS.publicFieldFeatureEnables.search) {
            $(document).on('click', '#addFieldTypeSearch', (function() { //add field type list
                obj.addSelectSearch('typeNumber', 'types', 'fieldType', Globals.TYPE_OPTIONS, 'removeFieldTypeSearch', 'fieldTypes', 'typeArray');
                obj.customSearch();
            }));

            $(document).on('click', '#removeFieldTypeSearch', (function() { //remove field type list
                obj.typeArray = obj.removeSelectSearch(obj.typeArray, this, $(this).parent().find('select').val(), 'fieldType', 'fieldTypes');
                obj.saveSettings();
                obj.customSearch();
            }));

            $(document).on('click', '#addFieldNatureSearch', (function() { //add field nature search
                obj.addSelectSearch('natureNumber', 'natures', 'fieldNature', Globals.NATURE_OPTIONS, 'removeFieldNature', 'natureTypes', 'natureArray');
                obj.customSearch();
            }));

            $(document).on('click', '#removeFieldNature', (function() { //remove field nature search
                obj.natureArray = obj.removeSelectSearch(obj.natureArray, this, $(this).parent().find('select').val(), 'fieldNature', 'natureTypes');
                obj.saveSettings();
                obj.customSearch();
            }));

            $(document).on('click', '#addFieldEggGroupSearch', (function() { //add egg group nature search
                obj.addSelectSearch('eggGroupNumber', 'eggGroups', 'fieldEggGroup', Globals.EGG_GROUP_OPTIONS, 'removeFieldEggGroup', 'eggGroupTypes', 'eggGroupArray');
                obj.customSearch();
            }));

            $(document).on('click', '#removeFieldEggGroup', (function() { //remove egg group nature search
                obj.eggGroupArray = obj.removeSelectSearch(obj.eggGroupArray, this, $(this).parent().find('select').val(), 'fieldEggGroup', 'eggGroupTypes');
                obj.saveSettings();
                obj.customSearch();
            }));

            $(document).on('click', '#addTextField', (function() {
                obj.addTextField();
                obj.saveSettings();
            }));

            $(document).on('click', '#removeTextField', (function() {
                obj.removeTextField(this, $(this).parent().find('input').val());
                obj.saveSettings();
                obj.customSearch();
            }));
        }

        if(this.USER_SETTINGS.publicFieldFeatureEnables.sort) {
            $('input.qolalone').on('change', function() { //only 1 textbox may be true
                $('input.qolalone').not(this).prop('checked', false);
            });
        }

        if(this.USER_SETTINGS.publicFieldFeatureEnables.tooltip) {

            $('#field_berries').on('click', function() {
                obj.loadSettings();
                obj.handleTooltipSettings();
            });

            $('.tooltipsetting[data-key=tooltipEnableMods]').on('click', function() {
                obj.loadSettings();
                obj.handleTooltipSettings();
                obj.saveSettings();
            });

            $('.tooltipsetting[data-key=tooltipNoBerry]').on('click', function() {
                obj.loadSettings();
                obj.handleTooltipSettings();
                obj.saveSettings();
            });

            $('.tooltipsetting[data-key=tooltipBerry]').on('click', function() {
                obj.loadSettings();
                obj.handleTooltipSettings();
                obj.saveSettings();
            });
        }

        // based on PFQ's code in fields_public.min.js
        $(window).on('keyup.field_shortcuts', function (a) {
            const k = $('#field_berries');
            if (0 == $(a.target).closest('input, textarea').length) {
                switch (a.keyCode) {
                case 49: // 1
                case 97: // Num-1
                    k.find('a').eq(0).trigger('click');
                    break;
                case 50: // 2
                case 98: // Num-2
                    k.find('a').eq(1).trigger('click');
                    break;
                case 51: // 3
                case 99: // Num-3
                    k.find('a').eq(2).trigger('click');
                    break;
                case 52: // 4
                case 100: // Num-4
                    k.find('a').eq(3).trigger('click');
                    break;
                case 53: // 5
                case 101: // Num-5
                    k.find('a').eq(4).trigger('click');
                }
            }
        });
    }
    // specific
    handleTooltipSettings() {
        const obj = this;
        if($('.tooltipsetting[data-key=tooltipEnableMods]').prop('checked')) {
            // make sure checkboxes are enabled
            $('.tooltipsetting[data-key=tooltipNoBerry]').prop('disabled', false);
            $('.tooltipsetting[data-key=tooltipBerry]').prop('disabled', false);

            // use the correct setting to turn on the tooltips based on the berries
            if($('#field_berries').hasClass('selected')) {
                if($('.tooltipsetting[data-key=tooltipBerry]').prop('checked')) { obj.disableTooltips(); }
                else { obj.enableTooltips(); }
            } else {
                if($('.tooltipsetting[data-key=tooltipNoBerry]').prop('checked')) { obj.disableTooltips(); }
                else { obj.enableTooltips(); }
            }
        } else {
            $('.tooltipsetting[data-key=tooltipNoBerry]').prop('disabled', true);
            $('.tooltipsetting[data-key=tooltipBerry]').prop('disabled', true);
            // if tooltipNoBerry was checked before the mods were disabled, reenable the tooltips
            if($('.tooltipsetting[data-key=tooltipNoBerry]').prop('checked')) {
                obj.enableTooltips();
            }
            // same for tooltipBerry
            if($('.tooltipsetting[data-key=tooltipBerry]').prop('checked')) {
                obj.enableTooltips();
            }
        }
    }
    disableTooltips() {
        $('#field_field>div.field>.fieldmon').removeAttr('data-tooltip').removeClass('tooltip_trigger');
    }
    enableTooltips() {
        $('#field_field>div.field>.fieldmon').attr('data-tooltip', '');
    }
    searchForImgTitle(key) {
        const SEARCH_DATA = Globals.SHELTER_SEARCH_DATA;
        const keyIndex = SEARCH_DATA.indexOf(key);
        const value = SEARCH_DATA[keyIndex + 1];
        const selected = $('img[title*="'+value+'"]');
        if (selected.length) {
            // next line different from shelter
            const bigImg = selected.parent().parent().parent().parent().prev().children('img');
            $(bigImg).addClass('publicfoundme');
        }
    }
    searchForCustomPokemon(value, male, female, nogender) {
        const genderMatches = [];
        if (male) { genderMatches.push('[M]'); }
        if(female) { genderMatches.push('[F]'); }
        if(nogender) { genderMatches.push('[N]'); }

        if(genderMatches.length > 0) {
            for(let i = 0; i < genderMatches.length; i++) {
                const genderMatch = genderMatches[i];
                const selected = $('#field_field .tooltip_content:containsIN('+value+') img[title*=\'' + genderMatch + '\']');
                if (selected.length) {
                    const shelterBigImg = selected.parent().parent().parent().parent().prev().children('img');
                    $(shelterBigImg).addClass('publicfoundme');
                }
            }
        }

        //No genders
        else {
            const selected = $('#field_field .tooltip_content:containsIN('+value+'):not(:containsIN("Egg"))');
            if (selected.length) {
                const shelterBigImg = selected.parent().parent().parent().parent().prev().children('img');
                $(shelterBigImg).addClass('publicfoundme');
            }
        }

    }
    searchForCustomEgg(value) {
        const selected = $('#field_field .tooltip_content:containsIN('+value+'):contains("Egg")');
        if (selected.length) {
            const shelterBigImg = selected.parent().parent().parent().parent().prev().children('img');
            $(shelterBigImg).addClass('publicfoundme');
        }
    }
    searchForCustomPng(value) {
        const selected = $('#field_field img[src*="'+value+'"]');
        if (selected.length) {
            const shelterImgSearch = selected;
            $(shelterImgSearch).addClass('publicfoundme');
        }
    }
    customSearch() {
        const obj = this;

        $('.fieldmon').removeClass('qolSortBerry');
        $('.fieldmon').removeClass('qolSortMiddle');
        $('.field').removeClass('qolGridField');
        $('.fieldmon').removeClass('qolGridPokeSize');
        $('.fieldmon>img').removeClass('qolGridPokeImg');

        if(obj.USER_SETTINGS.publicFieldFeatureEnables.sort) {

            //////////////////// sorting ////////////////////
            if (this.settings.fieldByBerry === true) { //sort field by berries
                $('.fieldmon').removeClass('qolSortMiddle');
                $('.field').removeClass('qolGridField');
                $('.fieldmon').removeClass('qolGridPokeSize');
                $('.fieldmon>img').removeClass('qolGridPokeImg');

                $('.fieldmon').addClass('qolSortBerry');
                if($('#field_field [data-flavour*="any-"]').length) {
                    $('#field_field [data-flavour*="any-"]').addClass('qolAnyBerry');
                }
                if($('#field_field [data-flavour*="sour-"]').length) {
                    $('#field_field [data-flavour*="sour-"]').addClass('qolSourBerry');
                }
                if($('#field_field [data-flavour*="spicy-"]').length) {
                    $('#field_field [data-flavour*="spicy-"]').addClass('qolSpicyBerry');
                }
                if($('#field_field [data-flavour*="dry-"]').length) {
                    $('#field_field [data-flavour*="dry-"]').addClass('qolDryBerry');
                }
                if($('#field_field [data-flavour*="sweet-"]').length) {
                    $('#field_field [data-flavour*="sweet-"]').addClass('qolSweetBerry');
                }
                if($('#field_field [data-flavour*="bitter-"]').length) {
                    $('#field_field [data-flavour*="bitter-"]').addClass('qolBitterBerry');
                }
            }
            else if (this.settings.fieldByMiddle === true) { //sort field in the middle
                $('.fieldmon').addClass('qolSortMiddle');
            }
            else if (this.settings.fieldByGrid === true) { //sort field in a grid
                $('.field').addClass('qolGridField');
                $('.fieldmon').addClass('qolGridPokeSize');
                $('.fieldmon>img').addClass('qolGridPokeImg');
            }

            //Pokémon click counter
            if (this.settings.fieldClickCount === false) {
                $('#pokemonclickcount').remove();
            } else if (this.settings.fieldClickCount === true) {
                const pokemonFed = $('.fieldmon').map(function() { return $(this).attr('data-fed'); }).get();

                let pokemonClicked = 0;
                for (let i = 0; i < pokemonFed.length; i++) {
                    pokemonClicked += pokemonFed[i] << 0;
                }

                const pokemonInField = $('.fieldpkmncount').text();

                if ($('#pokemonclickcount').length === 0) {
                    document.querySelector('.fielddata').insertAdjacentHTML('beforeend','<div id="pokemonclickcount">'+pokemonClicked+' / '+pokemonInField+' Clicked</div>');
                } else if($('#pokemonclickcount').text() !== (pokemonClicked+' / '+pokemonInField+' Clicked')) {
                    $('#pokemonclickcount').text(pokemonClicked+' / '+pokemonInField+' Clicked');
                }

                if(pokemonInField !== '') {
                    if (JSON.stringify(pokemonClicked) === pokemonInField) {
                        $('#pokemonclickcount').css({
                            'color' : '#059121'
                        });
                    }
                    if (pokemonClicked !== JSON.parse(pokemonInField)) {
                        $('#pokemonclickcount').css({
                            'color' : '#a30323'
                        });
                    }
                }
            }
        }

        if(obj.USER_SETTINGS.publicFieldFeatureEnables.search) {
        /////////////////// searching ///////////////////
            const bigImgs = document.querySelectorAll('.publicfoundme');
            if(bigImgs !== null) {
                bigImgs.forEach((b) => {$(b).removeClass('publicfoundme');});
            }

            if(this.settings.fieldShiny === true) {
                this.searchForImgTitle('findShiny');
            }
            if(this.settings.fieldAlbino === true) {
                this.searchForImgTitle('findAlbino');
            }
            if(this.settings.fieldMelanistic === true) {
                this.searchForImgTitle('findMelanistic');
            }
            if(this.settings.fieldPrehistoric === true) {
                this.searchForImgTitle('findPrehistoric');
            }
            if(this.settings.fieldDelta === true) {
                this.searchForImgTitle('findDelta');
            }
            if(this.settings.fieldMega === true) {
                this.searchForImgTitle('findMega');
            }
            if(this.settings.fieldStarter === true) {
                this.searchForImgTitle('findStarter');
            }
            if(this.settings.fieldCustomSprite === true) {
                this.searchForImgTitle('findCustomSprite');
            }
            if(this.settings.fieldItem === true) {
            // pokemon that hold items will have HTML that matches the following selector
                const items = $('.tooltip_content .item>div>.tooltip_item');
                if(items.length) {
                    const itemBigImgs = items.parent().parent().parent().parent().prev().children('img');
                    $(itemBigImgs).addClass('publicfoundme');
                }
            }

            const filteredTypeArray = this.typeArray.filter(v=>v!='');
            const filteredNatureArray = this.natureArray.filter(v=>v!='');
            const filteredEggGroupArray = this.eggGroupArray.filter(v=>v!='');

            //loop to find all the types
            if (filteredTypeArray.length > 0 || filteredNatureArray.length > 0 || filteredEggGroupArray.length > 0) {
                $('.fieldmon').each(function() {
                    const searchPokemonBigImg = $(this)[0].childNodes[0];
                    const tooltipData = Helpers.parseFieldPokemonTooltip($(searchPokemonBigImg).parent().next()[0]);

                    const searchTypeOne = tooltipData.types[0] + '';
                    const searchTypeTwo = (tooltipData.types.length > 1) ? tooltipData.types[1] + '': '';

                    const searchNature = Globals.NATURE_LIST[tooltipData.nature];

                    const searchEggGroup = $(this).next().find('.fieldmontip').
                        children(':contains(Egg Group)').eq(0).text().slice('Egg Group: '.length);

                    for (let i = 0; i < filteredTypeArray.length; i++) {
                        if ((searchTypeOne === filteredTypeArray[i]) || (searchTypeTwo === filteredTypeArray[i])) {
                            // .parent().children() hack to make both big & small images highlighted
                            // privateFieldsPage has the same issue: TODO: combine some of these search features, 
                            // and remove this hack (put combined functions in a library of some sort)
                            // could put the class on the parent element instead, and make the css .found>img?
                            $(searchPokemonBigImg).parent().children().addClass('publicfoundme');
                        }
                    }

                    for (let i = 0; i < filteredNatureArray.length; i++) {
                        if(searchNature === Globals.NATURE_LIST[filteredNatureArray[i]]) {
                            $(searchPokemonBigImg).parent().children().addClass('publicfoundme');
                        }
                    }

                    for (let i = 0; i < filteredEggGroupArray.length; i++) {
                        const value = Globals.EGG_GROUP_LIST[filteredEggGroupArray[i]];
                        if(searchEggGroup === value ||
                       searchEggGroup.indexOf(value + '/') > -1 ||
                       searchEggGroup.indexOf('/' + value) > -1) {
                            $(searchPokemonBigImg).parent().children().addClass('publicfoundme');
                        }
                    }
                }); // each
            } // end

            // custom search
            for (let i = 0; i < this.customArray.length; i++) {
                const value = this.customArray[i];
                if (value != '') {
                //custom pokemon search
                    if (this.settings.fieldCustomPokemon === true) {
                        this.searchForCustomPokemon(value, this.settings.fieldMale,
                            this.settings.fieldFemale,
                            this.settings.fieldNoGender);
                    }

                    //custom egg
                    if (this.settings.fieldCustomEgg === true) {
                        this.searchForCustomEgg(value);
                    }

                    //imgSearch with Pokémon
                    if (this.settings.fieldCustomPng === true) {
                        this.searchForCustomPng(value);
                    }
                }
            }
        }
    } // customSearch
    addSelectSearch(cls, name, dataKey, options, id, divParent, arrayName) {
        const theList = Helpers.selectSearchDiv(cls, name, dataKey, options, id, divParent, arrayName);
        const number = $(`#${divParent}>div`).length;
        $(`#${divParent}`).append(theList);
        $(`.${cls}`).removeClass(cls).addClass(''+number+'');
    }
    removeSelectSearch(arr, byebye, key, settingsKey, divParent) {
        arr = $.grep(arr, function(value) { return value != key; });
        this.settings[settingsKey] = arr.toString();

        $(byebye).parent().remove();

        for(let i = 0; i < $(`#${divParent}>div`).length; i++) {
            const rightDiv = i + 1;
            $('.'+i+'').next().removeClass().addClass(''+rightDiv+'');
        }

        return arr;
    }
    addTextField() {
        const theField = Helpers.textSearchDiv('numberDiv', 'fieldCustom', 'removeTextField', 'customArray');
        const numberDiv = $('#searchkeys>div').length;
        $('#searchkeys').append(theField);
        $('.numberDiv').removeClass('numberDiv').addClass(''+numberDiv+'');
    }
    removeTextField(byebye, key) {
        this.customArray = $.grep(this.customArray, function(value) {
            return value != key;
        });
        this.settings.fieldCustom = this.customArray.toString();

        $(byebye).parent().remove();

        let i;
        for(i = 0; i < $('#searchkeys>div').length; i++) {
            const rightDiv = i + 1;
            $('.'+i+'').next().removeClass().addClass(''+rightDiv+'');
        }
    }
}