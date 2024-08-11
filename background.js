var bookmarksLocal = [];

function initializeBookmarks() {
    bookmarksLocal = [];
    browser.bookmarks.getTree().then((bookmarks) => {
        bookmarks.forEach((folder) => {
            if (folder.children) {
                processBookmarks(bookmarks);
            }
        });

        // Convert bookmarks to a format suitable for storage
        var promises = [];

        bookmarksLocal.forEach(bookmark => {
            if(!bookmark.favicon) {
                promises.push(fetch("https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + bookmark.url + "&size=50", {
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
                        const dataUrl = reader.result;
                        bookmark.favicon = dataUrl;
                    };
                    reader.readAsDataURL(blob);
                })
                .catch((er) => {
                    console.log(er);
                }));
            }
        });
        // Save to local storage
        Promise.all(promises).then(() => browser.storage.local.set({ "bookmarks": bookmarksLocal }));
    });
}

  
function processBookmarks(bookmarks) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        // If the bookmark is a folder, recursively process its children
        processBookmarks(bookmark.children);
      } else if (bookmark.url) {
        // If the bookmark is a link, log its title and URL
        bookmarksLocal.push(bookmark);
      }
    });
  }
  

browser.runtime.onInstalled.addListener(initializeBookmarks());
browser.bookmarks.onMoved.addListener(initializeBookmarks());
browser.bookmarks.onCreated.addListener(initializeBookmarks());

browser.bookmarks.onChanged.addListener((id, changeInfo) => {
    browser.storage.local.get("bookmarks").then((bookmarks) => {
        let bookmark = bookmarks.find((el) => el.id == id);
        var promises = [];
        if(changeInfo.url) {
            bookmark.url = changeInfo.url;
            promises.push(fetch("https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + bookmark.url + "&size=50", {
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
                    const dataUrl = reader.result;
                    bookmark.favicon = dataUrl;
                };
                reader.readAsDataURL(blob);
            })
            .catch((er) => {
                console.log(er);
            }));
        }
        if(changeInfo.title) {
            bookmark.title = changeInfo.title;
        }
        Promise.all(promises).then(() => browser.storage.local.set({ "bookmarks": bookmarks }));
    });
});

browser.bookmarks.onRemoved.addListener((id) => {
    browser.storage.local.get("bookmarks").then((bookmarks) => {
        bookmarks.splice(bookmarks.indexOf(bookmarks.findIndex(bookmark => bookmark.id == id)), 1);
        browser.storage.local.set({ "bookmarks": bookmarks });
    });
});

