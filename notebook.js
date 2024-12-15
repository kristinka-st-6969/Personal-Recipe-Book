document.addEventListener("DOMContentLoaded", loadRecipes);

let selectedRecipeIndex = null;
let menuPlan = JSON.parse(localStorage.getItem("menuPlan")) || {};

function addRecipe() {
    const title = document.getElementById("recipeTitleInputtt").value;
    const ingredients = document.getElementById("recipeIngredientsInputtt").value.split("\n");
    const description = document.getElementById("recipeDescriptionInputtt").value;
    const time = document.getElementById("recipeTimeInputtt").value;
    const servings = document.getElementById("recipeServingsInputtt").value;
    const difficulty = document.getElementById("recipeDifficultyInputtt").value;
    const imageInput = document.getElementById("recipeImageInputtt");

    if (!title || !ingredients || !description || !time || !servings || !difficulty) {
        alert("Заполните все поля рецепта.");
        return;
    }

    const recipes = getRecipesFromStorage();

    const newRecipe = {
        title,
        ingredients,
        description,
        time,
        servings,
        difficulty,
        image: null
    };

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            newRecipe.image = event.target.result;
            recipes.push(newRecipe);
            localStorage.setItem("recipes", JSON.stringify(recipes));
            loadRecipes();
            clearRecipeForm();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        recipes.push(newRecipe);
        localStorage.setItem("recipes", JSON.stringify(recipes));
        loadRecipes();
        clearRecipeForm();
    }
}

function clearRecipeForm() {
    document.getElementById("recipeTitleInputtt").value = '';
    document.getElementById("recipeIngredientsInputtt").value = '';
    document.getElementById("recipeDescriptionInputtt").value = '';
    document.getElementById("recipeTimeInputtt").value = '';
    document.getElementById("recipeServingsInputtt").value = '';
    document.getElementById("recipeDifficultyInputtt").value = '';
    document.getElementById("recipeImageInputtt").value = '';
}

function deleteSelectedRecipe() {
    const recipes = getRecipesFromStorage();
    if (selectedRecipeIndex !== null && recipes[selectedRecipeIndex]) {
        recipes.splice(selectedRecipeIndex, 1);
        localStorage.setItem("recipes", JSON.stringify(recipes));
        selectedRecipeIndex = null;
        loadRecipes();
        clearRecipeDetails();
    } else {
        alert("Выберите рецепт для удаления.");
    }
}

function editSelectedRecipe() {
    const recipes = getRecipesFromStorage();
    if (selectedRecipeIndex !== null && recipes[selectedRecipeIndex]) {
        const recipe = recipes[selectedRecipeIndex];
        document.getElementById("recipeTitleInputtt").value = recipe.title;
        document.getElementById("recipeIngredientsInputtt").value = recipe.ingredients.join("\n");
        document.getElementById("recipeDescriptionInputtt").value = recipe.description;
        document.getElementById("recipeTimeInputtt").value = recipe.time;
        document.getElementById("recipeServingsInputtt").value = recipe.servings;
        document.getElementById("recipeDifficultyInputtt").value = recipe.difficulty;
        recipes.splice(selectedRecipeIndex, 1);
        localStorage.setItem("recipes", JSON.stringify(recipes));
        loadRecipes();
        clearRecipeDetails();
    } else {
        alert("Выберите рецепт для редактирования.");
    }
}

function loadRecipes() {
    const recipeList = document.getElementById("recipeListtt");
    recipeList.innerHTML = "";
    const recipes = getRecipesFromStorage();

    recipes.forEach((recipe, index) => {
        const li = document.createElement("li");
        li.textContent = recipe.title;
        li.onclick = () => selectRecipe(index);
        li.classList.toggle("selected", index === selectedRecipeIndex);
        recipeList.appendChild(li);
    });
}

function getRecipesFromStorage() {
    return JSON.parse(localStorage.getItem("recipes")) || [];
}

function selectRecipe(index) {
    if (selectedRecipeIndex === index) {
        clearRecipeDetails();
        selectedRecipeIndex = null;
    } else {
        selectedRecipeIndex = index;
        const recipes = getRecipesFromStorage();
        const recipe = recipes[index];
        document.getElementById("detailTitleee").textContent = recipe.title;
        document.getElementById("detailContenttt").innerHTML = `
            <p><strong>Ингредиенты:</strong> ${recipe.ingredients.join(", ")}</p>
            <p><strong>Описание:</strong> ${recipe.description}</p>
            <p><strong>Время приготовления:</strong> ${recipe.time} минут</p>
            <p><strong>Порции:</strong> ${recipe.servings}</p>
            <p><strong>Сложность:</strong> ${recipe.difficulty}</p>
            ${recipe.image ? `<img src="${recipe.image}" alt="Фото блюда" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">` : ""}
        `;
        document.getElementById("recipeDetailsss").style.display = "block";
    }

    document.querySelectorAll("#recipeList li").forEach((li, idx) => {
        li.classList.toggle("selected", idx === selectedRecipeIndex);
    });
}

function clearRecipeDetails() {
    document.getElementById("recipeDetailsss").style.display = "none";
}

function planMenu() {
    if (selectedRecipeIndex === null) {
        alert("Пожалуйста, выберите рецепт для планирования.");
        return;
    }
    document.getElementById("menuModal").style.display = "flex";
}

function savePlannedMenu() {
    const day = document.getElementById("daySelector").value;
    const recipes = getRecipesFromStorage();
    const selectedRecipe = recipes[selectedRecipeIndex].title;

    if (!menuPlan[day]) {
        menuPlan[day] = [];
    }
    menuPlan[day].push(selectedRecipe);
    localStorage.setItem("menuPlan", JSON.stringify(menuPlan));
    closeModal('menuModal');
    alert("Рецепт запланирован на " + day);
}

function viewMenu() {
    const menuByDay = document.getElementById("menuByDay");
    menuByDay.innerHTML = "";

    Object.keys(menuPlan).forEach(day => {
        const dayBlock = document.createElement("div");
        const dayTitle = document.createElement("h3");
        dayTitle.textContent = day;
        dayBlock.appendChild(dayTitle);

        menuPlan[day].forEach((recipe, index) => {
            const recipeItem = document.createElement("div");
            recipeItem.style.display = "flex";
            recipeItem.style.alignItems = "center";
            recipeItem.style.justifyContent = "space-between";

            const recipeText = document.createElement("p");
            recipeText.textContent = recipe;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Удалить";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => deletePlannedRecipe(day, index);

            recipeItem.appendChild(recipeText);
            recipeItem.appendChild(deleteBtn);
            dayBlock.appendChild(recipeItem);
        });

        menuByDay.appendChild(dayBlock);
    });

    document.getElementById("viewMenuModal").style.display = "flex";
}

function deletePlannedRecipe(day, recipeIndex) {
    if (menuPlan[day]) {
        menuPlan[day].splice(recipeIndex, 1);
        if (menuPlan[day].length === 0) {
            delete menuPlan[day];
        }
        localStorage.setItem("menuPlan", JSON.stringify(menuPlan));
        viewMenu();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}



function previewImage(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();

        reader.onload = function() {
            imagePreview.src = reader.result;
            previewContainer.style.display = 'inline-block';
        }

        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
    }
}

document.getElementById('recipeListtt').addEventListener('click', function(event) {
    const clickedItem = event.target.closest('li');

    if (clickedItem) {
        clickedItem.classList.toggle('selected');
    }
});