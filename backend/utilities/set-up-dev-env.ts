import livereload from "livereload";
import path from "path";

export const setUpDevEnv = () => {
    if (process.env.NODE_ENV != "development") {
        return;
    }

    const reloadServer = livereload.createServer();
    reloadServer.watch(path.join("backend", "static"));
    reloadServer.server.once("connection", () => {
        setTimeout(() => {
            reloadServer.refresh("/");
        }, 100);
    });
};

