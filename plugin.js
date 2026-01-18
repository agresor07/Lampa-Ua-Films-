(function () {
    'use strict';

    function UANetflix() {
        var network = new Lampa.Reguest();
        var html    = $('<div></div>');
        var global_used = new Set(); 

        const DOMAINS = {
            eneyida: 'https://eneyida.tv/',
            uakino: 'https://uakino.me/',
            uaflix: 'https://uaflix.tv/',
            uaserials: 'https://uaserials.pro/',
            vezha: 'https://kinovezha.com/',
            tron: 'https://kinotron.top/',
            serialno: 'https://serialno.top/',
            uatut: 'https://uatut.com/',
            ufdub: 'https://ufdub.com/',
            ideia: 'https://cikanava-ideia.com.ua/'
        };

        const GENRES = [
            { title: 'НОВИНКИ: ФІЛЬМИ', paths: ['main/', 'filmy/', ''] },
            { title: 'НОВИНКИ: СЕРІАЛИ', paths: ['series/', 'seriali/', 'serialy/'] },
            { title: 'БОЙОВИКИ', paths: ['f/action/', 'filmy/bojovyk/'] },
            { title: 'КОМЕДІЇ', paths: ['f/comedy/', 'filmy/komedija/'] },
            { title: 'ФАНТАСТИКА', paths: ['f/fiction/', 'filmy/fantastyka/'] },
            { title: 'ЖАХИ', paths: ['f/horror/', 'filmy/zhahy/'] },
            { title: 'МУЛЬТФІЛЬМИ', paths: ['cartoon/', 'multfilmy/'] },
            { title: 'АНІМЕ', paths: ['anime/', 'multserialy/anime/'] }
        ];

        this.create = function () {
            var self = this;
            html.append('<div style="padding: 40px 20px 10px;"><img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" style="height: 35px; vertical-align: middle;"><span style="font-size: 28px; font-weight: bold; color: #e50914; margin-left: 10px; vertical-align: middle;">UKRAINE TOTAL</span></div>');
            
            this.addHistory();

            GENRES.forEach(function(genre) {
                self.addUniversalSection(genre.title, genre.paths);
            });

            return this.render();
        };

        this.addHistory = function() {
            var history = Lampa.History.get('view');
            if (history && history.length > 0) {
                var row = this.createRowHtml("ПРОДОВЖИТИ ПЕРЕГЛЯД");
                html.append(row);
                var container = row.find('.ua-items-container');
                history.slice(0, 20).forEach(item => this.appendCard(container, item));
                this.enableLoop(container);
            }
        };

        this.createRowHtml = function(title) {
            return $('<div class="ua-row" style="margin-bottom: 35px;"><div style="padding: 10px 20px; font-size: 1.3em; font-weight: bold; color: #e5e5e5; text-transform: uppercase; letter-spacing: 1px;">' + title + '</div><div class="ua-items-container" style="display: flex; overflow-x: auto; padding: 10px 20px; scrollbar-width: none;"></div></div>');
        };

        this.addUniversalSection = function (title, paths) {
            var self = this;
            var row = this.createRowHtml(title);
            html.append(row);
            var container = row.find('.ua-items-container');

            Object.values(DOMAINS).forEach(function(domain) {
                paths.forEach(function(path) {
                    network.silent(domain + path, function(data) {
                        $(data).find('.shortstory, .movie-item, .th-item, .poster--card, .item').slice(0, 10).each(function() {
                            var t = $(this).find('.title, .short-title, .poster__title, h2, h3').first().text().trim();
                            var img = $(this).find('img').attr('src') || $(this).find('img').attr('data-src');
                            var link = $(this).find('a').attr('href');

                            if (t && !global_used.has(t.toLowerCase() + title)) {
                                global_used.add(t.toLowerCase() + title);
                                if (img && img.indexOf('http') === -1) img = 'https:' + img;
                                var item = { 
                                    title: t, 
                                    img: img, 
                                    url: (link && link.indexOf('http') === -1 ? domain + link : link) 
                                };
                                self.appendCard(container, item);
                            }
                        });
                        self.enableLoop(container);
                    });
                });
            });
        };

        this.appendCard = function(container, item) {
            var card = Lampa.Template.get('card', item);
            card.addClass('selector').css({'min-width': '200px', 'margin-right': '15px'});
            card.on('hover:enter', function() { Lampa.Full.open(item, { component: 'full' }); });
            container.append(card);
        };

        this.enableLoop = function(container) {
            container.on('sn:will-move-out', function(e) {
                var items = container.find('.selector');
                if (e.detail.direction === 'right' && $(e.target).is(items.last())) {
                    Lampa.Focus.set(items.first());
                    e.preventDefault();
                } else if (e.detail.direction === 'left' && $(e.target).is(items.first())) {
                    Lampa.Focus.set(items.last());
                    e.preventDefault();
                }
            });
        };

        this.render = function () { return html; };
    }

    function startPlugin() {
        Lampa.Component.add('ua_netflix', UANetflix);

        // Пошук по всіх сайтах з групуванням
        Lampa.Listener.follow('search', function (e) {
            if (e.type == 'plagin' && e.query) {
                var res = $('<div></div>');
                var net = new Lampa.Reguest();
                var q = encodeURIComponent(e.query);
                
                const SEARCH_SOURCES = [
                    {n: 'Eneyida', u: 'https://eneyida.tv/index.php?do=search&subaction=search&story='},
                    {n: 'Uakino', u: 'https://uakino.me/index.php?do=search&subaction=search&story='},
                    {n: 'UAFlix', u: 'https://uaflix.tv/index.php?do=search&subaction=search&story='}
                ];

                SEARCH_SOURCES.forEach(function(s) {
                    net.silent(s.u + q, function(data) {
                        var cards = $(data).find('.shortstory, .movie-item, .th-item');
                        if (cards.length > 0) {
                            res.append('<div style="padding: 20px; color: #e50914; font-size: 1.5em; font-weight: bold;">Знайдено на ' + s.n + '</div>');
                            cards.each(function() {
                                var item = { 
                                    title: $(this).find('.title, .short-title').text().trim(), 
                                    img: $(this).find('img').attr('src'), 
                                    url: $(this).find('a').attr('href') 
                                };
                                var card = Lampa.Template.get('card', item);
                                card.addClass('selector').on('hover:enter', function() { Lampa.Full.open(item, { component: 'full' }); });
                                res.append(card);
                            });
                        }
                    });
                });
                e.callback(res);
            }
        });

        // Дизайн сторінки фільму
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'ready') {
                var btns = e.object.render().find('.full-start-new__buttons');
                btns.empty();
                var play = $('<div class="full-start-new__button button--white selector" style="background: #e50914; color: white; border: none; font-weight: bold; min-width: 250px;"><span>ДИВИТИСЯ</span></div>');
                var trailer = $('<div class="full-start-new__button button--grey selector"><span>Трейлер</span></div>');
                
                play.on('hover:enter', function() { Lampa.Player.run({ url: e.object.movie.url, title: e.object.movie.title }); });
                trailer.on('hover:enter', function() { Lampa.Youtube.search(e.object.movie.title + ' трейлер'); });
                
                btns.append(play).append(trailer);
            }
        });

        Lampa.Menu.add({
            title: 'UA Netflix',
            id: 'ua_netflix_root',
            icon: '<svg height="36" viewBox="0 0 24 24" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#e50914"/></svg>',
            onSelect: function () { Lampa.Activity.push({ title: 'UA Netflix', component: 'ua_netflix' }); }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
