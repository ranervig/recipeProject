let recipes = [];

async function getData() {
  const response = await fetch("/api");
  recipes = await response.json();
  console.log(recipes);
  updateSelect();
}

function updateSelect() {
  select = document.querySelector("#recipeSelect");
  for (a in select.options) {
    select.options.remove(0);
  }
  recipes.forEach((rec) => {
    let newOpt = document.createElement("option");
    newOpt.value = rec.recipe;
    newOpt.text = rec.recipe;
    select.appendChild(newOpt);
  });
}

function displayInfo(recipe) {
  let div = document.createElement("div");
  div.className = "summaryInfo";
  let img = document.createElement("img");
  if (recipe.image) {
    img.src = recipe.path;
    img.alt = recipe.recipe;
  } else {
    img.src = "https://via.placeholder.com/250?text=No+Image+Provided";
    img.alt = "No image";
  }
  div.appendChild(img);
  let addedDate = new Date(recipe.timestamp);

  div.insertAdjacentHTML("beforeend",
  ` <p>Serves: ${recipe.servings}<br>
    Prep: ${recipe.prep} minutes<br>
    Cook: ${recipe.cook} minutes<br>
    Added On: ${addedDate.toLocaleDateString()}</p>
  `
  )
  return div;
}

function displayIngredients(ingredients) {
  let div = document.createElement("div");
  div.className = "ingredientDisplay";
  let h3 = document.createElement("h3");
  h3.textContent = "Ingredients";
  div.append(h3);
  let list = document.createElement("ul");
  let button = document.createElement('button');
  button.innerText = "Show";
  button.addEventListener("click", e => {
    if(list.style.display == "none"){
      button.innerText = "Hide";
      list.style.display = "block";
    }else{
      button.innerText = "Show";
      list.style.display = "none";
    }
  });
  div.appendChild(button);
  for (let i = 0; i < ingredients.length; i += 3) {
    let li = document.createElement("li");
    li.innerHTML = `${ingredients[i]} ${ingredients[i + 1]} ${ingredients[i + 2]}`;
    list.appendChild(li);
  }
  list.style.display = "none";
  div.append(list);
  return div;
}

function displayInstructions(instructions) {
  let div = document.createElement("div");
  div.className = "instructionDisplay";
  let h3 = document.createElement("h3");
  h3.textContent = "Instructions";
  div.append(h3);
  let list = document.createElement("ol");
  let button = document.createElement('button');
  button.innerText = "Show";
  button.addEventListener("click", e => {
    if(list.style.display == "none"){
      button.innerText = "Hide";
      list.style.display = "block";
    }else{
      button.innerText = "Show";
      list.style.display = "none";
    }
  });
  div.appendChild(button);
  instructions.forEach((inst) => {
    let li = document.createElement("li");
    li.textContent = inst;
    list.appendChild(li);
  });
  list.style.display = "none";
  div.append(list);
  return div;
}

function displayRecipe(index) {
  let recipeObj = recipes[index];
  displayArea = document.querySelector(".recipeDisplay");
  displayArea.innerHTML = "";
  let h2 = document.createElement("H2");
  h2.textContent = recipeObj.recipe;
  displayArea.append(h2);
  displayArea.append(displayInfo(recipeObj));
  displayArea.append(displayIngredients(recipeObj.ingredients));
  displayArea.append(displayInstructions(recipeObj.instructions));
}

function addIngredient(){
  let p = document.createElement('p');
  p.innerHTML = 
  `
  <label>Amount: <input type="text" name="ingredients" /></label>
  <label>Unit: <input list="measurementUS" name="ingredients" /></label>
  <label>Ingredient: <input type="text" name="ingredients" /></label>
  `
  document.querySelector(".ingredients").appendChild(p);
}

function addInstruction(){
  let li = document.createElement('li');
  li.innerHTML = `<input type="text" name="instructions" />`;
  document.querySelector(".instructions > ol").appendChild(li);
}

window.addEventListener("load", async () => {
  await getData();
  let select = document.querySelector("#recipeSelect");
  select.addEventListener("change", (e) => {
    displayRecipe(select.selectedIndex);
  });

  displayRecipe(0);
  

  let form = document.querySelector(".inputForm");
  form.style.display = "none";

  document.querySelector("#newRecipe").addEventListener("click", e => {
    if( form.style.display != 'none'){
      form.style.display = "none";
    }else{
      form.style.display = "block";
    }
  })

  document.querySelector('#addIngredient').addEventListener("click", addIngredient);

  document.querySelector('#addInstruction').addEventListener("click", addInstruction);

  form.addEventListener("submit", async (e) => {
    console.log("button pressed");
    e.preventDefault();
    e.stopPropagation();

    let response = await fetch("/api", {
      method: "post",
      body: new FormData(form),
    });
    let result = await response.json();
    console.log(result.recipe + " at " + result.timestamp);
    await getData();
  });
});