var bookmarksOld = [];
var bookmarksNew = [];

async function initializeBookmarks() {
    if(bookmarksOld == []) {
        resultOld = await browser.storage.local.get("bookmarks");
        bookmarksOld = (resultOld && resultOld.bookmarks && resultOld.bookmarks.length > 0) ? JSON.parse(resultOld.bookmarks) : [];    
    }
    bookmarksNew = [];
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
        let bookmarkItem = bookmarksOld.filter((b) => b.url.toLowerCase().includes(bookmark.url.toLowerCase()));
        if(bookmarkItem && bookmarkItem.favicon) {
            bookmark.favicon = bookmarkItem.favicon;
        } else {
            await getFavicon(bookmark);
        }   
        bookmarksNew.push(bookmark);
        await browser.storage.local.set({ "bookmarks": bookmarksNew}).catch((er) => { console.log(er); });
      }
    });
}


  
async function getFavicon(bookmark) {
    fetch("https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + bookmark.url + "&size=50", {
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
    })
}

browser.runtime.onInstalled.addListener(initializeBookmarks);
browser.bookmarks.onMoved.addListener(initializeBookmarks);
browser.bookmarks.onCreated.addListener(initializeBookmarks);
browser.bookmarks.onChanged.addListener(initializeBookmarks);
browser.bookmarks.onRemoved.addListener(initializeBookmarks);

