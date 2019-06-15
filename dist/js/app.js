"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactAddonsCssTransitionGroup = require("react-addons-css-transition-group");

var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);

var _getJson = require("get-json");

var _getJson2 = _interopRequireDefault(_getJson);

var _Fade = require("react-reveal/Fade");

var _Fade2 = _interopRequireDefault(_Fade);

var _electronJsonStorage = require("electron-json-storage");

var _electronJsonStorage2 = _interopRequireDefault(_electronJsonStorage);

var _uniqid = require("uniqid");

var _uniqid2 = _interopRequireDefault(_uniqid);

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
    _inherits(App, _React$Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.toggleGenre = function (showGenre, activeGenre, genreID) {
            _this.setState({ showGenre: showGenre, activeGenre: activeGenre, genreID: genreID });
        };

        _this.closeGenre = function () {
            _this.toggleGenre();
        };

        _this.setUserCredentials = function () {
            _electronJsonStorage2.default.set("userCredentials", {
                user: _this.state.user,
                create: _this.state.create,
                account: _this.state.account,
                isGuest: _this.state.isGuest
            }, function (error) {
                if (error) {
                    throw error;
                }
            });
        };

        _this.getUserCredentials = function () {
            _electronJsonStorage2.default.get("userCredentials", function (error, data) {
                _this.setState({
                    user: data.user,
                    create: data.create,
                    account: data.account,
                    isGuest: data.isGuest
                }, function () {
                    _this.startSimperium();
                });
            });
        };

        _this.updateBucket = function () {
            if (_this.state.user) {
                _this.bucket.update('favorites');
                _this.bucket.update('recentlyPlayed');
                _this.bucket.update('movieTimeArray');
            }
        };

        _this.setStorage = function () {
            _electronJsonStorage2.default.set("collection", {
                favorites: _this.state.favorites,
                recentlyPlayed: _this.state.recentlyPlayed,
                movieTimeArray: _this.state.movieTimeArray
            }, function (error) {
                if (error) {
                    throw error;
                }

                _this.updateBucket();
            });
        };

        _this.getStorage = function () {
            _electronJsonStorage2.default.get("collection", function (error, data) {

                _this.setState({
                    favorites: data ? data.favorites ? data.favorites : [] : [],
                    recentlyPlayed: data ? data.recentlyPlayed ? data.recentlyPlayed : [] : [],
                    movieTimeArray: data ? data.movieTimeArray ? data.movieTimeArray : [] : []
                }, function (error) {
                    setTimeout(function () {
                        _this.setState({ appLoading: false });
                    }, 5000);
                });
            });
        };

        _this.formatTime = function (secondString) {
            var sec_num = parseInt(secondString, 10);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - hours * 3600) / 60);
            var seconds = sec_num - hours * 3600 - minutes * 60;

            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return "" + (hours ? hours + ":" : "") + (minutes ? minutes + ":" : "") + seconds;
        };

        _this.getPreferredTorrent = function (torrents) {
            return new Promise(function (resolve, reject) {
                var preferredTorrents = torrents.filter(function (item, index) {
                    if (item) {
                        var title = item.title.toUpperCase();
                        return title.match(/^(?=.*(1080|720|HD|YIFY))(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g);
                    }
                });

                preferredTorrents.sort(function (a, b) {
                    return b.seeds - a.seeds;
                });

                resolve(preferredTorrents);
            });
        };

        _this.togglePause = function (paused) {
            _this.setState({ paused: paused });
        };

        _this.setPlayerTime = function (time) {
            _this.setState({ time: time });
        };

        _this.handleVideo = function () {
            var video = document.querySelector("video");
            var seekBar = document.querySelector(".seek-bar");

            if (seekBar !== null) {
                if (video.duration) {
                    var value = 100 / video.duration * video.currentTime;
                    var time = _this.formatTime(video.duration - video.currentTime);
                    var colorStop = _this.getElementValue(seekBar) / 100;

                    _this.setPlayerTime(time);
                    _this.setElementValue(seekBar, "value", value);

                    _this.setElementStyle(seekBar, "backgroundImage", "-webkit-gradient(linear, left top, right top, color-stop(" + colorStop + ", rgb(255, 0, 0)), color-stop(" + colorStop + ", rgba(255, 255, 255, 0.158)))");

                    _this.togglePause(video.paused);
                }
            }
        };

        _this.handleVideoClose = function (video) {
            if (video.src) {
                _this.updateMovieTime(video.currentTime);
            }
        };

        _this.setMovieTime = function (movie) {
            var video = document.querySelector("video");
            var movieMatch = _this.state.movieTimeArray.find(function (item) {
                return movie.id == item.id;
            });

            if (movieMatch) {
                if (movieMatch.currentTime) {
                    video.currentTime = movieMatch.currentTime;
                }

                _this.setState({ recentlyPlayed: _this.state.recentlyPlayed });
            }
        };

        _this.openBackup = function () {
            _this.setState({ backupIsOpen: true });
        };

        _this.showBackup = function (simple) {
            if (simple) {
                _this.openBackup();
            } else {
                _this.setVideoIndex();
                _this.setVideoError(true);
                _this.openBackup();
            }
        };

        _this.applyTimeout = function () {
            if (_this.server) {
                _this.server.close();
            }
            _this.showBackup();
            console.log('Streaming timed out.');
        };

        _this.startWebTorrent = function () {
            var WebTorrent = require('webtorrent');
            _this.setState({
                client: new WebTorrent()
            }, function () {
                _this.state.client.on('error', function (err) {
                    console.log(err);
                });
            });
        };

        _this.removeTorrent = function (magnet) {
            return new Promise(function (resolve, reject) {
                _this.state.client.remove(magnet, function () {
                    resolve('Torrent removed.');
                }, function (err) {
                    reject(err);
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.setVideoError = function (error) {
            _this.setState({ error: error });
        };

        _this.streamTorrent = function (movie) {
            _this.resetVideo();
            _this.changeCurrentMagnet(movie.magnet);

            _this.timeOut = setTimeout(function () {
                if (_this.state.time == '00:00:00') {
                    _this.applyTimeout();
                }
            }, 80000);

            if (_this.state.playMovie) {
                _this.state.client.add(movie.magnet, function (torrent) {
                    console.log("Attempting to stream \"" + movie.title + "\" from " + movie.magnet + ".");
                    var videoFormats = ["avi", "mp4", "mkv", "wmv", "mov"];
                    var filtered = torrent.files.filter(function (file) {
                        var extension = file.name.substring(file.name.lastIndexOf(".") + 1, file.name.length);

                        if (videoFormats.indexOf(extension) > -1) {
                            return file;
                        }
                    });

                    filtered.sort(function (a, b) {
                        return b.length - a.length;
                    });

                    var file = filtered[0];
                    var fileIndex = torrent.files.findIndex(function (item) {
                        return file.path == item.path;
                    });

                    if (file && _this.state.playMovie) {
                        _this.server = torrent.createServer();
                        _this.server.listen('8888');

                        _this.setVideoIndex(fileIndex).then(function () {
                            _this.setMovieTime(_this.state.playMovie);
                        });
                    } else if (!file) {
                        _this.applyTimeout();
                    } else if (!_this.state.playMovie) {
                        _this.removeMagnet(movie.magnet);
                    }
                });
            } else {
                _this.destroyClient();
            }
        };

        _this.getSearch = function () {
            return document.querySelector(".search-bar-container input");
        };

        _this.setElementValue = function (elem, property, value) {
            elem[property] = value;
        };

        _this.setElementStyle = function (elem, property, value) {
            elem.style[property] = value;
        };

        _this.getElementValue = function (elem) {
            return elem.value;
        };

        _this.resetSearch = function () {
            _this.setElementValue(_this.getSearch(), "value", "");
            _this.toggleSearch();
        };

        _this.toggleContainerSettings = function (genreContainer, collectionContainer) {
            _this.setState({ genreContainer: genreContainer, collectionContainer: collectionContainer });
        };

        _this.toggleSearch = function (open, content) {
            _this.setState({ search: open, searchContent: content });
        };

        _this.closeSearch = function () {
            _this.resetSearch();
            _this.getSearch().focus();

            if (_this.state.active != "Featured") {
                _this.toggleContainerSettings(true, _this.state.collectionContainer);
            }
        };

        _this.sortQuery = function (results, query) {
            results.sort(function (a, b) {
                return b.popularity - a.popularity;
            });

            results = results.filter(function (movie) {
                var releaseDate = movie.release_date;
                var year = Number(releaseDate.substring(0, 4));
                var month = Number(releaseDate.substring(6, 7));

                var currentDate = new Date();
                currentDate = {
                    year: currentDate.getFullYear(),
                    month: currentDate.getMonth() + 1
                };

                return movie.backdrop_path !== null && year <= currentDate.year && (year == currentDate.year ? month < currentDate.month - 1 : true) && movie.popularity > 2 && movie.vote_average > 4 && movie.original_language == "en";
            });

            return results;
        };

        _this.searchEmpty = function (query) {
            _this.setState({ searchContent: React.createElement(
                    _Fade2.default,
                    { bottom: true },
                    React.createElement(
                        "div",
                        { className: "search-empty" },
                        "No Results for \"",
                        query.length > 20 ? query.substring(0, 20) + "..." : query,
                        "\""
                    )
                ) });
        };

        _this.setOffline = function (isOffline) {
            _this.setState({ isOffline: isOffline });
        };

        _this.fetchContent = function (url, callback, err) {
            (0, _getJson2.default)(url, function (error, response) {
                if (!error) {
                    _this.setOffline();
                    if (callback) {
                        callback(response);
                    }
                } else {
                    if (err) {
                        err(error);
                    }
                }
            });
        };

        _this.searchMovies = function () {
            _this.toggleSearch(true, _this.state.searchContent);
            _this.toggleContainerSettings(false, _this.state.collectionContainer);

            var query = _this.getElementValue(_this.getSearch());

            if (query === "") {
                _this.closeSearch();
            } else {
                var searchResults = [];

                var _loop = function _loop(u) {
                    var url = "https://api.themoviedb.org/3/search/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&query=" + query + "&page=" + u + "&include_adult=false";

                    var promise = new Promise(function (resolve, reject) {
                        _this.fetchContent(url, function (response) {
                            var results = response.results;
                            resolve(results);
                        }, function (error) {
                            reject(error);
                        });
                    }).catch(function (err) {
                        return console.log(err);
                    });

                    searchResults.push(promise);
                };

                for (var u = 1; u < 5; u++) {
                    _loop(u);
                }

                Promise.all(searchResults).then(function (results) {
                    _this.setOffline();
                    results = [].concat.apply([], results);

                    if (!results.every(function (val) {
                        return !val;
                    })) {
                        results = _this.sortQuery(results, query);

                        if (results.length === 0) {
                            _this.searchEmpty(query);
                        } else {
                            _this.toggleSearch(true, _this.visualizeResults(results, true, true));
                        }
                    } else {
                        _this.searchEmpty(query);
                    }
                }).catch(function (err) {
                    return _this.setOffline(true);
                });
            }
        };

        _this.initMovie = function (movie) {
            _this.setState({ playerLoading: true, playMovie: movie, time: "00:00:00" });
        };

        _this.prepareMovieTitle = function (title) {
            return title.replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/\-/g, ' ').toLowerCase();
        };

        _this.checkMagnet = function (movie) {
            return new Promise(function (resolve, reject) {
                var magnet = movie.magnet.toUpperCase();
                if (magnet.match(/^(?!.*(HDTS|HDTC|HD\.TS|HD\.TC|HD\-TS|HD\-TC|CAM))/g)) {
                    resolve(movie);
                } else {
                    movie.magnet = false;
                    console.log('Previous magnet link was of low quality or different language.');
                    reject(movie);
                }
            });
        };

        _this.promiseTimeout = function (ms, promise) {
            var timeout = new Promise(function (resolve, reject) {
                var id = setTimeout(function () {
                    clearTimeout(id);
                    reject('Timed out in ' + ms + 'ms.');
                }, ms);
            }).catch(function (err) {
                return console.log(err);
            });

            return Promise.race([promise, timeout]);
        };

        _this.setPlayerLoading = function (playerLoading) {
            _this.setState({ playerLoading: playerLoading });
        };

        _this.setVideoIndex = function (videoIndex) {
            return new Promise(function (resolve, reject) {
                _this.setState({ videoIndex: videoIndex }, function () {
                    resolve();
                });
            });
        };

        _this.resetVideo = function () {
            _this.setPlayerLoading(true);
            _this.setVideoIndex();
            _this.setVideoError();
        };

        _this.searchTorrent = function (movie) {
            _this.resetVideo();

            if (movie.magnet) {
                _this.checkMagnet(movie).then(function (cleanMovie) {
                    _this.streamTorrent(cleanMovie);
                }).catch(function (movie) {
                    return _this.searchTorrent(movie);
                });
            } else {
                _this.fetchAttempts++;
                console.log("Try #" + _this.fetchAttempts);
                var query = _this.fetchAttempts > 3 ? "" + _this.prepareMovieTitle(movie.title) : _this.prepareMovieTitle(movie.title) + " " + movie.release_date.substring(0, 4) + "*";
                var getTorrents = _this.promiseTimeout(8000, _this.torrentSearch.search(query));

                getTorrents.then(function (result) {
                    if (result.length) {
                        _this.getPreferredTorrent(result).then(function (torrents) {
                            var torrent = torrents[0];
                            _this.setState({
                                backupTorrents: torrents
                            }, function () {
                                _this.state.playMovie.preferredTorrents = _this.state.backupTorrents;
                                _this.changeCurrentMagnet(torrent.magnet);
                                _this.updateMovieTimeArray(true);
                                _this.fetchAttempts = 0;
                                _this.streamTorrent(torrent);
                            });
                        });
                    } else {
                        _this.setState({ error: true });
                    }
                }).catch(function (err) {
                    if (_this.fetchAttempts == 6) {
                        _this.fetchAttempts = 0;
                        _this.applyTimeout();
                    } else {
                        _this.searchTorrent(movie);
                    }
                });
            }
        };

        _this.playMovie = function (movie) {
            movie = _this.matchMovie(movie);
            _this.initMovie(movie);
            _this.toggleBox().then(function () {
                _this.searchTorrent(movie);
                _this.addToRecentlyPlayed(movie);
            });
        };

        _this.destroyClient = function (backUp) {
            return new Promise(function (resolve, reject) {
                clearTimeout(_this.timeOut);
                if (_this.state.client) {
                    _this.setState({
                        playMovie: backUp ? _this.state.playMovie : false,
                        videoIndex: false,
                        paused: true,
                        backupTorrents: backUp ? _this.state.backupTorrents : false,
                        playerLoading: backUp ? true : false
                    }, function () {
                        if (_this.server) {
                            _this.server.close();
                            _this.server = false;
                        }

                        if (backUp) {
                            if (_this.currentMagnet) {
                                if (_this.state.client.get(_this.currentMagnet)) {
                                    _this.removeTorrent(_this.currentMagnet).then(function (result) {
                                        resolve(result);
                                    });
                                }
                            }
                        } else {
                            resolve();
                        }
                    });
                }
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.setFullScreen = function (full) {
            var browserWindow = require("electron").remote.getCurrentWindow();

            if (full === undefined) {
                full = false;
            }
            browserWindow.setFullScreen(full);
        };

        _this.setMovieTimeArray = function () {
            _this.setState(function (prevState) {
                if (prevState.movieTimeArray !== _this.state.movieTimeArray) {
                    return { movieTimeArray: _this.state.movieTimeArray };
                }
            }, function () {
                _this.setStorage();
            });
        };

        _this.addToMovieTimeArray = function (movie) {
            _this.state.movieTimeArray.push(movie);

            _this.setMovieTimeArray();
        };

        _this.changeCurrentMagnet = function (magnet) {
            _this.currentMagnet = magnet;
        };

        _this.getCurrentMagnet = function () {
            return _this.currentMagnet;
        };

        _this.updateMovieTimeArray = function (alt) {
            var matchingItem = _this.state.movieTimeArray.find(function (movie) {
                return movie.id == _this.state.playMovie.id;
            });

            if (matchingItem) {
                matchingItem.magnet = _this.currentMagnet;
                if (alt) {
                    matchingItem.preferredTorrents = _this.state.playMovie.preferredTorrents;
                } else {
                    matchingItem.currentTime = _this.state.playMovie.currentTime;
                }
                _this.setMovieTimeArray();
            } else {
                _this.addToMovieTimeArray({ id: _this.state.playMovie.id, currentTime: _this.state.playMovie.currentTime, magnet: _this.currentMagnet });
            }
        };

        _this.updateMovieTime = function (time) {
            if (_this.state.playMovie) {
                if (time !== 0) {
                    _this.state.playMovie.currentTime = time;
                    _this.updateMovieTimeArray();
                }
            }
        };

        _this.removeClient = function (time) {
            if (time) {
                _this.updateMovieTime(time);
            }
            _this.setState({
                error: false
            }, function () {
                _this.destroyClient().then(function () {
                    _this.removeTorrent(_this.currentMagnet).then(function (result) {
                        console.log(result);
                    });
                });
            });
            _this.setFullScreen();
        };

        _this.matchMovie = function (movie) {
            var matchingItem = _this.state.movieTimeArray.find(function (item) {
                return item.id == movie.id;
            });

            if (matchingItem) {
                movie.magnet = matchingItem.magnet;
                _this.changeCurrentMagnet(matchingItem.magnet);
                return movie;
            }

            return movie;
        };

        _this.openBox = function (movie) {
            _this.toggleBox(true);
            _this.setState({ movieCurrent: movie });
        };

        _this.toggleBox = function (active) {
            return new Promise(function (resolve, reject) {
                _this.setState({
                    showBox: active
                }, function () {
                    resolve();
                });
            });
        };

        _this.closeBackdrop = function () {
            _this.toggleBox();
        };

        _this.getHeader = function (results) {
            return results[0].backdrop_path;
        };

        _this.setHeader = function (url) {
            _this.setState({ headerBg: url });
        };

        _this.strip = function (string, chars) {
            return string.substring(0, chars);
        };

        _this.setResults = function (results) {
            if (results) {
                results = results.slice();
                _this.setState({ results: results });
            }
        };

        _this.visualizeResults = function (results, featured, set) {
            if (set) {
                _this.setResults(results);
            }

            var items = results.map(function (movie, index) {
                return React.createElement(MovieItem, {
                    movie: movie,
                    openBox: _this.openBox,
                    strip: _this.strip,
                    key: (0, _uniqid2.default)(),
                    featured: featured });
            });

            return items;
        };

        _this.getURLDate = function (n, justYear) {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth().toString().length < 2 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1,
                day = date.getDate().toString().length < 2 ? '0' + date.getDate() : date.getDate();

            if (justYear) {
                return year - n;
            }

            return year - n + "-" + month + "-" + day;
        };

        _this.getFeatured = function (resolve, reject, page) {
            var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&primary_release_date.gte=" + _this.getURLDate(5, true) + "&primary_release_date.lte=" + _this.getURLDate(1, true);
            _this.fetchContent(url, function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        };

        _this.loadFeatured = function () {
            _this.toggleContainerSettings();
            var promise = new Promise(function (resolve, reject) {
                _this.getFeatured(resolve, reject);
            });

            promise.then(function (result) {
                _this.setContent(_this.visualizeResults(result.results, true, true));
            }, function (err) {
                _this.setOffline(true);
            });
        };

        _this.shuffleArray = function (array) {
            var currentIndex = array.length;
            var temporaryValue = void 0;
            var randomIndex = void 0;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        _this.getMovies = function (genre, genreID) {
            var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + _this.state.apiKey + "&region=US&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + (Math.floor(Math.random() * _this.state.genrePages) + 1) + "&primary_release_date.lte=" + _this.getURLDate(1) + "&with_genres=" + genreID;

            return new Promise(function (resolve, reject) {
                _this.fetchContent(url, function (response) {
                    var genreComplete = {
                        name: genre,
                        genreID: genreID,
                        movies: _this.shuffleArray(response.results)
                    };
                    resolve(genreComplete);
                }, function (error) {
                    reject(error);
                });
            }).catch(function (err) {
                return console.log(err);
            });
        };

        _this.isRecent = function (movie) {
            return _this.state.recentlyPlayed.find(function (item) {
                return item.id == movie.id;
            });
        };

        _this.isFavorite = function (movie) {
            if (_this.state.favorites) {
                return _this.state.favorites.find(function (item) {
                    return item.id == movie.id;
                });
            } else {
                return false;
            }
        };

        _this.addToFavorites = function (movie) {
            _this.state.favorites.push(movie);
            _this.setState({
                favorites: _this.state.favorites.slice()
            }, function () {
                _this.setStorage();
            });
        };

        _this.removeFromFavorites = function (movie) {
            var index = _this.state.favorites.findIndex(function (item) {
                return item.id == movie.id;
            });
            _this.state.favorites.splice(index, 1);
            _this.setState({
                favorites: _this.state.favorites.slice()
            }, function () {
                _this.setStorage();
            });
        };

        _this.addToRecentlyPlayed = function (movie) {
            if (!_this.isRecent(movie)) {
                if (_this.state.recentlyPlayed.length > 9) {
                    _this.state.recentlyPlayed.splice(-1, 1);
                }

                _this.state.recentlyPlayed.unshift(movie);
                _this.setState({
                    recentlyPlayed: _this.state.recentlyPlayed.slice()
                }, function () {
                    _this.setStorage();
                });
            } else {
                var index = _this.state.recentlyPlayed.findIndex(function (item) {
                    return item.id == movie.id;
                });

                _this.state.recentlyPlayed.splice(index, 1);
                _this.state.recentlyPlayed.unshift(movie);
                _this.setState({
                    recentlyPlayed: _this.state.recentlyPlayed.slice()
                }, function () {
                    _this.setStorage();
                });
            }
        };

        _this.easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        _this.scrollTo = function (id, element, to, duration, callback) {
            var start = element.scrollLeft,
                change = to - start,
                currentTime = 0,
                increment = 20;

            var animateScroll = function animateScroll() {
                currentTime += increment;
                var val = _this.easeInOutQuad(currentTime, start, change, duration);
                element.scrollLeft = val;
                if (currentTime < duration) {
                    setTimeout(animateScroll, increment);
                } else if (currentTime == duration) {
                    if (callback) {
                        callback(id, element, to);
                    }
                }
            };

            animateScroll();
        };

        _this.scrollMovieGenre = function (left, e, id) {
            var viewportW = document.querySelector(".movie-list-paginated").parentElement.offsetWidth - 210;
            var boxW = document.querySelector(".movie-item").offsetWidth + 10;
            var viewItems = Math.ceil(viewportW / boxW);

            var container = e.currentTarget.parentElement.parentElement.querySelector(".movie-list-paginated");

            var scrollVal = container.scrollLeft;

            if (left) {
                scrollVal -= boxW * viewItems;
            } else {
                scrollVal += boxW * viewItems;
            }

            id = "#" + id;

            _this.scrollTo(id, container, scrollVal, 200, function (id, container, scrollVal) {
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 20) {
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "none");
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "flex");
                } else if (container.scrollLeft === 0) {
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "none");
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "flex");
                } else {
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-left"), "display", "flex");
                    _this.setElementStyle(document.querySelector(id).querySelector(".movie-scroll-right"), "display", "flex");
                }
            });
        };

        _this.visualizeMovieGenres = function (movieData) {
            _this.setResults(movieData[0].movies);
            var movieGenres = movieData.map(function (item, i) {
                return React.createElement(GenreContainer, {
                    toggleGenre: _this.toggleGenre,
                    genreID: item.genreID,
                    scrollMovieGenre: _this.scrollMovieGenre,
                    openBox: _this.openBox,
                    strip: _this.strip,
                    name: item.name,
                    movies: item.movies,
                    key: (0, _uniqid2.default)() });
            });

            return movieGenres;
        };

        _this.loadMovies = function () {
            _this.toggleContainerSettings(true, false);

            var genres = [{
                "id": 28,
                "name": "Action"
            }, {
                "id": 12,
                "name": "Adventure"
            }, {
                "id": 16,
                "name": "Animation"
            }, {
                "id": 35,
                "name": "Comedy"
            }, {
                "id": 80,
                "name": "Crime"
            }, {
                "id": 99,
                "name": "Documentary"
            }, {
                "id": 18,
                "name": "Drama"
            }, {
                "id": 10751,
                "name": "Family"
            }, {
                "id": 14,
                "name": "Fantasy"
            }, {
                "id": 36,
                "name": "History"
            }, {
                "id": 27,
                "name": "Horror"
            }, {
                "id": 10402,
                "name": "Music"
            }, {
                "id": 9648,
                "name": "Mystery"
            }, {
                "id": 10749,
                "name": "Romance"
            }, {
                "id": 878,
                "name": "Sci-Fi"
            }, {
                "id": 10770,
                "name": "TV Movie"
            }, {
                "id": 53,
                "name": "Thriller"
            }, {
                "id": 10752,
                "name": "War"
            }, {
                "id": 37,
                "name": "Western"
            }];

            var promiseArray = [];

            var _loop2 = function _loop2(j) {
                var promise = new Promise(function (resolve, reject) {
                    _this.getMovies(genres[j].name, genres[j].id).then(function (genreComplete) {
                        resolve(genreComplete);
                    }).catch(function (err) {
                        return console.log(err);
                    });
                });

                promiseArray.push(promise);
            };

            for (var j = 0; j < genres.length; j++) {
                _loop2(j);
            }

            Promise.all(promiseArray).then(function (data) {
                _this.setContent(_this.visualizeMovieGenres(data));
            }).catch(function () {
                return _this.setOffline(true);
            });
        };

        _this.loadCollection = function () {
            _this.toggleContainerSettings(true, true);
            if (_this.state.recentlyPlayed && _this.state.favorites) {
                var headerSource = _this.state.recentlyPlayed.length ? _this.state.recentlyPlayed : false || _this.state.favorites.length ? _this.state.favorites : false;
                _this.setResults(headerSource);
            }
        };

        _this.setContent = function (content) {
            _this.setState({ content: content });
        };

        _this.loadContent = function (active) {
            _this.setContent(false);
            switch (active) {
                case "Featured":
                    _this.loadFeatured();
                    break;
                case "Movies":
                    _this.loadMovies();
                    break;
                case "Collection":
                    _this.loadCollection();
                    break;
            }
        };

        _this.handleMenu = function () {
            if (_this.state.menuActive) {
                _this.setElementStyle(document.querySelector(".app-menu-button"), "transform", "rotate(" + (_this.state.menuActive ? "0" : "360") + "deg)");
                _this.setState({ menuActive: false });
            }
        };

        _this.updateMenu = function (menuActive, active) {
            if (menuActive != undefined) {
                _this.setState({ menuActive: menuActive });
            }

            if (active != undefined) {
                _this.setState({
                    active: active
                }, function () {
                    _this.loadContent(_this.state.active);
                });
            }
        };

        _this.handleLogo = function () {
            _this.setState({ logoIsLoaded: true });
        };

        _this.loadLogo = function () {
            var tempImage = new Image();
            tempImage.onload = _this.handleLogo;
            tempImage.src = 'assets/imgs/icon.png';
        };

        _this.requireTorrent = function () {
            _this.torrentSearch = TorrentSearch;
        };

        _this.startSimperium = function () {
            if (!_this.state.isGuest && _this.state.user) {
                _this.simperiumScript = document.createElement('script');
                _this.simperiumScript.setAttribute('type', 'text/javascript');
                _this.simperiumScript.setAttribute('src', './libs/simperium.min.js');
                (0, _jquery2.default)('body').append(_this.simperiumScript);

                _this.simperium = new Simperium(_this.state.simperiumId, { token: _this.state.user.token });

                _this.bucket = _this.simperium.bucket('collection');
                _this.bucket.on('notify', function (id, data) {
                    if (data) {
                        if (data.content) {
                            _this.setState(function (prevState) {
                                if (prevState[id] !== data.content) {
                                    return _defineProperty({}, id, data.content);
                                }
                            });
                        }
                    }
                });
                _this.bucket.on('local', function (id) {
                    return { content: _this.state[id] };
                });
                _this.bucket.start();
            } else if (!_this.state.isGuest && !_this.state.user) {
                _this.openAccount();
            }
        };

        _this.handleAccount = function (create, email, password) {
            if (!email && !password) {
                _this.setState({ loginError: true });
            } else {
                var id = _this.state.simperiumId;
                var key = _this.state.simperiumKey;
                var _url = "https://auth.simperium.com/1/" + id + "/" + (create ? 'create' : 'authorize') + "/";

                var _$ = require('jquery');

                _$.ajax({
                    url: _url,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({ "username": email, "password": password }),
                    beforeSend: function beforeSend(xhr) {
                        xhr.setRequestHeader("X-Simperium-API-Key", key);
                    },
                    success: function success(data) {
                        var user = {
                            email: email,
                            password: password,
                            token: data.access_token
                        };

                        _this.closeAccount();
                        _this.setState({
                            user: user,
                            isGuest: false,
                            loginError: false
                        }, function () {
                            _this.setUserCredentials();
                            _this.startSimperium();
                        });
                    },
                    error: function error(_error) {
                        _this.setState({ loginError: _error.responseText });
                    }
                });
            }
        };

        _this.openAccount = function () {
            _this.setState({ account: true });
        };

        _this.openAccountCreation = function () {
            _this.setState({ create: true, loginError: false });
        };

        _this.closeAccount = function () {
            _this.setState({
                account: false,
                create: false,
                loginError: false,
                isGuest: true
            }, function () {
                _this.setUserCredentials();
            });
        };

        _this.closeBackup = function () {
            _this.setState({ backupIsOpen: false });
        };

        _this.signOut = function () {
            _this.simperium = false;
            _this.bucket = false;

            _this.setState({
                user: false
            }, function () {
                _this.setUserCredentials();

                _this.simperiumScript.parentNode.removeChild(_this.simperiumScript);
            });
        };

        _this.handleInput = function (e) {
            if (e.keyCode == 13) {
                _this.handleAccount(false, document.querySelector('input[type="email"]').value, document.querySelector('input[type="password"]').value);
            }
        };

        _this.handleConnectionChange = function (e) {
            if (e.type == "offline") {
                _this.setOffline(true);
            }
            if (e.type == "online") {
                _this.setOffline();
                _this.updateMenu(false, _this.state.active);
                _this.resetSearch();
            }
        };

        _this.fetchAttempts = 0;

        _this.state = {
            apiKey: "22b4015cb2245d35a9c1ad8cd48e314c",
            simperiumId: "petition-locomotive-460",
            simperiumKey: "d456aece029d44449569864ca68e0054",
            loginError: false,
            account: true,
            create: false,
            user: false,
            isGuest: false,
            menu: ["Featured", "Movies", "Collection", "Sign In"],
            active: "Featured",
            backupTorrents: false,
            recentlyPlayed: [],
            favorites: [],
            movieTimeArray: [],
            magnetArray: [],
            results: [],
            backupIsOpen: false,
            videoIndex: false,
            activeGenre: false,
            genreID: 0,
            showGenre: false,
            collectionContainer: false,
            menuActive: false,
            headerBg: false,
            content: false,
            showBox: false,
            movieCurrent: false,
            playMovie: false,
            playerLoading: true,
            paused: true,
            genreContainer: false,
            genrePages: 7,
            search: false,
            searchContent: false,
            isOffline: false,
            logoIsLoaded: false,
            error: false,
            appLoading: true,
            time: "00:00:00"
        };
        return _this;
    }

    _createClass(App, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadLogo();
            this.getUserCredentials();
            this.getStorage();
            this.loadContent(this.state.active);
            this.startWebTorrent();
            this.requireTorrent();
            window.addEventListener('online', this.handleConnectionChange);
            window.addEventListener('offline', this.handleConnectionChange);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var menu = this.state.menuActive ? React.createElement(Menu, {
                menu: this.state.menu,
                user: this.state.user,
                openAccount: this.openAccount,
                signOut: this.signOut,
                active: this.state.active,
                updateMenu: this.updateMenu,
                resetSearch: this.resetSearch }) : null;

            var movieBackDrop = this.state.showBox ? React.createElement("div", { className: "movie-container-bg", onClick: this.closeBackdrop }) : null;

            var movieModal = this.state.showBox ? React.createElement(MovieModal, {
                movie: this.state.movieCurrent,
                favorites: this.state.favorites,
                playMovie: this.playMovie,
                isFavorite: this.isFavorite,
                addToFavorites: this.addToFavorites,
                removeFromFavorites: this.removeFromFavorites }) : null;

            var playerModal = this.state.playMovie ? React.createElement(Player, {
                changeCurrentMagnet: this.changeCurrentMagnet,
                updateMovieTime: this.updateMovieTime,
                resetClient: this.destroyClient,
                togglePause: this.togglePause,
                showBackup: this.showBackup,
                openBackup: this.state.backupIsOpen,
                closeBackup: this.closeBackup,
                backupTorrents: this.state.backupTorrents,
                streamTorrent: this.streamTorrent,
                searchTorrent: this.searchTorrent,
                time: this.state.time,
                index: this.state.videoIndex,
                paused: this.state.paused,
                removeClient: this.removeClient,
                handleVideoClose: this.handleVideoClose,
                setFullScreen: this.setFullScreen,
                movie: this.state.movieCurrent,
                getCurrentMagnet: this.getCurrentMagnet,
                loading: this.state.playerLoading,
                setPlayerLoading: this.setPlayerLoading,
                setElementValue: this.setElementValue,
                getElementValue: this.getElementValue,
                error: this.state.error,
                handleVideo: this.handleVideo }) : null;

            var fullGenreContainer = this.state.showGenre ? React.createElement(Genre, {
                genre: this.state.activeGenre,
                genreID: this.state.genreID,
                apiKey: this.state.apiKey,
                fetchContent: this.fetchContent,
                visualizeResults: this.visualizeResults,
                setOffline: this.setOffline,
                closeGenre: this.closeGenre }) : null;

            var loadingContainer = this.state.appLoading ? React.createElement(
                "div",
                { className: "loading-container" },
                React.createElement(
                    _Fade2.default,
                    { when: this.state.logoIsLoaded, distance: "10%", bottom: true },
                    React.createElement("div", { className: "logo" })
                )
            ) : null;

            var accountContainer = this.state.account ? React.createElement(
                "div",
                { className: "account-container" },
                React.createElement(
                    _Fade2.default,
                    { bottom: true, distance: "10%" },
                    React.createElement(
                        "div",
                        { className: "account-form" },
                        React.createElement(
                            "div",
                            { className: "account-close", onClick: this.closeAccount },
                            React.createElement("i", { className: "mdi mdi-close" })
                        ),
                        React.createElement(
                            "div",
                            { className: "account-register" },
                            "Don't have an account?",
                            React.createElement(
                                "span",
                                { onClick: this.openAccountCreation },
                                "Register here."
                            )
                        ),
                        React.createElement(
                            "div",
                            { className: "account-title" },
                            "Sign in"
                        ),
                        React.createElement(
                            "div",
                            { className: "account-desc" },
                            "Flixerr will use your account to synchronize data across all your devices."
                        ),
                        React.createElement("input", { type: "email", placeholder: "Email", required: true }),
                        React.createElement("input", {
                            type: "password",
                            placeholder: "Password",
                            required: true,
                            onKeyUp: this.handleInput }),
                        " ",
                        this.state.loginError ? React.createElement(
                            _Fade2.default,
                            { bottom: true, distance: "10%" },
                            React.createElement(
                                "div",
                                { className: "login-error" },
                                this.state.loginError
                            )
                        ) : '',
                        React.createElement(
                            "div",
                            {
                                className: "account-submit",
                                onClick: function onClick() {
                                    return _this2.handleAccount(false, document.querySelector('input[type="email"]').value, document.querySelector('input[type="password"]').value);
                                } },
                            "Sign In"
                        )
                    )
                )
            ) : null;

            var createContainer = this.state.create ? React.createElement(
                "div",
                { className: "create-container account-container" },
                React.createElement(
                    "div",
                    { className: "account-form" },
                    React.createElement(
                        "div",
                        { className: "account-close", onClick: this.closeAccount },
                        React.createElement("i", { className: "mdi mdi-close" })
                    ),
                    React.createElement(
                        "div",
                        { className: "account-title" },
                        "Create an account"
                    ),
                    React.createElement(
                        "div",
                        { className: "account-desc" },
                        "Register to easily synchronize data across multiple devices."
                    ),
                    React.createElement("input", { type: "email", placeholder: "Email", required: true }),
                    React.createElement("input", {
                        type: "password",
                        placeholder: "Password",
                        required: true,
                        onKeyUp: this.handleInput }),
                    " ",
                    this.state.loginError ? React.createElement(
                        _Fade2.default,
                        { bottom: true, distance: "10%" },
                        React.createElement(
                            "div",
                            { className: "login-error" },
                            this.state.loginError
                        )
                    ) : '',
                    React.createElement(
                        "div",
                        {
                            className: "account-submit",
                            onClick: function onClick() {
                                return _this2.handleAccount(true, document.querySelector('.create-container').querySelector('input[type="email"]').value, document.querySelector('.create-container').querySelector('input[type="password"]').value);
                            } },
                        "Create"
                    )
                )
            ) : null;

            return React.createElement(
                "div",
                {
                    className: "app-container " + (process.platform === "win32" ? "windows-compensate" : ''),
                    onClick: this.handleMenu },
                process.platform === "darwin" ? React.createElement("div", {
                    className: 'draggable ' + (this.state.playMovie ? "invisible" : "") }) : '',
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "player-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    createContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "player-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    accountContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "loading-anim",
                        transitionEnterTimeout: 0,
                        transitionLeaveTimeout: 300 },
                    loadingContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "genreContainer-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    fullGenreContainer
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "player-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    playerModal
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "movie-box-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    movieModal
                ),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "box-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    movieBackDrop
                ),
                React.createElement(Header, {
                    subtitle: this.state.active,
                    menuActive: this.state.menuActive,
                    updateMenu: this.updateMenu,
                    background: this.state.headerBg,
                    closeSearch: this.closeSearch,
                    searchContent: this.state.searchContent,
                    searchMovies: this.searchMovies,
                    user: this.state.user }),
                React.createElement(
                    _reactAddonsCssTransitionGroup2.default,
                    {
                        transitionName: "menu-anim",
                        transitionEnterTimeout: 300,
                        transitionLeaveTimeout: 300 },
                    menu
                ),
                React.createElement(Content, {
                    isOffline: this.state.isOffline,
                    content: this.state.content,
                    genre: this.state.genreContainer,
                    collectionContainer: this.state.collectionContainer,
                    recentlyPlayed: this.state.recentlyPlayed,
                    favorites: this.state.favorites,
                    search: this.state.search,
                    searchContent: this.state.searchContent,
                    scrollMovieGenre: this.scrollMovieGenre,
                    getHeader: this.getHeader,
                    setHeader: this.setHeader,
                    strip: this.strip,
                    openBox: this.openBox,
                    results: this.state.results })
            );
        }
    }]);

    return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById("app"));