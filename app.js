(function () {

  const myLibrary = [];
  let idNum = 1;

  window.onload = (event) => {
    if (localStorage.getItem('library') !== null) {
      idNum = JSON.parse(localStorage.getItem('idNum'));
      let tempLib = JSON.parse(localStorage.getItem('library'));
      tempLib.forEach(book => {
        book.__proto__ = new Book()
        myLibrary.push(book);
        createBookCard(book);
      });
    }
  }

  function Book(title, author, numPages, idNum) {
    this._title = title
    this._author = author
    this._pages = numPages
    this._hasRead = false
    this._id = `a${idNum}`
  }

  Book.prototype.info = function () {
    return [`"${this._title}"`, this._author, `${this._pages} pages`];
  }

  Book.prototype.getId = function () {
    return this._id;
  }

  Book.prototype.getHasRead = function () {
    return this._hasRead;
  }

  Book.prototype.setHasRead = function () {
    if (!this._hasRead) {
      this._hasRead = true;
    } else {
      this._hasRead = false;
    }
  }

  function addBookToLibrary([title, author, numPages]) {
    // Take user input, use to create new book object, store book in array
    const book = new Book(title, author, numPages, idNum);
    myLibrary.push(book);
    idNum++;
    addLibraryToLocalStorage();
    createBookCard(book);
  }

  function addLibraryToLocalStorage() {
    localStorage.setItem('library', JSON.stringify(myLibrary));
    localStorage.setItem('idNum', idNum);
  }

  function createBookCard(book) {
    let card = document.createElement('div');
    card.classList.add("card");
    let container = document.getElementById('book-container').appendChild(card);
    let data = book.info();

    function makeDocFrag(tagString) {
      let range = document.createRange();
      return range.createContextualFragment(tagString);
    }

    data.forEach(e => {
      container.appendChild(makeDocFrag(`<p class="card-text">${e}</p>`));
    });

    function makeRoundedSwitch() {
      container.appendChild(makeDocFrag(
        `<label class="switch">
          <input id="${book.getId()}" type="checkbox">
          <span class="slider round"></span>
      </label>`));
      let checkbox = document.getElementById(book.getId());
      checkbox.checked = book._hasRead;
      checkbox.addEventListener('change', e => {
        book.setHasRead();
        addLibraryToLocalStorage();
      })
    }
    makeRoundedSwitch();

    function makeRemoveButton() {
      container.appendChild(makeDocFrag(
        `<button type="button" class="remove-button">Remove</button>`
      ));
      let removeButton = container.lastChild;

      removeButton.addEventListener('click', e => {
        container.remove();
        let indexToRemove = myLibrary.findIndex(e => e._id == book.getId());
        myLibrary.splice(indexToRemove, 1);
        addLibraryToLocalStorage();
      })
    }
    makeRemoveButton();

  }

  function createFormEvents() {
    const myForm = document.getElementById('myForm');
    const addBookButton = document.getElementById('add-book');
    const popup = document.querySelector('.form-popup');
    const cancel = document.querySelector('.btn-cancel');

    addBookButton.addEventListener('click', (e) => {
      popup.style.display = 'flex';
      e.target.style.display = 'none';
    });

    cancel.addEventListener('click', () =>{
       popup.style.display = 'none';
       addBookButton.style.display ='inline-block';
      });

    myForm.addEventListener("submit", e => {
      e.preventDefault();
      new FormData(myForm);
      popup.style.display = 'none';
      addBookButton.style.display ='inline-block';
    });

    myForm.addEventListener('formdata', e => {
      console.log('formdata fired');
      let data = e.formData;
      let dataArr = [];

      for (var value of data.values()) {
        dataArr.push(value);
      }

      addBookToLibrary(dataArr);
      myForm.reset();
    });

  }

  function localStorageLinkEvents() {
    const storageLink = document.getElementById('local-storage');
    const clearPopup = document.getElementById('clear-popup');
    const yesBtn = document.getElementById('clear-yes');
    const cancelBtn = document.getElementById('clear-cancel');
    
    storageLink.addEventListener('click', () => {
      clearPopup.style.display = 'block';
    });
    yesBtn.addEventListener('click', () => {
      localStorage.clear();
      location.reload();
    });
    cancelBtn.addEventListener('click', () => {
      clearPopup.style.display = 'none';
    });
  }

  localStorageLinkEvents();
  createFormEvents();

})();
