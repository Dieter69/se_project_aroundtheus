/* --------------------- IMPORT CLASSES --------------------- */
import "./index.css";
import Api from "../components/Api.js";
import Card from "../components/Card.js";
import FormValidator from "../components/FormValidator.js";
import PopupWithForm from "../components/PopupWithForm.js";
import PopupWithImage from "../components/PopupWithImage.js";
import PopupConfirm from "../components/PopupConfirm.js";
import Section from "../components/Section.js";
import UserInfo from "../components/UserInfo.js";
import { selectors, config } from "../utils/constants.js";

const api = new Api({
  baseUrl: "https://around.nomoreparties.co/v1/cohort-3-en",
  headers: {
    authorization: "0d34a92c-1da7-4adc-abc0-e2b3b38a4b1f",
    "Content-Type": "application/json",
  },
});

// Find buttons.
const editAvatButton = document.querySelector("#profile-avatar-container");
const editProfButton = document.querySelector("#profile-edit-button");
const addCardButton = document.querySelector("#add-card-button");
const delCardButton = document.querySelector("#delete-card-button");
// console.log(delCardButton);

// Find edit form input elements.
const profNameInput = document.querySelector("#profile-title-input");
const profDescInput = document.querySelector("#profile-description-input");

//  Find form elements.
const profEditForm = document.forms["edit-card-form"];
const addCardForm = document.forms["add-card-form"];
const avatEditForm = document.forms["avatar-edit-form"];

/* ------------------- Form Validation -------------------- */

const addFormValidator = new FormValidator(config, addCardForm);
const editFormValidator = new FormValidator(config, profEditForm);
const avatEditFormValidator = new FormValidator(config, avatEditForm);

/* --------------------- Card Handler --------------------- */

let cardSection;
let card;
let cardId;
let userID;

// Receives card data(cardData) from API and renders data to cards.
api.getInitialCardsAPI().then((cardData) => {
  cardSection = new Section(
    {
      items: cardData,
      renderer: (cardData) => {
        // Renders a new card
        const card = createCard(cardData);
        // console.log(cardData);

        // Adds each rendered card to the DOM.
        cardSection.addItem(card);
        // console.log(card);
      },
    },
    selectors.cardsList
  );
  // Renders each card via Section.js to the DOM.
  cardSection.renderItems();
  // console.log(cardSection);
});

/* -------------------Create Card Handler --------------------- */

// This function creates a new card
// cardData = {API data from card.}
function createCard(cardData) {
  const cardSelector = selectors.cardTemplate;
  // userID = userInfo._id;
  // console.log(userData);
  card = new Card(
    cardData,
    cardSelector,
    handleImageClick,
    handleDeleteCardPopup,
    // handleLikeClick,
    cardId
  );

  // console.log(cardData);
  return card.getView();
}

// Create image Popup instance.
const cardPrevPopup = new PopupWithImage(selectors.previewImageModal);

// imageData = {link:, name:}
function handleImageClick(imageData) {
  cardPrevPopup.open(imageData);
  // console.log(imageData);
}

/* ----------------Delete Card Handler --------------------- */

const deleteCardModal = new PopupConfirm(
  selectors.delCardConfirmModal,
  handleDeleteCard,
  "Yes",
  "Deleting..."
);

function handleDeleteCard() {
  handleDeleteCardPopup(card);
  deleteCardModal.showLoading();
  deleteCardModal.setSubmitAction((card) => {
    const cardId = card._cardId;
    api
      .deleteCardAPI(cardId)
      .then((res) => {
        card.handleDeleteCard();
        deleteCardModal.close();
      })
      .finally(() => {
        deleteCardModal.hideLoading();
      });
  });
}

function handleDeleteCardPopup(card) {
  deleteCardModal.open(card);
  console.log(card);
  console.log(cardId);
}
deleteCardModal.setEventListeners();

// delCardButton.addEventListener("click", () => {
//   // Open the add card form
//   deleteCardModal.open();
//   // Reset validation for the add card form
//   // addFormValidator.resetForm();
// });

/* ------------------- Profile Info ------------------- */

/* ------------------- Profile Info ------------------- */

/* ------------------- Profile Info ------------------- */

/* ------------------- Profile Info ------------------- */

const userInfo = new UserInfo({
  profNameSelector: selectors.profName,
  profDescSelector: selectors.profDesc,
  profAvatarSelector: selectors.profAvatar,
  userID,
});

console.log(userInfo);
console.log(userInfo._id);

// Fetches user API data and sets to Profile Info.
api.getProfileInfoAPI().then((userData) => {
  userInfo.setProfileInfo({
    name: userData.name,
    description: userData.about,
    avatar: userData.avatar,
    userID: userData._id,
  });
  console.log(userData);
});

const editProfInfo = new PopupWithForm(
  selectors.editProfFormModal,
  handleProfileSubmit,
  "Save",
  "Saving..."
);

function handleProfileSubmit({ name, description }) {
  editProfInfo.showLoading();
  api
    .setProfileInfoAPI(name, description)
    .then((dataAPI) => {
      userInfo.setProfileInfo({
        name,
        description,
        // avatar: dataAPI.avatar,
        userID: dataAPI._id,
      });
      console.log(dataAPI);
      editProfInfo.close();
    })
    .finally(() => {
      editProfInfo.hideLoading();
    });
}

editProfButton.addEventListener("click", () => {
  // Open the avatar edit modal form
  editProfInfo.open();

  // Add the profile info from the page to the form's fields
  const profInfo = userInfo.getProfileInfo();
  profNameInput.value = profInfo.name;
  profDescInput.value = profInfo.description;

  // Reset validation for the avatar edit modal form
  editFormValidator.resetForm();
});

editProfInfo.setEventListeners();

/* --------------- Edit Avatar Card --------------- */

const editAvatPopup = new PopupWithForm(
  selectors.editAvatFormModal,
  handleAvatarSubmit,
  "Save",
  "Save..."
);

function handleAvatarSubmit(imageData) {
  editAvatPopup.showLoading();
  api
    .setAvatarAPI(imageData.avatURL)
    .then((res) => {
      userInfo.setAvatar(imageData.avatURL);
      editAvatPopup.close();
      console.log(imageData);
    })
    .finally(() => {
      editAvatPopup.hideLoading();
    });
}

editAvatButton.addEventListener("click", () => {
  // Open the avatar edit modal form
  editAvatPopup.open();
  // Reset validation for the avatar edit modal form
  avatEditFormValidator.resetForm();
});

editAvatPopup.setEventListeners();

/* ------------------- Add Card ------------------- */

const addCardFormModal = new PopupWithForm(
  selectors.addCardFormModal,
  handleAddCardSubmit,
  "Create",
  "Creating..."
);

function handleAddCardSubmit({ name, link }) {
  addCardFormModal.showLoading();
  api
    .addCardAPI({ name, link })
    .then((card) => {
      // Create a new card
      const newCard = createCard(card, card._id);
      // Add the new card to the section
      cardSection.addItem(newCard);
      addCardFormModal.close();
      console.log(newCard);
    })
    .finally(() => {
      addCardFormModal.hideLoading();
    });
}
// Open the modal when users click on the add button
addCardButton.addEventListener("click", () => {
  // Open the add card form
  addCardFormModal.open();
  // Reset validation for the add card form
  addFormValidator.resetForm();
});

// Set add form event listeners
addCardFormModal.setEventListeners();

/* ----------------- Delete Card ----------------- */
// const delCardConfirmModal = new PopupConfirm(
//   selectors.delCardConfirmModal,
//   handleDeleteCardClick,
//   "Yes",
//   "Deleting..."
// );

// function handleDeleteCardClick(cardId) {
//   api.deleteCard().then((res) => {
//     console.log(res);
//   });
// }

// delCardButton.addEventListener("click", () => {
//   // Open the add card form
//   delCardConfirmModal.open();
//   // Reset validation for the add card form
//   // addFormValidator.resetForm();
// });
// delCardConfirmModal.setEventListeners();

/* ------------------- Likes ------------------- */

// function handleLikeClick(card) {
//   if (card.isLiked()) {
//     api
//       .removeLikeFromAPI(card.imageID)
//       .then((res) => {
//         card.setLikes(res.likes);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   } else {
//     api
//       .addLikeToAPI(card.imageID)
//       .then((res) => {
//         card.setLikes(res.likes);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }
// }

// function handleLikeIcon(card) {
//   if (card.isLiked()) {
//     api.removeLike(card.imageID).then((res) => {
//       card.setLikes(res.likes);
//     });
//   } else {
//     api.addLike(card.imageID).then((res) => {
//       card.setLikes(res.likes);
//     });
//   }
// }
/* ------------------- Enable Validation ------------------- */

addFormValidator.enableValidation();
editFormValidator.enableValidation();
avatEditFormValidator.enableValidation();