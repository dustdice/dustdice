define([
    'lib/react',
    'react-bootstrap',
    'stores/game'
],function(
    React,
    ReactBootstrap,
    GameStore
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
          GameStore.setHideTutorial();
        },

        _handleSelect: function(selectedIndex, selectedDirection) {
            this.setState({
                index: selectedIndex,
                direction: selectedDirection
            });
        },

        _handleBackDropClick: function(e) {
            if(e.target === e.currentTarget)
                this.props._toggleTutorial();
        },

        render: function() {

            return D.div({ id: 'screenshots-container', className: 'modal fade in', style: { display: 'block' }, onClick: this._handleBackDropClick },

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

                            Carousel({ id: 'screenshots-carousel', activeIndex: this.state.index, direction: this.state.direction, onSelect: this._handleSelect},
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-clean.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.h3(null, "Welcome to Dust Dice"),
                                        D.p(null, "Here we'll show you how to play")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-bet.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "This is your current bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-bet-chase.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "Decrease or increase your bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-bet-controls.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "Bet if you think the next number will be low, or high. You can use left or right arrow keys for this too")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-balance-graph.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "The big dot shows your current balance")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-projection.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "The projection shows what you stand to make and lose from your bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-balance.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "This is your balance, and can be refreshed with a click.")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-potential-profit.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "This is the profit you could get if you win the current bet")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-chat.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "We have an awesome chat, talk to everyone!")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-faucet.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "Free money!, yes, free as in free beer")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-fullscreen.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "Don't miss the immersive fullscreen experience!")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-menu.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.p(null, "Check out more settings, like hiding buttons once you get the hang of it")
                                    )
                                ),
                                CarouselItem(null,
                                    D.img({ width: 900, height: 500, alt: "900x500", src: "/img/screenshots/screenshot-clean.png" }),
                                    D.div({ className: "carousel-caption" },
                                        D.h3(null, "Good luck!"),
                                        D.p(null, "And never dice the same way again")
                                    )
                                )
                            ),
                            D.br(),
                            D.p({ className: 'text-center' }, D.b(null, 'Keyboard Controls')),
                            D.dl({ className: 'dl-horizontal' },
                                D.dt(null, 'Left Arrow'),
                                D.dd(null, 'Bet on the lower range'),
                                D.dt(null, 'Right Arrow'),
                                D.dd(null, 'Bet on the higher range.'),
                                D.dt(null, 'Up Arrow'),
                                D.dd(null, 'Increase bet size'),
                                D.dt(null, 'Down Arrow'),
                                D.dd(null, 'Decrease bet size')
                            )
                        )
                    )
                )
            )
        }
    });
});