export function handle() {
    window.onload = function() {
        const gameID = document.location.pathname.split("/")[2];
        fetch(`/game/${gameID}/checkCurrentPlayer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              
            }),
        });
    }

}

