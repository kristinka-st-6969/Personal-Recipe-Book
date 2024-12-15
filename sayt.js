let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function addToFavorites(button) {
    const catalogCard = button.closest('.catalog-card');
    
    // Проверяем, что карточка рецепта существует
    if (!catalogCard) return;

    // Получаем данные рецепта
    const title = catalogCard.getAttribute('data-title')?.trim();
    const recipeLink = catalogCard.getAttribute('data-link')?.trim();
    const info = catalogCard.querySelector('.catalog-card-info');
    const details = info ? Array.from(info.children).map(div => div.textContent.trim()) : [];

    // Проверка на наличие обязательных данных
    if (!title || !recipeLink || details.length === 0) {
        alert("Невозможно добавить некорректный рецепт.");
        return;
    }

    // Создаем объект рецепта
    const recipe = {
        title: title,
        details: details,
        link: recipeLink
    };

    // Проверяем, есть ли уже рецепт в избранном
    if (!favorites.some(fav => fav.title === recipe.title)) {
        // Добавляем рецепт в избранное
        favorites.push(recipe);
        // Сохраняем в localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${recipe.title} добавлен в избранное`);
    } else {
        alert(`${recipe.title} уже добавлен в избранное`);
    }
}

if (window.location.href.includes('favorites.html')) {
    displayFavorites();
}

function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = ''; // Очищаем текущий список

    // Отфильтровываем некорректные рецепты
    const validFavorites = favorites.filter(recipe => 
        recipe.title && recipe.link && Array.isArray(recipe.details) && recipe.details.length > 0
    );

    // Обновляем localStorage (чистим некорректные рецепты)
    localStorage.setItem('favorites', JSON.stringify(validFavorites));

    // Отображаем все корректные рецепты
    validFavorites.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <a href="${recipe.link}" class="catalog-card-link">
                <img src="${recipe.title}.png" alt="${recipe.title}">
                <div class="catalog-card-info">
                    <div>${recipe.details[0]}</div>
                    <div>${recipe.details[1] || ''}</div>
                    <div>${recipe.details[2] || ''}</div>
                </div>
            </a>
            <button onclick="removeFromFavorites('${recipe.title}', this)" class="remove-btn">Удалить</button>
        `;
        favoritesList.appendChild(card);
    });
}

function removeFromFavorites(recipeTitle, button) {
    // Удаляем рецепт из массива
    favorites = favorites.filter(recipe => recipe.title !== recipeTitle);
    // Сохраняем обновленный массив в localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Удаляем элемент из DOM
    button.closest('.catalog-card').remove();
}

function searchRecipes() {
    const input = document.querySelector('input[name="search"]');
    const filter = input.value.toLowerCase();
    const catalogCards = document.querySelectorAll('.catalog-card');
    const matchedCards = [];
    const unmatchedCards = [];

    catalogCards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        if (title.includes(filter)) {
            matchedCards.push(card);
        } else {
            unmatchedCards.push(card);
        }
    });

    const catalogContainer = document.querySelector('.catalog-container');
    catalogContainer.innerHTML = '';
    matchedCards.forEach(card => catalogContainer.appendChild(card));
    unmatchedCards.forEach(card => catalogContainer.appendChild(card));
}

const filterButton = document.getElementById('filterButton');
const filtersPanel = document.getElementById('filtersPanel');

if (filterButton && filtersPanel) {
    filterButton.addEventListener('click', () => {
        filtersPanel.classList.toggle('open');
    });

    document.getElementById('closeFilters')?.addEventListener('click', () => {
        filtersPanel.classList.remove('open');
    });
}

const prepTimeInput = document.getElementById('prep-time');
const prepTimeValue = document.getElementById('prep-time-value');

prepTimeInput?.addEventListener('input', () => {
    prepTimeValue.textContent = prepTimeInput.value;
});

function applyFilters() {
    const selectedCuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(c => c.value.toLowerCase());
    const selectedMealTypes = Array.from(document.querySelectorAll('input[name="mealType"]:checked')).map(c => c.value.toLowerCase());
    const selectedMealTimes = Array.from(document.querySelectorAll('input[name="mealTime"]:checked')).map(c => c.value.toLowerCase());
    const prepTime = parseInt(prepTimeInput.value);

    const cards = document.querySelectorAll('.catalog-card');
    cards.forEach(card => {
        const cardInfo = card.querySelector('.catalog-card-info').innerText.toLowerCase();
        let isVisible = true;

        if (selectedCuisines.length > 0 && !selectedCuisines.some(c => cardInfo.includes(c))) isVisible = false;
        if (selectedMealTypes.length > 0 && !selectedMealTypes.some(t => cardInfo.includes(t))) isVisible = false;
        if (selectedMealTimes.length > 0 && !selectedMealTimes.some(t => cardInfo.includes(t))) isVisible = false;

        const timeMatch = cardInfo.match(/(\d+)\s*минут/);
        if (timeMatch && prepTime > 0 && parseInt(timeMatch[1]) > prepTime) isVisible = false;

        card.style.display = isVisible ? 'flex' : 'none';
    });
}

function resetFilters() {
    document.querySelectorAll('.filter-item').forEach(item => item.checked = false);
    prepTimeInput.value = 0;
    prepTimeValue.textContent = '0';

    document.querySelectorAll('.catalog-card').forEach(recipe => recipe.style.display = 'flex');
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[name="search"]');
    const searchButton = document.querySelector('button[type="submit"]');
    const catalogCards = document.querySelectorAll('.catalog-card');

    searchButton?.addEventListener('click', (event) => {
        event.preventDefault();
        filterRecipes();
    });

    function filterRecipes() {
        const query = searchInput.value.toLowerCase();
        catalogCards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            card.style.display = title.includes(query) ? 'flex' : 'none';
        });
    }
});

function getRecipeId() {
    const url = window.location.pathname;
    return url.split('/').pop() || "default_recipe";
}

function getIngredientsFromPage() {
    const ingredients = [];
    document.querySelectorAll('.ingredients li').forEach(item => {
        ingredients.push(item.textContent.trim());
    });
    return ingredients;
}

function loadIngredients() {
    const recipeId = getRecipeId();
    let ingredients = JSON.parse(localStorage.getItem(recipeId)) || getIngredientsFromPage();
    localStorage.setItem(recipeId, JSON.stringify(ingredients));
    return ingredients;
}

function displayIngredientsInModal() {
    const recipeId = getRecipeId();
    const ingredients = JSON.parse(localStorage.getItem(recipeId));
    const modalList = document.getElementById('ingredients-list');
    modalList.innerHTML = '';

    ingredients.forEach((ingredient, index) => {
        const listItem = document.createElement('li');
        const input = document.createElement('input');
        input.value = ingredient;
        input.setAttribute('data-index', index);
        listItem.appendChild(input);
        modalList.appendChild(listItem);
    });
}

function saveIngredientsFromModal() {
    const updatedIngredients = Array.from(document.querySelectorAll('#ingredients-list input')).map(input => input.value);
    localStorage.setItem(getRecipeId(), JSON.stringify(updatedIngredients));
}

document.getElementById('open-modal-btn')?.addEventListener('click', () => {
    displayIngredientsInModal();
    document.getElementById('ingredients-modal').style.display = 'block';
});

document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    document.getElementById('ingredients-modal').style.display = 'none';
});

document.getElementById('save-changes-btn')?.addEventListener('click', () => {
    saveIngredientsFromModal();
    document.getElementById('ingredients-modal').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    const ingredients = loadIngredients();
    displayIngredientsOnPage(ingredients);
});

function displayIngredientsOnPage(ingredients) {
    const menu = document.querySelector('.ingredients');
    if (menu) {
    menu.innerHTML = ''
    }
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        menu.appendChild(li);
    });
}
