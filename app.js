const searchByName = document.getElementById("search-by-name");
const searchByMainIng = document.getElementById("search-by-main-ing");
const filterByCategorySelect = document.getElementById("select-category");
const filterByCountrySelect = document.getElementById("select-country");
const mealsEl = document.getElementById("mealsList");
const mainDiv = document.getElementById("main");
const relativeEl = document.getElementById("relative");
const ulEl = document.getElementById("ul");
let searchMealsToken;

function eventListeners() {
  window.addEventListener("load", () => {
    getRandomMeal();
    getCategoryNames();
    getCountryNames();
  });
  searchByName.addEventListener("keyup", fetchMealsBySearchName);
  searchByMainIng.addEventListener("keyup", fetchMealsBySearchMainIngredient);
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Fetching data failed");
  }
  return response.json();
}

async function getRandomMeal() {
  const response = await fetchData(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const randomMeal = response.meals[0];

  createRandomMealElement(randomMeal);
  const randomButton = document.getElementById("newRandom");
  randomButton.addEventListener("click", getRandomMeal);
}

async function getCategoryNames() {
  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
    );

    const list = response.meals;
    list.forEach((country) => {
      const optionElement = document.createElement("option");
      optionElement.classList.add("options");
      optionElement.textContent = country.strCategory;
      optionElement.value = country.strCategory;
      filterByCategorySelect.appendChild(optionElement);
    });

    filterByCategorySelect.addEventListener("change", fetchMealsByCategory);
  } catch (err) {
    console.log(err.message);
  }
}

async function getCountryNames() {
  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );
    const list = response.meals;
    list.forEach((country) => {
      const optionElement = document.createElement("option");
      optionElement.classList.add("options");
      optionElement.textContent = country.strArea;
      optionElement.value = country.strArea;
      filterByCountrySelect.appendChild(optionElement);
    });
    filterByCountrySelect.addEventListener("change", fetchMealsByCountry);
  } catch (err) {
    console.log(err.message);
  }
}

async function fetchMealsBySearchName(event) {
  searchByMainIng.value = "";
  clearTimeout(searchMealsToken);
  searchMealsToken = setTimeout(async () => {
    try {
      const response = await fetchData(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" +
          event.target.value
      );
      const list = response.meals;
      if (!list) {
        showNoResults(event.target.value);
        return;
      }
      renderMeal(list);
    } catch (err) {
      console.error(err);
    }
  }, 1000);
}

async function fetchMealsBySearchMainIngredient(event) {
  searchByName.value = "";
  clearTimeout(searchMealsToken);
  searchMealsToken = setTimeout(async () => {
    try {
      const response = await fetchData(
        "https://www.themealdb.com/api/json/v1/1/filter.php?i=" +
          event.target.value
      );
      const list = response.meals;
      if (!list) {
        showNoResults(event.target.value);
        return;
      }
      renderMeal(list);
    } catch (err) {
      console.error(err);
    }
  }, 1000);
}

async function fetchMealsByCategory(event) {
  searchByName.value = "";
  searchByMainIng.value = "";

  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/filter.php?c=" +
        event.target.value
    );

    const list = response.meals;
    renderMeal(list);
  } catch (err) {
    console.error(err);
  }
}

async function fetchMealsByCountry(event) {
  searchByName.value = "";
  searchByMainIng.value = "";

  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/filter.php?a=" +
        event.target.value
    );
    const list = response.meals;
    renderMeal(list);
  } catch (err) {
    console.error(err);
  }
}

async function fetchMealById(id) {
  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );
    const meal = response.meals[0];
    createPopupAndShow(meal);
  } catch (err) {
    console.error(err);
  }
}

async function getId(id) {
  try {
    const response = await fetchData(
      "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );
    const meal = response.meals[0];
    console.log(meal);
  } catch (err) {
    console.error(err);
  }
}

function renderMeal(list) {
  mealsEl.innerHTML = "";
  mealsEl.className = "meal-result";

  list.forEach((meal) => {
    const mealDiv = document.createElement("div");
    mealDiv.classList.add("filtered-meals");
    mealDiv.innerHTML = `
        <img src="${meal.strMealThumb}" class="random">
        <div class="name-fav">
          <a href="#" class="meal-name" onclick="fetchMealById(${
            meal.idMeal
          })"><p>${meal.strMeal.slice(0, 25)}</p></a>
          <button onclick="showMealAsFavorite(${
            meal.idMeal
          })" id="fav-btn"><i  id="heart" class="far fa-heart"></i></button>
        </div>
      `;
    mealsEl.appendChild(mealDiv);
  });
}

function createPopupAndShow(meal) {
  document.body.innerHTML += `
  <div id="popup-container">
    <div id="popup">
      <a  id="close-popup">X</a>
      <h2 class="meal-header">${meal.strMeal}</h2>
      <div class= "popup-header">
        <img src="${meal.strMealThumb}" alt="">
        <div class="name-feature">
          <div class="category-county">
            <h3>Category: <span>${meal.strCategory}</span></h3>
            <h3>Area: <span>${meal.strArea}</span></h3>
          </div>
          <h2>Ingredients</h2>
          <ul id="list-of-ingredients"></ul>
        </div>
      </div>
      <p class="instruction">${meal.strInstructions}</p>
      <a class="video-link" href="${meal.strYoutube}">Watch How To Cook</a>
    </div>
  </div>
  `;
  const ingList = document.querySelector("#list-of-ingredients");
  for (let i = 1; i < 21; i++) {
    const ingredientAndMeasures = document.createElement("li");
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient != "") {
      ingredientAndMeasures.innerText =
        meal[`strIngredient${i}`] + "  /  " + meal[`strMeasure${i}`];
      ingList.appendChild(ingredientAndMeasures);
    }
  }
  const popupContainer = document.getElementById("popup-container");
  popupContainer.addEventListener("click", closePopup);
}

function closePopup() {
  const popupContainer = document.getElementById("popup-container");
  popupContainer.parentElement.removeChild(popupContainer);
}

function createRandomMealElement(data) {
  mealsEl.innerHTML = "";
  mealsEl.classList.add("randomMeal");
  mealsEl.innerHTML = `
    <div class="chef">
      <img src="./src/chef.png" alt="chef">
      <p> <span> TIRED of thinking recipe for ever day? </span> <br> Just click here to see our offer for today's menu </p>
      <button type="button" id="newRandom" class="btn">New Random</button>
    </div>
    <div class="random-meal-part">
      <img src="${data.strMealThumb}" class="random">
      <p id="country">${data.strArea}</p>
      <div class="name-fav">
          <a href="#" class="meal-name" onclick="fetchMealById(${
            data.idMeal
          })"><p class="meal-name">${data.strMeal.slice(0, 25)}</p></a>
          <button id="fav-btn"><i  id="heart" class="far fa-heart"></i></button>
      </div>
    </div>
  `;
}

function showNoResults(data) {
  mealsEl.innerHTML = "";
  mealsEl.className = "meal-result";
  const noResults = document.createElement("p");
  noResults.className = "no-result";
  noResults.innerText = `No Result for ${data}...`;
  mealsEl.appendChild(noResults);
}

eventListeners();
