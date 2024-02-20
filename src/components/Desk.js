import Column from './Column';

export default class Desk {
  constructor(parentElement) {
    this.parentElement = parentElement;

    this.columns = [
      new Column('To Do'),
      new Column('In Progress'),
      new Column('Done'),
      new Column('Maybe Done'),
    ];

    this.onCardMoved = this.onCardMoved.bind(this);
  }

  onCardMoved(e) {
    this.updateLocalStorage(e.detail.elFrom);
    this.updateLocalStorage(e.detail.elTo);
  }

  updateLocalStorage(columnEl) {
    const name = columnEl.querySelector('h2').textContent;
    const column = this.columns.find((el) => el.name === name);
    column.cards = [];

    const cardsEl = columnEl.querySelectorAll('.card');
    if (!cardsEl.length) {
      window.localStorage.removeItem(name);
    } else {
      cardsEl.forEach((el) => {
        column.cards.push({
          id: el.dataset.id,
          content: el.textContent,
        });
      });

      Column.setToLocal(name, column.cards);
      column.renderCardList();
    }
  }

  init() {
    this.createDesk();
    document.addEventListener('cardMoved', this.onCardMoved);
  }

  createDesk() {
    this.element = document.createElement('div');
    this.element.classList.add('desk');

    this.columns.forEach((el) => this.element.append(el.init()));

    this.parentElement.append(this.element);
  }
}
