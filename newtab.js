const bookmarksList = document.getElementById('favorites-container');
const searchBox = document.getElementById('search-bar-input');
var objectUrls = [];

searchBox.addEventListener("change", (event) => {
  searchBookmarks(event.target.value);
});

function renderBookmarks() {
  browser.storage.local.get("bookmarks").then((bookmarks) => {
    for (const item of bookmarks) {
      const bookmarkElement = createBookmarkElement(item);
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
  var imageUrl = URL.createObjectURL(bookmark.favicon);
  objectUrls.push(imageUrl);
  document.querySelector("#image").src = imageUrl;
  faviconImg.alt = `${bookmark.title} favicon`;
  bookmarkDiv.appendChild(faviconImg);

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
  bookmarkDiv.onclick="searchBox.value = ''; searchBookmarks(''); return false;";
  // Create an image element for the favicon
  const faviconImg = document.createElement('img');
  faviconImg.src = "images/icons8-clear-50.png"; // Use a default icon if favicon is not available
  faviconImg.alt = `Clear search favicon`;
  bookmarkDiv.appendChild(faviconImg);

  // Create a span element for the bookmark title
  const titleSpan = document.createElement('span');
  titleSpan.textContent = "Clear search";

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
    browser.storage.local.get("bookmarks").then((bookmarks) => {
      let bookmarkItems = bookmarks.filter((bookmark) => bookmark.name.toLowerCase().includes(query.toLowerCase()) || bookmark.url.toLowerCase().includes(query.toLowerCase()));
      for (const item of bookmarkItems) {
        const bookmarkElement = createBookmarkElement(item);
        bookmarksList.appendChild(bookmarkElement);
      }
    });
  } else {
    renderBookmarks();
  }
}

renderBookmarks();

