/* ╔════════════════════════════════╗
   ║ Modal Folder Path Adder        ║
   ╚════════════════════════════════╝
*/

// Elements
const addButton = document.querySelector(".modal__settings .modal-content #folders .folders__header .button__add");
const foldersList = document.querySelector(".modal__settings .modal-content #folders .folders__list");

// Variables
let folders = [];

// Check folders on launch
function checkOnRestart() {
   if (localStorage.getItem("settings_folders")) {

      folders = JSON.parse(localStorage.getItem("settings_folders"));

      foldersList.innerHTML = '';
      folders.forEach(folder => {
         addFolder(folder)
      });
   }
}
checkOnRestart()

// Add button on click event
addButton.addEventListener("click", async () => {
   const folder = await window.modules.selectFolder();
   console.log(`[Add Folder] Folder selected: ${folder}`);

   folders.push(folder);
   addFolder(folder);

   localStorage.setItem("settings_folders", JSON.stringify(folders));
});

// Add folder Logic
function addFolder(folder) {

   let folderItem = document.createElement("li");

   folderItem.classList.add("collection-item");
   folderItem.innerHTML = `<p>${folder}</p><a class="header__button button__delete waves-effect waves-dark grey-text text-darken-2"><i class="material-icons">delete</i></a>`;

   foldersList.appendChild(folderItem);

   // Delete logic
   folderItem.querySelector(".button__delete").addEventListener("click", () => {
      folders.splice(folders.indexOf(folder), 1);
      folderItem.remove();
      localStorage.removeItem("settings_folders");
      localStorage.setItem("settings_folders", JSON.stringify(folders));
   });
}