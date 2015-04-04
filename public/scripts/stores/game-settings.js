define([
    'lib/events',
    'lib/lodash'
], function(
    Events,
    _
) {

    var gameSettings =  function() {
        _.extend(this, Events);

        this.showButtons = true;
        this.useCustomBetMultiplier = false;
        this.customBetMultiplier = 2;
    };

    gameSettings.prototype.setCustomBetMultiplier = function(multiplier) {
        this.customBetMultiplier = multiplier;
        this.trigger('set-custom-bet-multiplier');
    };

    gameSettings.prototype.toggleCustomBetMultiplier = function() {
        this.useCustomBetMultiplier = !this.useCustomBetMultiplier;
        this.trigger('toggle-custom-bet-multiplier');
    };

    gameSettings.prototype.toggleShowButtons = function() {
        this.showButtons = !this.showButtons;
        this.trigger('show-buttons-change');
    };

    return new gameSettings();
});