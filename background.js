function initializeBookmarks() {
    browser.bookmarks.getTree().then((bookmarks) => {
        bookmarks.forEach((folder) => {
            if (folder.children) {
                processBookmarks(bookmarks);
            }
        });
    });
}

 function processBookmarks(bookmarks) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        processBookmarks(bookmark.children);
      } else if (bookmark.url) {
        getFavicon(bookmark.url).then(dataURL => {
            browser.storage.local.set({ [bookmark.id] : dataURL}).catch((er) => { console.log(er); })
        });
      }
    });
}

function getFavicon(url) {
    return fetch("https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + url + "&size=64", {
        method: "GET",
        mode: "cors",
    })
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

browser.runtime.onInstalled.addListener(initializeBookmarks);

browser.bookmarks.onCreated.addListener((id, bookmark) => {
    getFavicon(bookmark.url).then(dataURL => {
        browser.storage.local.set({ [id] : dataURL}).catch((er) => { console.log(er); })
    });
});

browser.bookmarks.onChanged.addListener((id, changeInfo) => {
    if(changeInfo.url) {
        getFavicon(changeInfo.url).then(dataURL => {
            browser.storage.local.set({ [id] : dataURL}).catch((er) => { console.log(er); })
        });
    }
});

browser.bookmarks.onRemoved.addListener((id) => {
    browser.storage.local.remove([id]).catch((er) => { console.log(er); });
});

