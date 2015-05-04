define([
    'lib/events',
    'lib/lodash',
    'game-logic/clib'
], function(
    Events,
    _,
    Clib
) {

    var GameSettings =  function() {
        _.extend(this, Events);

        this.showButtons = Clib.localOrDef('showButtons', true);
        this.useCustomBetMultiplier = Clib.localOrDef('useCustomBetMultiplier', false);
        this.customBetMultiplier = Clib.localOrDef('customBetMultiplier', 2);
        this.hideTutorial = Clib.localOrDef('hideTutorial', false);
        this.graphRightMargin = Clib.localOrDef('graphRightMargin', 2);
        this.showChat = Clib.localOrDef('showChat', false);
    };

    GameSettings.prototype.setGraphRightMargin = function(margin) {
        this.graphRightMargin = (typeof margin === 'number')? margin : Number(margin);
        localStorage['graphRightMargin'] = this.graphRightMargin;
        this.trigger('set-graph-right-margin');
    };

    GameSettings.prototype.setCustomBetMultiplier = function(multiplier) {
        this.customBetMultiplier = multiplier;
        localStorage['customBetMultiplier'] = this.customBetMultiplier;
        this.trigger('set-custom-bet-multiplier');
    };

    GameSettings.prototype.toggleCustomBetMultiplier = function() {
        this.useCustomBetMultiplier = !this.useCustomBetMultiplier;
        localStorage['useCustomBetMultiplier'] = this.useCustomBetMultiplier;
        this.trigger('toggle-custom-bet-multiplier');
    };

    GameSettings.prototype.toggleShowButtons = function() {
        this.showButtons = !this.showButtons;
        localStorage['showButtons'] = this.showButtons;
        this.trigger('show-buttons-change');
    };

    GameSettings.prototype.toggleShowChat = function() {
        this.showChat = !this.showChat;
        localStorage['showChat'] = this.showChat;
        this.trigger('show-chat-change');
    };

    GameSettings.prototype.setHideTutorial = function() {
        localStorage.hideTutorial = this.hideTutorial = true;
    };

    return new GameSettings();
});