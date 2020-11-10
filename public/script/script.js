let recipes = [];

let modifier = 1;

async function getData() {
  const response = await fetch("/api");
  recipes = await response.json();
  updateSelect();
}

function updateSelect() {
  select = document.querySelector("#recipeSelect");
  for (a in select.options) {
    select.options.remove(0);
  }
  recipes.forEach((rec) => {
    let newOpt = document.createElement("option");
    newOpt.value = rec._id;
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
    img.width = "250";
    img.height = "250";
  } else {
    img.src = "https://via.placeholder.com/250?text=No+Image+Provided";
    img.alt = "No image";
  }
  div.appendChild(img);
  let addedDate = new Date(recipe.timestamp);

  div.insertAdjacentHTML("beforeend",
  ` <p>Serves: ${recipe.servings * modifier}</span><br>
    Prep: ${recipe.prep} ${recipe.prephm}<br>
    Cook: ${recipe.cook} ${recipe.cookhm}<br>
    Added On: ${addedDate.toLocaleDateString()}</p>
  `
  );
  return div;
}

function displayIngredients(ingredients, display) {
  let div = document.createElement("div");
  div.className = "ingredientDisplay";

  let h3 = document.createElement("h3");
  h3.textContent = "Ingredients";
  div.append(h3);

  let list = document.createElement("ul");
  list.id = "ingredientList";

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


  ingredients.forEach((ing) =>{ 
    let li = document.createElement("li");
    let amount = ing.amount * modifier;
    let unit = ing.unit;
    //add plural s to end of unit if more than 1 unit is called for
    if(amount > 1 && unit.charAt(unit.length-1) !== 's'){
      unit += "s";
    }
    li.innerHTML = `${ing.amount * modifier} ${unit} ${ing.ingredient}`;
    list.appendChild(li);
  });
  list.style.display = display;
  div.append(list);
  return div;
}

function displayInstructions(instructions, display) {
  let div = document.createElement("div");
  div.className = "instructionDisplay";

  let h3 = document.createElement("h3");
  h3.textContent = "Instructions";
  div.append(h3);

  let list = document.createElement("ol");
  list.id = "instructionList";

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
  list.style.display = display;
  div.append(list);
  return div;
}

function displayRecipe(index, ingDisplay, instDisplay) {
  let recipeObj = recipes[index];
  displayArea = document.querySelector(".recipeDisplay");
  //clear displayArea
  displayArea.innerHTML = "";

  let h2 = document.createElement("H2");
  h2.textContent = recipeObj.recipe;
  displayArea.append(h2);

  displayArea.append(displayInfo(recipeObj));
  displayArea.append(displayIngredients(recipeObj.ingredients, ingDisplay));
  displayArea.append(displayInstructions(recipeObj.instructions, instDisplay));
}

function addIngredient(){
  let p = document.createElement('p');
  p.innerHTML = 
  `
  <label>Amount: <input type="number" name="ingredients" step=".1" min=".1"/></label>
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

//temporarily loads image to disply a preview of selected file
function previewImage(event){
  let reader = new FileReader();
  reader.onload = () => {
    let output = document.querySelector("#imagePreview");
    output.src = reader.result;
  }  
  reader.readAsDataURL(event.target.files[0]);
}

function changeServings(serving){
  modifier = serving;
  displayRecipe(
    document.querySelector("#recipeSelect").selectedIndex,
    document.querySelector("#ingredientList").style.display,
    document.querySelector("#instructionList").style.display
  );
}

window.addEventListener("load", async () => {
  await getData();
  let select = document.querySelector("#recipeSelect");
  //hide select if no options are available
  if(select.length == 0){
    select.style.display = 'none';
  }
  let form = document.querySelector(".inputForm");
  form.style.display = "none";
  if(recipes.length == 0){
    alert("No Recipes Found");
    form.style.display = "block";
  }else{
      displayRecipe(0, "none", "none");
  }
  select.addEventListener("change", (e) => {
    displayRecipe(select.selectedIndex,
      document.querySelector("#ingredientList").style.display,
      document.querySelector("#instructionList").style.display
      );
  });

  document.querySelector("#newRecipe").addEventListener("click", e => {
    if( form.style.display != 'none'){
      form.style.display = "none";
    }else{
      form.style.display = "block";
    }
  });

  let servingSize = document.querySelectorAll("[name=servingSelect]");
  servingSize.forEach(radio =>{
    radio.addEventListener("click", () => {
    changeServings(radio.value);
    }
  )});

  document.querySelector("[name= 'photo']").addEventListener("change", event =>{
    previewImage(event);
  })

  document.querySelector('#addIngredient').addEventListener("click", addIngredient);

  document.querySelector('#addInstruction').addEventListener("click", addInstruction);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let response = await fetch("/api", {
      method: "post",
      body: new FormData(form),
    }).catch((error) => {
      console.log(error);
    });
    let result = await response.json();
    await getData();
  });
});
