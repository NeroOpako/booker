const bookmarksList = document.getElementById('favorites-container');
const searchBox = document.getElementById('search-bar-input');
var objectUrls = [];

searchBox.addEventListener("change", (event) => {
  searchBookmarks(event.target.value);
});

function renderBookmarks() {
  browser.storage.local.get("bookmarks").then((result) => {
    if(result && result.bookmarks && result.bookmarks.length > 0) {
      let bookmarks = JSON.parse(result.bookmarks);
      for (const item of bookmarks) {
        const bookmarkElement = createBookmarkElement(item);
        bookmarksList.appendChild(bookmarkElement);
      }
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
  bookmarkDiv.className = 'favorites-item';
  bookmarkDiv.href = "#";
  bookmarkDiv.onclick = () => {searchBox.value = ''; searchBookmarks(''); return false; };
  // Create an image element for the favicon
  const faviconImg = document.createElement('img');
  faviconImg.src = "images/icons8-clear-50.png"; // Use a default icon if favicon is not available
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
  objectUrls.forEach((el) => URL.revokeObjectURL(el));
  objectUrls = [];
  bookmarksList.replaceChildren();
  if(query && query.length > 0) {
    bookmarksList.appendChild(createClearSearchElement());
    browser.storage.local.get("bookmarks").then((result) => {
      if(result && result.bookmarks && result.bookmarks.length > 0) {
        let bookmarks = JSON.parse(result.bookmarks);
        let bookmarkItems = bookmarks.filter((bookmark) => bookmark.name.toLowerCase().includes(query.toLowerCase()) || bookmark.url.toLowerCase().includes(query.toLowerCase()));
        for (const item of bookmarkItems) {
          const bookmarkElement = createBookmarkElement(item);
          bookmarksList.appendChild(bookmarkElement);
        }
      }
    });
  } else {
    renderBookmarks();
  }
}

renderBookmarks();

