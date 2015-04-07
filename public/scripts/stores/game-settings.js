define([
    'lib/events',
    'lib/lodash'
], function(
    Events,
    _
) {

    var GameSettings =  function() {
        _.extend(this, Events);

        this.showButtons = true;
        this.useCustomBetMultiplier = false;
        this.customBetMultiplier = 2;
        this.hideTutorial = localStorage.hideTutorial? JSON.parse(localStorage.hideTutorial) : false;
    };

    GameSettings.prototype.setCustomBetMultiplier = function(multiplier) {
        this.customBetMultiplier = multiplier;
        this.trigger('set-custom-bet-multiplier');
    };

    GameSettings.prototype.toggleCustomBetMultiplier = function() {
        this.useCustomBetMultiplier = !this.useCustomBetMultiplier;
        this.trigger('toggle-custom-bet-multiplier');
    };

    GameSettings.prototype.toggleShowButtons = function() {
        this.showButtons = !this.showButtons;
        this.trigger('show-buttons-change');
    };

    GameSettings.prototype.setHideTutorial = function() {
        localStorage.hideTutorial = this.hideTutorial = true;
    };

    return new GameSettings();
});