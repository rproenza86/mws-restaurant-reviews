const snackbar = new window.mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));
const notifyAppOffline = () => {
    const notificationObject = {
        message: 'Application working OFFLINE',
        actionText: 'Ok',
        actionHandler: function () {
            console.log('my cool function');
        },
        timeout: 5000
    };

    snackbar.show(notificationObject);
};
const notifyAppOnline = () => {
    const notificationObject = {
        message: 'Application working ONLINE',
        actionText: 'Ok',
        actionHandler: function () {
            console.log('my cool function');
        },
        timeout: 5000
    };

    snackbar.show(notificationObject);
};

window.addEventListener('online', event => {
    notifyAppOnline();
    DBHelper.processReviewQueue();
});

window.addEventListener('offline', event => notifyAppOffline());