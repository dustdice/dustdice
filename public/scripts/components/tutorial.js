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
          GameSettings.setHideTutorial();
        },

        _handleSelect: function(selectedIndex, selectedDirection) {
            this.setState({
                index: selectedIndex,
                direction: selectedDirection
            });
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
                                'Dust Dice Tutorial'
                            )
                        ),

                        D.div({ className: 'modal-body' },

                            Carousel({ id: 'tutorial-carousel', activeIndex: this.state.index, direction: this.state.direction, onSelect: this._handleSelect},
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-clear.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.h3(null, "Welcome to Dust Dice"),
                                        D.p(null, "Here we'll show you how to play")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is your current bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet-chase.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Decrease or increase your bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bet-controls.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Bet if you think the next number will be low, or high. You can use left or right arrow keys for this too")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-balance-graph.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "The big dot shows your current balance")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-projection.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "The projection shows what you stand to make and lose from your bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-balance.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "This is your balance, and can be refreshed with a click.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-bonus.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Configure your own jackpot, and see how likely you are to win it")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-fullscreen.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Don't miss the immersive fullscreen experience!")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-menu.png"}),
                                    D.div({className: "carousel-caption"},
                                        D.p(null, "Check out more settings, like hiding buttons once you get the hang of it")
                                    )
                                ),
                              CarouselItem(null,
                                D.img({width: 900, height: 500, alt: "900x500", src: "/img/screen-shot-clear.png"}),
                                D.div({className: "carousel-caption"},
                                  D.h3(null, "Good luck!"),
                                  D.p(null, "And never dice the same way again")
                                )
                              )
                            ),
                            D.br(),
                            D.br(),
                            D.b(null, 'Keyboard Controls'),
                            D.br(),
                            D.b(null, 'Left Arrow: '), 'Bet on the lower range',
                            D.br(),
                            D.b(null, 'Right Arrow: '), 'Bet on the higher range.',
                            D.br(),
                            D.b(null, 'Up Arrow: '), 'Increase bet size',
                            D.br(),
                            D.b(null, 'Down Arrow: '), 'Decrease bet size'
                        )
                    )
                )
            )
        }
    });
});