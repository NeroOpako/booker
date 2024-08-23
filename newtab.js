const bookmarksList = document.getElementById('favorites-container');
const searchBox = document.getElementById('search-bar-input');

searchBox.addEventListener('input', (event) => {
  searchBookmarks(event.target.value);
});

function renderBookmarks() {
  browser.bookmarks.getTree().then((bookmarks) => {
    bookmarks.forEach((folder) => {
        if (folder.children) {
            processBookmarks(bookmarks);
        }
    });
  });
}

async function processBookmarks(bookmarks) {
  bookmarks.forEach((bookmark) => {
    if (bookmark.children) {
      // If the bookmark is a folder, recursively process its children
      processBookmarks(bookmark.children);
    } else if (bookmark.url && bookmark.parentId == 'toolbar_____') {
      // If the bookmark is a link, log its title and URL
      browser.storage.local.get(bookmark.id).then((b) => {
        bookmark.favicon = b[bookmark.id];  
        const bookmarkElement = createBookmarkElement(bookmark);
        bookmarksList.appendChild(bookmarkElement);
      });
     
    }
  });
}

function createBookmarkElement(bookmark) {
  // Create a div element to hold the bookmark information
  const bookmarkDiv = document.createElement('a');
  bookmarkDiv.className = 'favorites-item';
  bookmarkDiv.href=bookmark.url;
  // Create an image element for the favicon
  if(bookmark.favicon) {
    const faviconImg = document.createElement('img');
    faviconImg.src = bookmark.favicon;
    faviconImg.alt = `${bookmark.title} favicon`;
    bookmarkDiv.appendChild(faviconImg);
  } else {
    const h1Elem = document.createElement('h1');
    h1Elem.textContent = bookmark.title.substring(0,1);
    bookmarkDiv.appendChild(h1Elem);
  }

  // Create a span element for the bookmark title
  const titleSpan = document.createElement('span');
  titleSpan.textContent = bookmark.title;

  // Append the favicon and title to the bookmark div

  bookmarkDiv.appendChild(titleSpan);

  return bookmarkDiv;
}

function createClearSearchElement() {
  // Create a div element to hold the bookmark information
  const bookmarkDiv = document.createElement('a');
  bookmarkDiv.className = 'favorites-item clear';
  bookmarkDiv.href = "#";
  bookmarkDiv.onclick = () => {searchBox.value = ''; searchBookmarks(''); return false; };
  // Create an image element for the favicon
  const faviconImg = document.createElement('img');
  faviconImg.alt = `Pulisci ricerca favicon`;
  bookmarkDiv.appendChild(faviconImg);

  // Create a span element for the bookmark title
  const titleSpan = document.createElement('span');
  titleSpan.textContent = "Pulisci ricerca";

  // Append the favicon and title to the bookmark div

  bookmarkDiv.appendChild(titleSpan);

  return bookmarkDiv;
}

function searchBookmarks(query) {
  bookmarksList.replaceChildren();
  if(query && query.length > 0) {
    bookmarksList.appendChild(createClearSearchElement());
    browser.bookmarks.search(query).then((bookmarks) => {
      processBookmarks(bookmarks);
    });
  } else {
    renderBookmarks();
  }
}

renderBookmarks();

