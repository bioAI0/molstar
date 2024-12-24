window.onload = function() {
        
    var inputField =
        document.querySelector('input[type="text"]');

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey) {
            if (event.key === 'PageDown' ||
                event.key === 'PageUp') {
                return;
            }
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            inputField.focus();
        } else if (event.key === 'Home') {
            event.preventDefault();
            window.scrollTo(0, 0);
        } else if (event.key === 'End') {
            event.preventDefault();
            window.scrollTo(0, document.body.scrollHeight);
        } else if (event.key === 'PageDown') {
            event.preventDefault();
            window.scrollBy(0, window.innerHeight);
        } else if (event.key === 'PageUp') {
            event.preventDefault();
            window.scrollBy(0, -window.innerHeight);
        }
    });
};
