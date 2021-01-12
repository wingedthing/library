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

  function Book(title, author, idNum) {
    this._title = title
    this._author = author
    this._hasRead = false
    this._id = `a${idNum}`
    this._googleBooksData;
  }

  Book.prototype.info = function () {
    return [`"${this._title}"`, this._author];
  }

  Book.prototype.getId = function () {
    return this._id;
  }

  Book.prototype.getHasRead = function () {
    return this._hasRead;
  }

  Book.prototype.setHasRead = function () {
    if (!this._hasRead) {
      return this._hasRead = true;
    } else {
      return this._hasRead = false;
    }
  }

  Book.prototype.setGoogleData = function(dataObj) {
    this._googleBooksData = dataObj;
  }

  Book.prototype.getGoogleData = function() {
    if(this._googleBooksData){
      return this._googleBooksData
    }else {
      return false;
    }
  }

  Book.prototype.getBuyLink = function() {
    if(this.getGoogleData() && this._googleBooksData.items[0].saleInfo.buyLink){
      return this._googleBooksData.items[0].saleInfo.buyLink;
    }else {
      let title = this._title.replace(/\s+/g, '+');
      let author = this._author.split(' ').pop();
      return `https://www.google.com/search?tbm=bks&q=${title}+${author}`;
    }
  }

  function bookSearch(book, cardImg, defaultText, btnContainer) {
    let title = book._title.replace(/\s+/g, '+');
    let author = book._author.split(' ').pop();
    let googleBookId;

    $.ajax({
      type: 'GET',
      url: "https://www.googleapis.com/books/v1/volumes?q=" + title + "+inauthor:" + author,
      dataType: "json",

      success: function (data) {
        if (!data.items) {
          cardImg.style.cssText = `background-image: url(./images/redBook.jpg)`;
          defaultText.style.display = "flex";
          btnContainer.appendChild(makeDocFrag(`<a href=${book.getBuyLink()} target="_blank" class="buy-button">Buy</a>`));
          return
        } else {
          googleBookId = data.items[0].id;
          book.setGoogleData(data);
          btnContainer.appendChild(makeDocFrag(`<a href=${book.getBuyLink()} target="_blank" class="buy-button">Buy</a>`));
          console.log(book);
        }

        if (data.items[0].volumeInfo.imageLinks && data.items[0].volumeInfo.title == book._title) {
          cardImg.style.cssText = `background-image: url(https://books.google.com/books/content/images/frontcover/${googleBookId}?fife=w400-h600);`;
        } else {
          cardImg.style.cssText = `background-image: url(./images/redBook.jpg)`;
          defaultText.style.display = "flex";
        }

        console.log(data);
      },

      error: function (xhr, error) {
        console.log(xhr); console.log(error);
      }

    });

  }

  function makeDocFrag(tagString) {
    let range = document.createRange();
    return range.createContextualFragment(tagString);
  }

  function addBookToLibrary([title, author]) {
    const book = new Book(title, author, idNum);
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
    let data = book.info();
    let card = document.createElement('div');
    card.classList.add("card");
    let cardImg = document.createElement('div');
    cardImg.classList.add("card-img");
    let defaultText = document.createElement('div');
    defaultText.classList.add("default-text");
    data.forEach(e => {
      defaultText.appendChild(makeDocFrag(`<p>${e}</p>`));
    });
    cardImg.appendChild(defaultText);
    card.appendChild(cardImg);
    let dropDown = document.createElement('div');
    dropDown.classList.add('card-drop-down');
    let container = document.getElementById('book-container').appendChild(card).appendChild(dropDown);

    data.forEach(e => {
      container.appendChild(makeDocFrag(`<p class="card-text">${e}</p>`));
    });

    function makeRoundedSwitch() {
      container.appendChild(makeDocFrag(
        `<div class="switch-container">
          <label class="switch">
            <input id="${book.getId()}" type="checkbox">
            <span class="slider round"></span>
          </label>
          <span id="hasRead-${book.getId()}"></span>
        </div>`));
      let checkbox = document.getElementById(book.getId());
      let readText = document.getElementById('hasRead-' + book.getId());
      (book._hasRead) ? readText.classList.toggle('read') : readText.classList.toggle('unread');
      checkbox.checked = book._hasRead;
      checkbox.addEventListener('change', e => {
        book.setHasRead()
        readText.classList.toggle('read');
        readText.classList.toggle('unread');
        addLibraryToLocalStorage();
      })
    }
    makeRoundedSwitch();

    let btnContainer = document.createElement('div');
    btnContainer.classList.add('btn-container');
    container.appendChild(btnContainer);

    function makeRemoveButton() {
      btnContainer.appendChild(makeDocFrag(
        `<button id="remove${book.getId()}" type="button" class="remove-button">Remove</button>`
      ));
      let removeButton = document.getElementById(`remove${book.getId()}`);

      removeButton.addEventListener('click', e => {
        card.remove();
        let indexToRemove = myLibrary.findIndex(e => e._id == book.getId());
        myLibrary.splice(indexToRemove, 1);
        addLibraryToLocalStorage();
      })
    }

    makeRemoveButton();
    
    card.appendChild(makeDocFrag(`
    <div id="arrow${book.getId()}" class="arrow-container">
    <i class="fas fa-chevron-down"></i>
    </div>`));

    let trigger = document.getElementById(`arrow${book.getId()}`)
    let n = 180;
    trigger.addEventListener('click', (e) => {
      e.target.style.cssText = `transform: rotate(${n}deg);`;
      n -= 180;
      dropDown.classList.toggle("card-drop-up");
    })

    bookSearch(book, cardImg, defaultText, btnContainer);
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

    cancel.addEventListener('click', () => {
      popup.style.display = 'none';
      addBookButton.style.display = 'inline-block';
    });

    myForm.addEventListener("submit", e => {
      e.preventDefault();
      const title = e.target[0].value;
      const author = e.target[1].value;
      popup.style.display = 'none';
      addBookButton.style.display = 'inline-block';
      addBookToLibrary([title, author]);
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
