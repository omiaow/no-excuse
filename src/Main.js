import { useEffect, useRef } from "react";
import WebApp from '@twa-dev/sdk';
import AuthContext from "./context/auth.context";
import useAuth from "./hooks/auth.hook";
import App from "./App";
import useHttp from "./hooks/http.hook";


function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <svg width="56" height="56" viewBox="0 0 50 50" aria-label="Loading" role="status">
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="#4a5568"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="31.415, 31.415"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
            </svg>
        </div>
    );
}

function Main() {
    const { token, login, logout } = useAuth();
    const isAuthenticated = !!token;
    
    const { request } = useHttp();
    const didAuthRequest = useRef(false);

    useEffect(() => {
        if (didAuthRequest.current) return;
        didAuthRequest.current = true;
        const initDataRaw = window.Telegram.WebApp.initData; // "user=%7B%22id%22%3A5218704864%2C%22first_name%22%3A%22Omurzak%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22omiiaow%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F1kf_OO8kFE5uCDdEsXnPZDp3EcFCwcxqT5wn-f2jO7v_pu8xH167Ya2uqgfFwxZN.svg%22%7D&chat_instance=6479956538417833485&chat_type=sender&auth_date=1763273908&signature=L5LjW8IA89bwjbBPterMBA85PNEAU3i_IhDx8wQvCEhNr4-CP2V3uHlJfb6oaTwl43np76MNjQ9kzHrSRWS4Ag&hash=c0abcdc3adbb3b238303a17fa5d01fc3a8f54ebec12a4ea70aa64629e11ee57e"
        const fetchAuth = async () => {
            try {
                const response = await request("/app/auth", "POST", { initDataRaw });
                if (!response.error) {
                    login(response.token);
                }
            } catch (_) {
                // Single-attempt only; ignore errors to avoid retry loops
            }
        }
        if (!isAuthenticated) {
            fetchAuth();
        }
    }, [isAuthenticated, login, request]);

    useEffect(() => {
        WebApp.ready();
        WebApp.expand();
        WebApp.disableVerticalSwipes();
        WebApp.enableClosingConfirmation();
        WebApp.requestFullscreen();
        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', '#000000');
    }, []);


    let app;
    if (isAuthenticated) {
        app = (
            <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
                <App />
            </AuthContext.Provider>
        );
    } else {
        app = <Spinner />;
    }

    return <div className="app">{app}</div>;
}

export default Main;