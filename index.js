const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const fetch = require('node-fetch');
const config = require('./config');

// Replace with your own MongoDB connection string
const mongoUrl = 'mongodb://localhost:27017';

// Connect to the MongoDB database
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) {
        console.error(err);
        return;
    }
    //================================
    //ALL HANDLING HERE
    //================================
    const db = client.db(config.database);
    console.log('Connected to MongoDB');

    // Function to create a nutrition plan for a user
    function createNutritionPlan(userId, age, weight, height, activityLevel) {
        // Calculate daily calorie needs and macronutrient ratios based on user's stats and activity level
        // Use an external API or formula to calculate calorie needs
        const calorieApiUrl = `https://www.calculator.net/calorie-calculator.html?age=${age}&weight=${weight}&height=${height}&activity=${activityLevel}&s=bmr`;
        fetch(calorieApiUrl)
            .then(res => res.text())
            .then(body => {
                // Extract the calorie needs from the API response
                const calorieMatch = body.match(/Your Basal Metabolic Rate is \d+,/);
                if (calorieMatch) {
                    const calories = calorieMatch[0].replace('Your Basal Metabolic Rate is ', '').replace(',', '');
                    // Calculate macronutrient ratios based on calorie needs
                    const protein = Math.round(calories * 0.4 / 4); // 40% protein, 4 calories per gram of protein
                    const fat = Math.round(calories * 0.3 / 9); // 30% fat, 9 calories per gram of fat
                    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4); // 30% carbs, 4 calories per gram of carbs
                    // Save the nutrition plan to the database
                    db.collection(config.collection).insertOne({
                        userId: userId,
                        calories: calories,
                        protein: protein,
                        fat: fat,
                        carbs: carbs
                    });
                }
            });
    }

    // Function to update a nutrition plan for a user
    function updateNutritionPlan(userId, age, weight, height, activityLevel) {
        // Calculate daily calorie needs and macronutrient ratios based on user's stats and activity level
        // Use an external API or formula to calculate calorie needs
        const calorieApiUrl = `https://www.calculator.net/calorie-calculator.html?age=${age}&weight=${weight}&height=${height}&activity=${activityLevel}&s=bmr`;
        fetch(calorieApiUrl)
            .then(res => res.text())
            .then(body => {
                // Extract the calorie needs from the API response
                const calorieMatch = body.match(/Your Basal Metabolic Rate is \d+,/);
                if (calorieMatch) {
                    const calories = calorieMatch[0].replace('Your Basal Metabolic Rate is ', '').replace(',', '');
                    // Calculate macronutrient ratios based on calorie needs
                    const protein = Math.round(calories * 0.4 / 4); // 40% protein, 4 calories per gram of protein
                    const fat = Math.round(calories * 0.3 / 9); // 30% fat, 9 calories per gram of fat
                    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4); // 30% carbs, 4 calories per gram of carbs
                    // Update the nutrition plan in the database
                    db.collection(config.collection).updateOne(
                        { userId: userId },
                        {
                            $set: {
                                calories: calories,
                                protein: protein,
                                fat: fat,
                                carbs: carbs
                            }
                        }
                    );
                }
            });
    }

    // Function to get a nutrition plan for a user
    function getNutritionPlan(userId) {
        // Retrieve the nutrition plan from the database
        const plan = db.collection(config.collection).findOne({ userId: userId });
        return `${plan.calories} calories, ${plan.protein}g protein, ${plan.fat}g fat, ${plan.carbs}g carbs`;
    }

    const discordClient = new Discord.Client();

    discordClient.on('ready', () => {
        console.log(`Logged in as ${discordClient.user.tag}!`);
    });

    discordClient.on('message', message => {
        // Check if message starts with the prefix "!nutrition"
        if (message.content.startsWith('!nutrition')) {
            // Split the message into individual words
            const args = message.content.split(' ');

            // Get the command and any additional arguments
            const command = args[1];
            const params = args.slice(2);

            if (command === 'create') {
                // Create a new nutrition plan for the user
                if (params.length !== 4) {
                    message.channel.send(`${message.author.username}, invalid number of arguments. Use the format: !nutrition create [age] [weight (in kg)] [height (in cm)] [activity level]`);
                } else {
                    const age = parseInt(params[0]);
                    const weight = parseInt(params[1]);
                    const height = parseInt(params[2]);
                    const activityLevel = params[3];
                    //Checks whether or not age, weight and height are valid numbers
                    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
                        message.channel.send(`${message.author.username}, invalid arguments. Age, weight, and height must be numbers.`);
                        //Checks whether the activityLevel argument is a valid one
                    } else if (!activityLevel.match(/^(sedentary|light|moderate|active|very active)$/)) {
                        message.channel.send(`${message.author.username}, invalid activity level. Valid options are: sedentary, light, moderate, active, very active.`);
                    } else {
                        createNutritionPlan(message.author.id, age, weight, height, activityLevel);
                        message.channel.send(`${message.author.username}, your nutrition plan has been created! Use the "view" command to see your plan.`);
                    }
                }

            } else if (command === 'update') {
                // Create a new nutrition plan for the user
                if (params.length !== 4) {
                    message.channel.send(`${message.author.username}, invalid number of arguments. Use the format: !nutrition create [age] [weight (in kg)] [height (in cm)] [activity level]`);
                } else {
                    const age = parseInt(params[0]);
                    const weight = parseInt(params[1]);
                    const height = parseInt(params[2]);
                    const activityLevel = params[3];
                    //Checks whether or not age, weight and height are valid numbers
                    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
                        message.channel.send(`${message.author.username}, invalid arguments. Age, weight, and height must be numbers.`);
                        //Checks whether the activityLevel argument is a valid one
                    } else if (!activityLevel.match(/^(sedentary|light|moderate|active|very active)$/)) {
                        message.channel.send(`${message.author.username}, invalid activity level. Valid options are: sedentary, light, moderate, active, very active.`);
                    } else {
                        updateNutritionPlan(message.author.id, age, weight, height, activityLevel);
                        message.channel.send(`${message.author.username}, your nutrition plan has been created! Use the "view" command to see your plan.`);
                    }
                }
            } else if (command === 'view') {
                // View the user's nutrition plan
                const plan = getNutritionPlan(message.author.id);
                message.channel.send(`${message.author.username}, here is your nutrition plan:\n${plan}`);

            } else if (command === 'delete') {
                // Check if the author has the necessary permissions to delete a nutrition plan
                if (message.author.id !== '343561587455557632') {
                    message.channel.send(`${message.author.username}, you do not have permission to delete nutrition plans.`);
                    return;
                }
                // Check if the user to delete was specified as a mention
                if (message.mentions.users.size === 0) {
                    message.channel.send(`${message.author.username}, please specify the user to delete as a mention.`);
                    return;
                }
                // Get the first mentioned user (should only be one)
                const userToDelete = message.mentions.users.first();
                // Delete the nutrition plan from the database
                db.collection(config.collection).deleteOne({ userId: userToDelete.id });
                message.channel.send(`${message.author.username}, the nutrition plan for ${userToDelete.username} has been deleted.`);

            } else if (command === 'help') {
                // Show the list of available commands
                const embed = new Discord.MessageEmbed()
                    .setTitle('Nutrition Bot Commands')
                    .addField('!nutrition create [age] [weight (in kg)] [height (in cm)] [activity level]', 'Create a new nutrition plan based on the provided age, weight, height, and activity level.', 'Activity Levels: sedentary, lightly active, moderately active, very active, extra active')
                    .addField('!nutrition view', 'View your current nutrition plan.')
                    .addField('!nutrition update [age] [weight (in kg)] [height (in cm)] [activity level]', 'Update your nutrition plan with new age, weight, height, and activity level.')
                    .addField('!nutrition delete', 'Delete your nutrition plan.')
                    .addField('!nutrition help', 'Show this list of commands.')
                message.channel.send(embed);

            } else {
                message.channel.send(`${message.author.username}, invalid command. Use the "help" command to see a list of available commands.`);
            }
        }
    });

    discordClient.login(config.botToken);
})