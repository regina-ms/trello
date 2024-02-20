/* eslint-disable import/no-extraneous-dependencies */
import { nanoid } from 'nanoid';

export default class Column {
  constructor(name) {
    this.name = name;

    this.onAddCardFormBtnClick = this.onAddCardFormBtnClick.bind(this);
    this.onCloseFormBtnClick = this.onCloseFormBtnClick.bind(this);
    this.onSubmitCardForm = this.onSubmitCardForm.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.showDltBtn = this.showDltBtn.bind(this);
    this.hideDltBtn = this.hideDltBtn.bind(this);
    this.onDltBtnCLick = this.onDltBtnCLick.bind(this);
  }

  renderCardList() {
    this.cards = Column.getFromLocal(this.name) || [];

    let html = '';
    this.cards.forEach((card) => {
      html += `<div class="card" data-id="${card.id}">${card.content}</div>`;
    });
    this.cardList.innerHTML = html;

    this.cardList.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('mousedown', this.onMouseDown);
      el.addEventListener('mouseenter', this.showDltBtn);
      el.addEventListener('mouseleave', this.hideDltBtn);
    });
  }

  onDltBtnCLick(e) {
    const idToDelete = e.target.closest('.card').dataset.id;

    const itemIndexToDelete = this.cards.findIndex((el) => el.id === idToDelete);
    this.cards.splice(itemIndexToDelete, 1);

    Column.setToLocal(this.name, this.cards);

    this.renderCardList();
  }

  hideDltBtn(e) {
    this.dltBtn.remove();
    e.target.classList.remove('btn-shown');
  }

  showDltBtn(e) {
    e.target.classList.add('btn-shown');
    e.target.append(this.dltBtn);
  }

  createDeleteButton() {
    this.dltBtn = document.createElement('button');
    this.dltBtn.classList.add('dlt-btn');
    this.dltBtn.textContent = '\u2573';
    this.dltBtn.addEventListener('click', this.onDltBtnCLick);
  }

  onMouseMove(e) {
    this.dragged.style.left = `${e.clientX - this.dragged.shiftX}px`;
    this.dragged.style.top = `${e.clientY - this.dragged.shiftY}px`;

    this.moveDragged(e);
  }

  moveDragged(e) {
    this.dragged.hidden = true;

    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    const card = elementBelow.classList.contains('card');
    const emptyCardList = elementBelow.classList.contains('card-list') && !elementBelow.querySelectorAll('.card').length <= 1;
    const emptyPlaceCard = elementBelow.classList.contains('empty-card');

    this.dragged.hidden = false;

    this.emptyPlaceCard.style.height = `${this.dragged.clientHeight}px`;

    if (!card && !emptyCardList && !emptyPlaceCard) this.emptyPlaceCard.remove();

    if (card) {
      const center = elementBelow.getBoundingClientRect().top + elementBelow.offsetHeight / 2;

      if (e.clientY > center) {
        elementBelow.after(this.emptyPlaceCard);
      } else if (e.clientY < center) {
        elementBelow.before(this.emptyPlaceCard);
      }
    }

    if (emptyCardList) {
      elementBelow.insertAdjacentElement('afterbegin', this.emptyPlaceCard);
    }
  }

  onMouseDown(e) {
    e.preventDefault();

    if (e.target.classList.contains('card')) {
      this.dragged = e.target;

      this.dragged.shiftX = e.clientX - this.dragged.getBoundingClientRect().left;
      this.dragged.shiftY = e.clientY - this.dragged.getBoundingClientRect().top;
      this.dragged.style.left = `${e.clientX - this.dragged.shiftX}px`;
      this.dragged.style.top = `${e.clientY - this.dragged.shiftY}px`;
      this.dragged.classList.add('dragged');

      this.from = e.target.closest('.column');

      document.documentElement.addEventListener('mouseup', this.onMouseUp);
      document.documentElement.addEventListener('mousemove', this.onMouseMove);
    }
  }

  onMouseUp(e) {
    this.emptyPlaceCard.replaceWith(this.dragged);

    this.hideDltBtn(e);

    this.dragged.classList.remove('dragged');
    this.dragged.removeAttribute('style');
    this.to = this.dragged.closest('.column');
    this.dragged = null;

    this.element.dispatchEvent(new CustomEvent('cardMoved', {
      bubbles: true,
      detail: {
        elFrom: this.from,
        elTo: this.to,
      },
    }));

    document.documentElement.removeEventListener('mousemove', this.onMouseMove);
    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
  }

  onSubmitCardForm(e) {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.name.classList.add('invalid');
      return;
    }

    this.cards.push({
      id: nanoid(),
      content: e.target.name.value,
    });

    e.target.reset();
    this.onCloseFormBtnClick();
    Column.setToLocal(this.name, this.cards);
    this.renderCardList();
  }

  onAddCardFormBtnClick() {
    this.openFormBtn.replaceWith(this.addCardForm);
  }

  onCloseFormBtnClick() {
    this.addCardForm.replaceWith(this.openFormBtn);
  }

  init() {
    this.createColumn();
    this.createCardList();

    this.renderCardList();

    this.createOpenFormBtn();
    this.element.append(this.cardList, this.openFormBtn);

    this.createForm();

    this.createEmptyPlaceCard();
    this.createDeleteButton();

    return this.element;
  }

  createEmptyPlaceCard() {
    this.emptyPlaceCard = document.createElement('div');
    this.emptyPlaceCard.classList.add('empty-card');
    this.emptyPlaceCard.textContent = 'Drop a card here';
  }

  createForm() {
    this.addCardForm = document.createElement('form');
    this.addCardForm.noValidate = true;
    this.addCardForm.classList.add('add-card-form');
    this.addCardForm.innerHTML = `
      <textarea name="name" placeholder="Enter a title for this card..." required></textarea>
      <div class="btns-container">
      <button type="submit" class="add-card-btn">Add card</button>
      <button type="button" class="close-form-btn"></button>
      </div>
    `;

    this.addCardForm.querySelector('.close-form-btn').addEventListener('click', this.onCloseFormBtnClick);
    this.addCardForm.addEventListener('submit', this.onSubmitCardForm);
    this.addCardForm.querySelector('textarea').addEventListener('focus', (e) => e.target.classList.remove('invalid'));
  }

  createColumn() {
    this.element = document.createElement('div');
    this.element.classList.add('column', `column-${this.name.toLowerCase().replaceAll(' ', '-')}`);
    this.element.innerHTML = `<h2>${this.name}</h2>`;
  }

  createCardList() {
    this.cardList = document.createElement('div');
    this.cardList.classList.add('card-list');
  }

  createOpenFormBtn() {
    this.openFormBtn = document.createElement('button');
    this.openFormBtn.classList.add('open-form-btn');
    this.openFormBtn.textContent = '+ Add another card';
    this.openFormBtn.addEventListener('click', this.onAddCardFormBtnClick);
  }

  static getFromLocal(name) {
    return JSON.parse(window.localStorage.getItem(`${name}`));
  }

  static setToLocal(name, content) {
    window.localStorage.setItem(`${name}`, JSON.stringify(content));
  }
}
