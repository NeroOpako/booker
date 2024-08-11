const bookmarksList = document.getElementById('favorites-container');

browser.bookmarks.getTree().then((bookmarks) => {
  bookmarks.forEach((folder) => {
    if (folder.children) {
      processBookmarks(bookmarks);
    }
  });
});

function processBookmarks(bookmarks) {
  bookmarks.forEach((bookmark) => {
    if (bookmark.children) {
      // If the bookmark is a folder, recursively process its children
      processBookmarks(bookmark.children);
    } else if (bookmark.url) {
      // If the bookmark is a link, log its title and URL
      const bookmarkElement = createBookmarkElement(bookmark);
      bookmarksList.appendChild(bookmarkElement);
    }
  });
}

function createBookmarkElement(bookmark) {
  // Create a div element to hold the bookmark information
  const bookmarkDiv = document.createElement('a');
  bookmarkDiv.className = 'favorites-item';
  bookmarkDiv.href=bookmark.url;
  // Create an image element for the favicon
  const faviconImg = document.createElement('img');
  faviconImg.src = "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + bookmark.url + "&size=50"; // Use a default icon if favicon is not available
  faviconImg.alt = `${bookmark.title} favicon`;
  bookmarkDiv.appendChild(faviconImg);

  // Create a span element for the bookmark title
  const titleSpan = document.createElement('span');
  titleSpan.textContent = bookmark.title;

  // Append the favicon and title to the bookmark div

  bookmarkDiv.appendChild(titleSpan);

  return bookmarkDiv;
}


