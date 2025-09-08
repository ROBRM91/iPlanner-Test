if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker registrado con éxito:', registration.scope);
        }, function(err) {
            console.log('Fallo el registro del Service Worker:', err);
        });
    });
}