const bookmarksList = document.getElementById('favorites-container');
const searchBox = document.getElementById('search-bar-input');
const modal = document.getElementById("myModal");

const titleinput = document.getElementById("titleinput");
const urlinput = document.getElementById("urlinput");
const savebtn = document.getElementById("savebtn");
const deletebtn = document.getElementById("deletebtn");
const closebtn = document.getElementById("closebtn");


var indexEdited = ""; 



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
  bookmarkDiv.dataset.index = bookmark.id;
  bookmarkDiv.dataset.title = bookmark.title;
  bookmarkDiv.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.style.display = "block";
    indexEdited = e.target.nodeName != 'A' ? e.target.parentNode.dataset.index : e.target.dataset.index;
    titleinput.value = e.target.nodeName != 'A' ? e.target.parentNode.dataset.title : e.target.dataset.title;
    urlinput.value = e.target.nodeName != 'A' ? e.target.parentNode.href : e.target.href;
  };
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
  titleSpan.oncontextmenu = (e) => {
    e.preventDefault(); 
  };
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


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    resetAfterEdit(true);
  }
}

closebtn.onclick = function() {
  resetAfterEdit(true);
}

savebtn.onclick = function() {
  browser.bookmarks.update(indexEdited, {title: titleinput.value , url: urlinput.value }).finally(() => {
    getFavicon(urlinput.value).then(dataURL => browser.storage.local.set({ [indexEdited] : dataURL}).catch((er) => { console.log(er); }).finally(resetAfterEdit)); 
  });
}

deletebtn.onclick = function() {
  browser.bookmarks.remove(indexEdited).finally(resetAfterEdit);
}

renderBookmarks();

function resetAfterEdit(dontReplaceChildren) {
  modal.classList.add("fadeout");
  indexEdited = "";
  setTimeout(() => {
    modal.style.display = "none";
    modal.classList.remove("fadeout");
    titleinput.value = "";
    urlinput.value = "";
  }, 150);
  if(!dontReplaceChildren) {
    bookmarksList.replaceChildren();
    renderBookmarks();
  }
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
