import AuthContext from "./context/auth.context";
import useAuth from "./hooks/auth.hook";
import App from "./App";
import WebApp from '@twa-dev/sdk';
import useHttp from "./hooks/http.hook";


function Main() {
    const { token, login, logout } = useAuth();
    const isAuthenticated = !!token;
    const routes = useRoutes(isAuthenticated);

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
            { routes }
        </AuthContext.Provider>
    );
}

const useRoutes = isAuthenticated => {
    const { request } = useHttp();    
    
    if (isAuthenticated) {
        return (
            <App />
        );
    } else {
        const initDataRaw = WebApp.initDataUnsafe;
        console.log(initDataRaw);

        return (
            <div>
                <h1>Main</h1>
                <div>{JSON.stringify(initDataRaw)}</div>
            </div>
        );
    }
}

export default Main;