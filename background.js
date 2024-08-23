async function initializeBookmarks() {
    browser.bookmarks.getTree().then((bookmarks) => {
        bookmarks.forEach((folder) => {
            if (folder.children) {
                processBookmarks(bookmarks);
            }
        });
    });
}

async function processBookmarks(bookmarks) {
    bookmarks.forEach(async (bookmark) => {
      if (bookmark.children) {
        // If the bookmark is a folder, recursively process its children
        processBookmarks(bookmark.children);
      } else if (bookmark.url) {
        // If the bookmark is a link, log its title and URL
        let favicon = await getFavicon(bookmark.url);
        await browser.storage.local.set({ [bookmark.id] : favicon}).catch((er) => { console.log(er); });
      }
    });
}

async function getFavicon(url) {
    fetch("https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + url + "&size=64", {
        method: "GET",
        mode: "cors",
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        const reader = new FileReader();
        reader.onloadend = function() {
            // The result is a Data URL
            return reader.result;
        };
        reader.readAsDataURL(blob);
    })
    .catch((er) => {
        console.log(er);
    })
}

browser.runtime.onInstalled.addListener(initializeBookmarks);

browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
    let favicon = await getFavicon(bookmark.url);
    browser.storage.local.set([id],favicon).catch((er) => { console.log(er); });
});

browser.bookmarks.onChanged.addListener(async (id, changeInfo) => {
    if(changeInfo.url) {
        let favicon = await getFavicon(changeInfo.url);
        browser.storage.local.set([id],favicon).catch((er) => { console.log(er); });
    }
});

browser.bookmarks.onRemoved.addListener((id) => {
    browser.storage.local.remove([id]).catch((er) => { console.log(er); });
});

