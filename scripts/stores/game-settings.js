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
    };

    gameSettings.prototype.toggleShowButtons = function() {
        this.showButtons = !this.showButtons;
        this.trigger('show-buttons-change');
    };

    return new gameSettings();
});