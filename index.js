import express from "express";
import axios from "axios";
import bodyParser from "body-parser"


const app = express();
const port = 3000;
const API_URL = "https://www.themealdb.com/api/json/v1/1/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", async(req, res) => {
    try {
        res.render("index.ejs", {
            mealName: "",
            ingredients: [],
            mealImage:"",
            mealCategory: "",
            mealInstruction: [],
            error: null,
            isDefaultPage: true,
            currentRoute: "/",

        })
    }catch (error){
        console.error("Error rendering page:", error);
        res.status(500).send("Error rendering page");
    }
});

app.get('/recipe', async(req, res) => {
    try{
        res.render("index.ejs", { 
            mealName: "",
            ingredients: [],
            mealImage: "",
            mealCategory: "",
            mealInstruction: [],
            error: null,
            isDefaultPage: false,
            currentRoute: "/recipe", 
        });

    }catch (error){
        console.error("Error rendering page:", error);
        res.status(500).send("Error rendering page");
    }
    
});
  
app.post("/recipe", async (req, res) => {
    
    

    try{
        let result;
        

        if (req.body.random !== undefined){
            result = await axios.get(API_URL + "random.php");

        } else if (req.body.categories){
            //Recipe based on the choice made
            const choice = req.body.categories;
            const categoryResult = await axios.get(API_URL + "filter.php?c=" + choice);

            // Check if meals exist for the selected category
            if (!categoryResult.data.meals || categoryResult.data.meals.length === 0) {
                return res.render("index.ejs", { 
                    error: "No meals found in this category.",  
                    mealName: "", 
                    mealCategory: "", 
                    mealImage: "", 
                    mealInstruction: [], 
                    ingredients: [], 
                    isDefaultPage: false,
                    currentRoute: "/recipe",
            });
        }

            //get the length or number of meals availbale in the choice made
            const mealLength = categoryResult.data.meals.length;

            //generate random index within the range of number of meals available
            const randomIndex = Math.floor(Math.random()*mealLength);
            const mealID = categoryResult.data.meals[randomIndex].idMeal;

            //To get the meal ID from the API
            result = await axios.get(API_URL + "lookup.php?i=" + mealID);

        }
         // Check if the result is valid
         if (!result.data.meals || result.data.meals.length === 0) {
            return res.render("index.ejs", { 
                error: "No recipe found!", 
                mealName: "", 
                mealCategory: "", 
                mealImage: "", 
                mealInstruction: [], 
                ingredients: [], 
                isDefaultPage: false,
                currentRoute: "/recipe",
        });
    }
    

        const meal = result.data.meals[0];
        const mealName = meal.strMeal;
        const mealCategory = meal.strCategory;
        const mealImage = meal.strMealThumb;
        const mealInstruction = meal.strInstructions ? meal.strInstructions.split('\n'): [];

        //const mealInstruction = meal.strInstructions;


        const ingredients = [];
        for (let i = 1; i <= 20; i++){ //loop running 20 times because themealdb has 20 ingredients and 20 measurement value
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];

            //Make sure that the ingredients does not have any empty space hence trimming the space if any
            if (ingredient && ingredient.trim() !== ''){
                ingredients.push({ingredient, measure});
            }
        }

        res.render("index.ejs", { 
            mealName, 
            mealCategory, 
            mealImage, 
            mealInstruction, 
            ingredients, 
            error: null, 
            isDefaultPage: true,
            currentRoute: "/recipe",

        });

        
    } catch(error){
        console.error("Error fetching recipe:", error);
        res.status(500).send("Error fetching recipe");
    }
});




app.listen(port, () =>{
    console.log(`Listening to port ${port}`);
});