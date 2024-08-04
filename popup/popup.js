const importButton = document.getElementById("import");
const exportButton = document.getElementById("export");
const clearButton = document.getElementById("clear");

importButton.addEventListener("click", () => {
  var input = document.createElement('input');
  input.type = 'file';
  input.onchange = e => { 
    var file = e.target.files[0]; 
    var reader = new FileReader();
    reader.onload = function(event) {
      var text = event.target.result;
      const obj = JSON.parse(text);
      if(obj.tabs && obj.tabs.length > 0) {
        obj.tabs.forEach(async (tabItemNew) => { 
         chrome.tabs.create({active: tabItemNew.active, index: tabItemNew.index, pinned: tabItemNew.pinned, url: tabItemNew.url}); 
        });
      }
    };
    reader.readAsText(file);
  }
  input.click();
});

exportButton.addEventListener("click", (event) => {
  chrome.tabs.query({},
    function(resultTabs) {
      var blob = new Blob(["{ \"tabs\": " + JSON.stringify(resultTabs) + "}"], {type: "text/plain"});
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "browsermanager_export.json";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  );
});