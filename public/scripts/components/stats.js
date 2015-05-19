define([
    'lib/react',
    'game-logic/engine',
    'game-logic/clib',
    'game-logic/web-api',
    'class-names'
],function(
    React,
    Engine,
    Clib,
    WebApi,
    CX
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            toggleStats: React.PropTypes.func.isRequired,
            settings: React.PropTypes.object
        },

        getInitialState: function() {
            //Initial State of the tip to 1 bit
            var tipValidation = Clib.validateBitsInput(1, Engine.balance);

            if(this.props.settings.username)
                return {
                    tab: 'STATS',
                    inputText: this.props.settings.username,
                    loading: true,
                    userNotFound: false,
                    userInfo: {},
                    tipInputText: '1',
                    tipValidity: tipValidation[0],
                    tipValidityMessage: tipValidation[1],
                    tipSent: false
                };

            return {
                tab: 'STATS',
                inputText: Engine.username,
                me: true,
                loading: false,
                userNotFound: false,
                userInfo: {
                    bettedCount: Engine.bettedCount,
                    bettedProfit: Engine.bettedProfit,
                    bettedWager: Engine.bettedWager
                },
                tipInputText: '1',
                tipValidity: tipValidation[0],
                tipValidityMessage: tipValidation[1],
                tipSent: false
            }
        },

        componentDidMount: function() {
            Engine.on('tipping', this._change);
            Engine.on('tip-made', this._tipMade);

            if(this.props.settings.username)
                this._getUserStats();
        },

        componentWillUnmount: function() {
            Engine.off('tipping', this._change);
            Engine.off('tip-made', this._tipMade);
        },

        _change: function() {
            this.setState({ tipSent: false });
        },

        _tipMade: function(data) {
            this.setState({ tipSent: data });
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props.toggleStats();
        },

        _handleKeyDown: function(e) {
            if(e.keyCode==13)
                this._getUserStats();
        },

        _handleInputChange: function(e) {
            this.setState({ inputText: e.target.value });
        },

        _getUserStats: function() {
            var self = this;
            var username = this.state.inputText;

            React.findDOMNode(self.refs.userInput).blur();

            //If the user is me return the stats from the Engine
            if(username === Engine.username)
                return this.setState({
                    me: true,
                    loading: false,
                    userInfo: {
                        bettedCount: Engine.bettedCount,
                        bettedProfit: Engine.bettedProfit,
                        bettedWager: Engine.bettedWager
                    }
                });

            //Set the state to loading
            this.setState({ loading: true, userNotFound: false });

            //Get the user info from MoneyPot
            WebApi.getUserStats(username, Engine.accessToken, function(err, data) {
                if(!self.isMounted())
                    return;

                if(err)
                    if(err.error === 'USER_NOT_FOUND')
                        return self.setState({ loading: false, userNotFound: username, userInfo: {
                            bettedCount: 0,
                            bettedProfit: 0,
                            bettedWager: 0
                        }});
                    else
                        return Engine.setErrorState(err.error);

                self.setState({ loading: false, userInfo: {
                    bettedCount: data.betted_count,
                    bettedProfit: data.betted_profit,
                    bettedWager: data.betted_wager,
                    username: data.uname
                }});
            });
        },

        _selectTab: function(tab) {
            var self = this;
            return function() {
                self.setState({ tab: tab });
            }
        },

        _setTip: function(ev) {
            var tipValidation = Clib.validateBitsInput(ev.target.value, Engine.balance);
            this.setState({ tipInputText: ev.target.value, tipValidity: tipValidation[0], tipValidityMessage: tipValidation[1] });
        },

        _tip: function() {
            console.assert(this.state.userInfo.username && !this.state.userNotFound);
            console.assert(this.state.tipValidity === 'valid');

            Engine.tip(this.state.userInfo.username, Number(this.state.tipInputText));
        },

        render: function() {

            var notFound = this.state.userNotFound;
            var userNotFound = D.span({ className: 'stats-user-not-found' },
                notFound?
                    ('User ' + this.state.userNotFound + ' does not exist.') :
                    null
            );

            var body;
            switch(this.state.tab) {
                case 'STATS':
                    body = D.div({ className: 'modal-body' },
                        this.state.loading?
                            D.i({ className: 'fa fa-refresh spin' }) :
                            D.div(null,
                                D.p(null, D.b(null, 'Bets: '), notFound? '-' : this.state.userInfo.bettedCount),
                                D.p(null, D.b(null, 'Profit: '), notFound? '-' : Clib.formatSatoshis(this.state.userInfo.bettedProfit), ' '+Clib.bitsTextTerm(this.state.userInfo.bettedProfit)),
                                D.p(null, D.b(null, 'Wagered: '), notFound? '-' : Clib.formatSatoshis(this.state.userInfo.bettedWager), ' '+Clib.bitsTextTerm(this.state.userInfo.bettedWager))
                            )
                    );
                    break;
                case 'TIP':
                    //Disable tip if the user is me or was not found
                    var isTipping = Engine.tipping;
                    var disableTip = !this.state.userInfo.username || this.state.userNotFound || isTipping;
                    var invalidInput = this.state.tipValidity !== 'valid';

                    var tipDivClasses = CX({
                        'form-group': true,
                        'has-error': (this.state.tipValidity === 'wrong'),
                        'has-warning': (this.state.tipValidity === 'warning')
                    });

                    var btnContent;
                    if(isTipping)
                        btnContent = D.i({ className: 'fa fa-refresh spin' });
                    else
                        btnContent = 'Tip' + (this.state.userInfo.username? ' '+this.state.userInfo.username : '');

                    var tipSentMsg = this.state.tipSent? D.span({ className: 'tip-sent-msg pull left' }, 'Tip sent to ', this.state.tipSent.to, ' tell them to refresh their balance') : null;

                    body = D.div({ className: 'modal-body' },
                        D.div({ className: 'align-right'},
                            D.div({ className: tipDivClasses },
                                D.label({ className: 'control-label pull-left', htmlFor: 'set-input-wager' }, this.state.tipValidityMessage? this.state.tipValidityMessage : ''),
                                D.div({ className: 'input-group clear' },
                                    D.div({ className: 'input-group-addon'}, "Tip " + (this.state.userInfo.username? ' '+this.state.userInfo.username : '')),
                                    D.input({ type: 'text', className: 'form-control', id: 'set-input-wager', value: this.state.tipInputText, onChange: this._setTip, disabled: disableTip }),
                                    D.div({ className: 'input-group-addon'}, "bits")
                                )
                            ),
                            D.div({ className: 'tip-btn-cont' },
                                tipSentMsg,
                                D.button({ type: 'button', className: 'btn btn-default', onClick: this._tip, disabled: disableTip || invalidInput },
                                    btnContent
                                )
                            )
                        )
                    );
                    break;
                default:
                    console.error('[Stats] The tab ' + this.state.tab + ' does not exist.');
            }

            return D.div({ id: 'stats-container', className: 'modal fade in', style: { display: 'block' }, onClick: this._handleBackDropClick },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props.toggleStats },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'User',
                                D.input({
                                    type: 'text',
                                    className: 'stats-user-name-input',
                                    value: this.state.inputText,
                                    ref: 'userInput',
                                    onChange: this._handleInputChange,
                                    onKeyDown: this._handleKeyDown
                                }),
                                userNotFound
                            )
                        ),

                        D.div({ className: 'modal-nav' },
                            D.ul({ className: 'nav nav-tabs nav-justified' },
                                D.li({
                                    role: 'presentation',
                                    className: this.state.tab === 'STATS' ? 'active' : '',
                                    onClick: this._selectTab('STATS')
                                }, D.a({ href: '#' }, 'Stats')),
                                D.li({
                                    role: 'presentation',
                                    className: this.state.tab === 'TIP' ? 'active' : '',
                                    onClick: this._selectTab('TIP')
                                }, D.a({ href: '#' }, 'Tip'))
                            )
                        ),

                        body
                    )
                )
            )
        }
    });
});