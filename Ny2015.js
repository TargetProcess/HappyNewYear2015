/*globals tau, require*/
tau
    .mashups
    .addDependency('Ny2015/Ny2015.config')
    .addDependency('jQuery')
    .addDependency('tau/configurator')
    .addDependency('tp3/mashups/topmenu')
    .addCSS('Ny2015.css')
    .addMashup(function(mashupConfig, $, configurator, topMenu, systemConfig) {

        'use strict';

        var path = systemConfig.mashupPath;
        var configFieldName = 'ny2015_status';

        var getStatus = function() {
            var settingsManager = configurator.getSettingsManager();

            return settingsManager.get({
                fields: [
                    configFieldName
                ]
            }).then(function(data) {
                return data[configFieldName] || 'show';
            });
        };

        var setStatus = function(st) {
            var settingsManager = configurator.getSettingsManager();
            var set = {};
            set[configFieldName] = st;
            return settingsManager.set({
                set: set
            });
        };

        var $popup;
        var snowfall;

        var init = function() {

            if ($popup) {
                return $popup;
            }

            var def = new $.Deferred();

            require([
                path + '/vendor/snowfall/snowfall.min.js'
            ], function() {

                require([
                    'Ny2015/vendor/snowfall',
                    'text!' + path + '/template.html'
                ], function(snowFall, template) {

                    var $template = $(template);
                    snowfall = snowFall;

                    $template.find('.ny-username').text(configurator.getLoggedUser().name);
                    $template.hide().appendTo('body');

                    $template.on('click', function(e) {

                        if (e.target === $template[0]) {
                            setStatus('hide');
                            snowFall.snow($template.toArray(), 'clear');
                            $(document).find('.snowfall-flakes').remove();

                            $template.fadeOut();
                        }
                    });

                    $template.on('click', '.ny2005-close', function() {
                        setStatus('hide');
                        snowFall.snow($template.toArray(), 'clear');
                        $(document).find('.snowfall-flakes').remove();
                        $template.fadeOut();
                    });

                    $popup = $template;

                    def.resolve($popup);
                });
            });

            return def;
        };

        var toggle = function(status) {
            if (status === 'show') {
                return $
                    .when(init())
                    .then(function() {
                        $popup.fadeIn();

                        snowfall.snow($popup.toArray(), {
                            image: path + '/flake.png',
                            flakeCount: 100,
                            maxSpeed: 5,
                            maxSize: 10
                        });
                    });
            } else if ($popup) {
                $popup.fadeOut();
                snowfall.snow($popup.toArray(), 'clear');
                $(document).find('.snowfall-flakes').remove();

            }
        };

        var $trigger = $('<a class="ny2015-trigger">&nbsp;</a>');

        topMenu.addItem({
            html: $trigger
        });

        $trigger.on('click', function() {
            $
                .when(getStatus())
                .then(function(status) {
                    var nextStatus = (status === 'show') ? 'hide' : 'show';
                    toggle(nextStatus);
                });
        });

        $
            .when(getStatus())
            .then(toggle);
    });
