/* eslint-disable no-restricted-globals */
import React, { useEffect, useCallback, Suspense, useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from "react-error-boundary";

import './App.css';
import i18n from './i18n.js';
import loadPolyfills from './modules/polyfills.js';

import RemoteControlId from './components/remote-control-id/index.jsx';
import { fetchTarkovTrackerProgress, setPlayerPosition } from './features/settings/settingsSlice.js';

import {
    setConnectionStatus,
    enableConnection,
} from './features/sockets/socketsSlice.js';
import useStateWithLocalStorage from './hooks/useStateWithLocalStorage.jsx';
import makeID from './modules/make-id.js';

import Loading from './components/loading/index.js';

import supportedLanguages from './data/supported-languages.json';

import Menu from './components/menu/index.js';
import Footer from './components/footer/index.js';
const Map = React.lazy(() => import('./pages/map/index.js'));
const ErrorPage = React.lazy(() => import('./pages/error-page/index.js'));
const Debug = React.lazy(() => import('./components/Debug.jsx'));



const socketServer = `ws://socket.tarkov.lycorecocafe.com`;

let socket = false;
let tarkovTrackerProgressInterval = false;

loadPolyfills();

function Fallback({ error, resetErrorBoundary }) {
    return (
        <div className="display-wrapper" style={{minHeight: "40vh"}} key="fallback-wrapper">
            <h1 className="center-title">
                Something went wrong.
            </h1>
            <div className="page-wrapper" style={{minHeight: "40vh"}}>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                    <pre style={{ color: "red" }}>{error.message}</pre>
                    <pre>{error.stack}</pre>
                    You can <button style={{ padding: '.2rem', borderRadius: '4px' }} onClick={resetErrorBoundary}>try again</button> or report the issue by
                    joining our <a href="https://discord.gg/XJqw5T3H3u" target="_blank" rel="noopener noreferrer">Discord</a> server and 
                    copy/paste the above error and some details in <a href="https://discord.com/channels/956236955815907388/956239773742288896" target="_blank" rel="noopener noreferrer">#🐞bugs-issues</a> channel.
                </details>
            </div>
        </div>
    );
}

function App() {
    const connectToId = new URLSearchParams(window.location.search).get(
        'connection',
    );
    if (connectToId) {
        localStorage.setItem('sessionId', JSON.stringify(connectToId));
    }
    const [sessionID] = useStateWithLocalStorage('sessionId', makeID(4));
    const socketEnabled = useSelector((state) => state.sockets.enabled);
    const controlId = useSelector((state) => state.sockets.controlId);
    let navigate = useNavigate();
    const dispatch = useDispatch();

    if (connectToId) {
        dispatch(enableConnection());
    }

    const useTarkovTracker = useSelector(
        (state) => state.settings.useTarkovTracker,
    );
    
    const progressStatus = useSelector((state) => {
        return state.settings.progressStatus;
    });

    const tarkovTrackerAPIKey = useSelector(
        (state) => state.settings.tarkovTrackerAPIKey,
    );

    useEffect(() => {
        if (useTarkovTracker && progressStatus !== 'loading' && !tarkovTrackerProgressInterval) {
            dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
        }

        if (!tarkovTrackerProgressInterval && useTarkovTracker) {
            tarkovTrackerProgressInterval = setInterval(() => {
                dispatch(fetchTarkovTrackerProgress(tarkovTrackerAPIKey));
            }, 1000 * 60 * 5);
        }

        if (tarkovTrackerProgressInterval && !useTarkovTracker) {
            clearInterval(tarkovTrackerProgressInterval);
            tarkovTrackerProgressInterval = false;
        }

        return () => {
            clearInterval(tarkovTrackerProgressInterval);
            tarkovTrackerProgressInterval = false;
        };
    }, [progressStatus, dispatch, tarkovTrackerAPIKey, useTarkovTracker]);
    useEffect(() => {
        const handleDisplayMessage = (rawMessage) => {
            const message = JSON.parse(rawMessage.data);

            if (message.type !== 'command') {
                return false;
            }

            // if (message.data.type === 'playerPosition') {
            //     dispatch(setPlayerPosition(message.data));
            //     return false;
            // }

            if (message.data.type === 'playerPosition') {
                // 构造
                let json_;
                const urlParams = new URLSearchParams(window.location.search);
                if (!urlParams.has('json')) {
                    json_ = {
                            "self": false,
                            "teammate": 0,
                            "selfjson": {},
                            "teammatejson": []
                        };

                }
                else {
                    const urlParamsData = urlParams.get('json');
                    json_ = JSON.parse(urlParamsData);
                }


                //如果是本人
                if (!message.data.is_teammate) {
                    json_.self = true;
                    json_.selfjson = message.data.playerPosition;
                }
                else {
                    if(json_.teammatejson === undefined) {
                        json_.teammatejson = []
                    }
                    //寻找是否已经存在相同的名字
                    let isExist = false;
                    for (let i = 0; i < json_.teammatejson.length; i++) {
                        if (json_.teammatejson[i].name === message.data.playerPosition.name) {
                            json_.teammatejson[i] = message.data.playerPosition;
                            isExist = true;
                        }
                    }
                    if (!isExist) {
                        json_.teammate++
                        json_.teammatejson.push(message.data.playerPosition);
                    }

                }
                console.log(json_)
                const json = JSON.stringify(json_);
                console.log(json)
                const currentPath = window.location.pathname;
                navigate('/map')
                //等待3秒
                setTimeout(() => {
                    navigate(`${currentPath}?json=${json}`);
                },100)


                return false;

                // const urlParams = new URLSearchParams(window.location.search);
                //
                // const urlParamsData = urlParams.get('json');
                // const json_old = JSON.parse(urlParamsData);
            }

            navigate(`/${message.data.type}/${message.data.value}`);
        };

        const connect = function connect() {
            socket = new WebSocket(socketServer);

            const heartbeat = function heartbeat() {
                clearTimeout(socket.pingTimeout);

                // Use `WebSocket#terminate()`, which immediately destroys the connection,
                // instead of `WebSocket#close()`, which waits for the close timer.
                // Delay should be equal to the interval at which your server
                // sends out pings plus a conservative assumption of the latency.
                socket.pingTimeout = setTimeout(() => {
                    if (socket && socket.terminate) {
                        socket.terminate();
                    }
                    dispatch(setConnectionStatus(false));
                }, 40000 + 1000);
            };

            socket.addEventListener('message', (rawMessage) => {
                const message = JSON.parse(rawMessage.data);

                if (message.type === 'ping') {
                    heartbeat();

                    socket.send(JSON.stringify({ type: 'pong' }));

                    return true;
                }

                handleDisplayMessage(rawMessage);
            });

            socket.addEventListener('open', () => {
                console.log('Connected to socket server');
                console.log(socket);

                heartbeat();

                dispatch(setConnectionStatus(true));

                socket.send(
                    JSON.stringify({
                        sessionID: sessionID,
                        type: 'connect',
                    }),
                );
            });

            socket.addEventListener('close', () => {
                console.log('Disconnected from socket server');

                dispatch(setConnectionStatus(false));

                clearTimeout(socket.pingTimeout);
            });

            setInterval(() => {
                if (socket.readyState === 3 && socketEnabled) {
                    console.log('trying to re-connect');
                    connect();
                }
            }, 5000);
        };

        if (socket === false && socketEnabled) {
            connect();
        }

        return () => {
            // socket.terminate();
        };
    }, [socketEnabled, sessionID, navigate, dispatch]);

    const send = useCallback(
        (messageData) => {
            if (socket.readyState !== 1) {
                // Wait a bit if we're not connected
                setTimeout(() => {
                    socket.send(
                        JSON.stringify({ sessionID: controlId,
                            ...messageData,
                        }),
                    );
                }, 500);

                return true;
            }

            socket.send(
                JSON.stringify({
                    sessionID: controlId,
                    ...messageData,
                }),
            );
        },
        [controlId],
    );

    const hideRemoteControlId = useSelector(
        (state) => state.settings.hideRemoteControl,
    );
    const remoteControlSessionElement = hideRemoteControlId ? null : (
        <Suspense fallback={<Loading />} key="suspense-connection-wrapper">
            <RemoteControlId
                key="connection-wrapper"
                sessionID={sessionID}
                socketEnabled={socketEnabled}
                onClick={(e) => dispatch(enableConnection())}
            />
        </Suspense>
    );
    const alternateLangs = supportedLanguages.filter(lang => lang !== i18n.language);

    return (
        <div className="App">
            <Helmet htmlAttributes={{ lang: i18n.language }}>
                <meta property="og:locale" content={i18n.language} key="meta-locale" />
                {alternateLangs.map((lang) => (
                    <meta property="og:locale:alternate" content={lang} key={`meta-locale-alt-${lang}`} />
                ))}
            </Helmet>
            <Menu />
            <CookieConsent>
                tarkov.dev uses cookies to enhance your experience. By continuing to use this site, you agree to the usage of cookies. Cookies are used to remember your settings and features that you enable.
            </CookieConsent>
            <ErrorBoundary FallbackComponent={Fallback}>
                <Routes>
                    <Route
                        path={'/map/:currentMap'}
                        key="map-current-route"
                        element={[
                            <Suspense fallback={<Loading />} key="suspense-map-wrapper">
                                <Map key="map-wrapper" />
                            </Suspense>,
                            remoteControlSessionElement,
                        ]}
                    />
                </Routes>
            </ErrorBoundary>
            <Footer />
        </div>
    );
}

export default App;
