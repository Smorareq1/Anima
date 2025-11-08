export const route = (name) => {
    const routes = {
        "auth.login.show": "/login",
        "auth.register.show": "/register",
    };
    return routes[name] || "/";
};
