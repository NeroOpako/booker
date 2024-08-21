var bookmarksLocal = [];

async function initializeBookmarks() {
    bookmarksLocal = [];
    let resultOld = await browser.storage.local.get("bookmarks");
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
                if(resultOld && resultOld.bookmarks && resultOld.bookmarks.length > 0) {
                    let bookmarksOld = JSON.parse(resultOld.bookmarks);
                    let bookmarkItem = bookmarksOld.filter((b) => b.url.toLowerCase().includes(bookmark.url.toLowerCase()));
                    bookmark.favicon = bookmarkItem.favicon;
                } else {
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
            }
        });
        // Save to local storage
        Promise.all(promises).then(() => browser.storage.local.set({ "bookmarks":  JSON.stringify(bookmarksLocal)}).catch((er) => { console.log(er); }));
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

browser.runtime.onInstalled.addListener(initializeBookmarks);
browser.bookmarks.onMoved.addListener(initializeBookmarks);
browser.bookmarks.onCreated.addListener(initializeBookmarks);
browser.bookmarks.onChanged.addListener(initializeBookmarks);
browser.bookmarks.onRemoved.addListener(initializeBookmarks);

