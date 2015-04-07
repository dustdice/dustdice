define([
    'lib/react',
    'react-bootstrap',
    'stores/game-settings'
],function(
    React,
    ReactBootstrap,
    GameSettings
){
    var D = React.DOM;
    var Carousel = React.createFactory(ReactBootstrap.Carousel);
    var CarouselItem = React.createFactory(ReactBootstrap.CarouselItem);

    return React.createClass({
        displayName: 'Game Settings',

        propTypes: {
            _toggleTutorial: React.PropTypes.func.isRequired
        },

        getInitialState: function() {
            return {
                index: 0,
                direction: null
            }
        },

        componentDidMount: function() {
            GameSettings.on('all', this._onChange);
        },

        componentWillUnmount: function() {
            GameSettings.off('all', this._onChange);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState({ gameSettings: GameSettings }); //Just to render
        },

        _handleSelect: function(selectedIndex, selectedDirection) {
            this.setState({
                index: selectedIndex,
                direction: selectedDirection
            });
        },

        _toggleHideTutorial: function() {
            GameSettings.toggleHideTutorial();
        },

        render: function() {

            return D.div({ id: 'tutorial-container', className: 'modal fade in', style: { display: 'block' } },

                D.div({ className: 'modal-dialog' },

                    D.div({ className: 'modal-content' },

                        D.div({ className: 'modal-header' },
                            D.button({ type: 'button', className: 'close', onClick: this.props._toggleTutorial },
                                D.span({ 'aria-hidden': 'true' },
                                    String.fromCharCode(215)
                                )
                            ),
                            D.h4({ className: 'modal-title' },
                                'How to play'
                            )
                        ),

                        D.div({ className: 'modal-body' },

                            Carousel({ id: 'tutorial-carousel', activeIndex: this.state.index, direction: this.state.direction, onSelect: this._handleSelect},
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-clear.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.h3(null, "Welcome to DustDice"),
                                        D.p(null, "We will introduce you the basics of the gameplay.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is your current bet.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet-chase.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "You can increase or decrease your bet with these.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet-controls.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Bet on LOW or HI with these or the LEFT/RIGHT keyboard arrows.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-balance-graph.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "The green dot represents the current state of your balance.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-projection.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is the projection of how much you would win or lose in the current bet.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-balance.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is your balance, click it to refresh it if you deposit or withdraw on vault.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-payout.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is your payout and the probability of wining the bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bonus.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is the probability of winning the jackpot, you can change the jackpot amount in the settings.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-fullscreen.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "You can also play fullscreen!")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-menu.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "You can enter the settings by clicking menu->settings.")
                                    )
                                )
                            ),
                            D.input({ type: 'checkbox', checked: GameSettings.hideTutorial, onChange: this._toggleHideTutorial }, "Don't show this again"),
                            //D.span(null, 'Use your keyboard arrows to bet and increase or decrease the bet.'),
                            D.br(),
                            D.br(),
                            D.b(null, 'Keyboard Controls'),
                            D.br(),
                            D.b(null, 'Left Arrow: '), 'Bet on the low range.',
                            D.br(),
                            D.b(null, 'Right Arrow: '), 'Bet on the right range.',
                            D.br(),
                            D.b(null, 'Up Arrow: '), 'Multiply your bet by the qty on the button.',
                            D.br(),
                            D.b(null, 'Down Arrow: '), 'Divide your bet by the qty on the button.'
                        )
                    )
                )
            )
        }
    });
});