define([
    'lib/events',
    'lib/lodash',
    'game-logic/clib'
], function(
    Events,
    _,
    Clib
) {

    var GameStore =  function() {
        _.extend(this, Events);

        /** Controls **/
        this.showButtons = Clib.localOrDef('showButtons', true);
        this.useCustomBetMultiplier = Clib.localOrDef('useCustomBetMultiplier', false);
        this.customBetMultiplier = Clib.localOrDef('customBetMultiplier', 2);

        /** Graph **/
        this.graphRightMargin = Clib.localOrDef('graphRightMargin', 2);

        /** Windows/Modals **/
        this.hideTutorial = Clib.localOrDef('hideTutorial', false);
        this.modal = this.hideTutorial? {} : { name: 'TUTORIAL' };
        this.showChat = Clib.localOrDef('showChat', false);
        this.focus = 'GAME'; // GAME || CHAT

    };

    GameStore.prototype.setGraphRightMargin = function(margin) {
        this.graphRightMargin = (typeof margin === 'number')? margin : Number(margin);
        localStorage['graphRightMargin'] = this.graphRightMargin;
        this.trigger('set-graph-right-margin');
    };

    GameStore.prototype.setCustomBetMultiplier = function(multiplier) {
        this.customBetMultiplier = multiplier;
        localStorage['customBetMultiplier'] = this.customBetMultiplier;
        this.trigger('set-custom-bet-multiplier');
    };

    GameStore.prototype.toggleCustomBetMultiplier = function() {
        this.useCustomBetMultiplier = !this.useCustomBetMultiplier;
        localStorage['useCustomBetMultiplier'] = this.useCustomBetMultiplier;
        this.trigger('toggle-custom-bet-multiplier');
    };

    GameStore.prototype.toggleShowButtons = function() {
        this.showButtons = !this.showButtons;
        localStorage['showButtons'] = this.showButtons;
        this.trigger('show-buttons-change');
    };

    GameStore.prototype.toggleShowChatFocus = function() {
        this.focus = this.showChat? 'GAME' : 'CHAT';
        this.showChat = !this.showChat;
        localStorage['showChat'] = this.showChat;
        this.trigger('show-chat-change');
    };

    GameStore.prototype.setHideTutorial = function() {
        localStorage['hideTutorial'] = this.hideTutorial = true;
    };

    /**
     * Open a modal or if the modal is already open closing it
     * @param modal - Modal info
     * @param modal.name - The name of the modal
     * @param modal[other] - Every other parameter is optional and depends on the modal we are opening
     */
    GameStore.prototype.setUnsetModalFocus = function(modal) {
        if(this.modal.name !== modal.name) {
            this.modal = modal;
            this.focus = 'GAME';
        } else {
            this.modal = {};
        }
        this.trigger('modal-change');
    };

    GameStore.prototype.setFocus = function(focus) {
        this.focus = focus;
        this.trigger('focus-change');
    };

    return new GameStore();
});