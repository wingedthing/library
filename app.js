const myLibrary = [];

function Book(title, author, numPages, hasRead) {
  //constructor
  this.title = title
  this.author = author
  this.pages = numPages
  this.hasRead = hasRead
}

Book.prototype.info = function() {
  return `${this.title} by ${this.author}, ${this.pages} pages, Has read:${this.hasRead}`
}

function addBookToLibrary(title, author, numPages, hasRead) {
  /*take user input, use to create new book object, 
  * store book in array*/ 
  const book = new Book(title, author, numPages, hasRead);
  myLibrary.push(book);
}

addBookToLibrary('The Hobbit', 'J.R.R Tolkien', 295, false);
addBookToLibrary('The Castle', 'Franz Kafka', 300, true);
console.table(myLibrary);
console.log(myLibrary);