browser.runtime.onInstalled.addListener(() => {

    const bookmarkData = JSON.stringify(bookmarks);
    
// Save to local storage
    browser.storage.local.set({ bookmarks: bookmarkData })
            .then(() => {
                console.log("Bookmarks saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving bookmarks: ", error);
            });
    }).catch((error) => {
        console.error("Error retrieving bookmarks: ", error);
    });

});