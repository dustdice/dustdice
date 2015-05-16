define([
    'lib/react',
    'game-logic/engine',
    'game-logic/clib',
    'web-api/web-api'
],function(
    React,
    Engine,
    Clib,
    WebApi
){
    var D = React.DOM;

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            toggleStats: React.PropTypes.func.isRequired,
            settings: React.PropTypes.object
        },

        getInitialState: function() {
            if(this.props.settings.username)
                return {
                    inputText: this.props.settings.username,
                    loading: true,
                    userNotFound: false,
                    userInfo: {}
                };

            return {
                inputText: Engine.username,
                loading: false,
                userNotFound: false,
                userInfo: {
                    bettedCount: Engine.bettedCount,
                    bettedProfit: Engine.bettedProfit,
                    bettedWager: Engine.bettedWager
                }
            }
        },

        componentDidMount: function() {
            if(this.props.settings.username)
                this._getUserStats();
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
            this.setState({ loading: true, userNotFound: false });
            React.findDOMNode(self.refs.userInput).blur();

            var username = this.state.inputText;
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

        render: function() {

            var notFound = this.state.userNotFound;

            var userNotFound = D.span({ className: 'stats-user-not-found' },
                notFound?
                    ('User ' + this.state.userNotFound + ' does not exist.') :
                    null
            );

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
                                'Stats',
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

                        D.div({ className: 'modal-body' },
                            this.state.loading?
                                D.i({ className: 'fa fa-refresh spin' }) :
                                D.div(null,
                                    D.p(null, D.b(null, 'Bets: '), notFound? '-' : Clib.formatDecimals(this.state.userInfo.bettedCount), ' '+Clib.bitsTextTerm(this.state.userInfo.bettedCount)),
                                    D.p(null, D.b(null, 'Profit: '), notFound? '-' : Clib.formatSatoshis(this.state.userInfo.bettedProfit), ' '+Clib.bitsTextTerm(this.state.userInfo.bettedProfit)),
                                    D.p(null, D.b(null, 'Wagered: '), notFound? '-' : Clib.formatSatoshis(this.state.userInfo.bettedWager), ' '+Clib.bitsTextTerm(this.state.userInfo.bettedWager))
                                )
                        )
                    )
                )
            )
        }
    });
});