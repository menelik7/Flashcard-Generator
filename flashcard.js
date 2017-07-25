//Call the appropriate requirements
var  inquirer = require("inquirer");
var BasicCards = require("./BasicCards.json");
var ClozeCards = require("./ClozeCards.json");
var BasicCard = require("./BasicCard.js");
var ClozeCard = require("./ClozeCard.js");
var colors = require('colors');
var fs = require("fs");

//Declare golbal variables
var drawnCard;
var playedCard;
var count = 0;

//Function to prompt the user to choose from the options presented
function openMenu() {
    inquirer.prompt([
        {
          type: "list",
          message: "\r\nWhat would you like to do?",
          choices: ["Create cards", "Run the existing cards", "Exit"],
          name: "options"
        }
    ]).then(function (answer) {

    switch (answer.options) {

        case 'Create cards':
            console.log("Ok lets make a new flashcard...");
            createCard();
            break;

        case 'Run the existing cards':
            console.log("OK...");
            whichTypeOfCard();
            break;

        case 'Exit':
            console.log("Thank you for using the Flashcard-Generator")
            return;
            break;

        default:
            console.log("");
            console.log("Sorry I don't understand");
            console.log("");
    }

  });

}

openMenu();

//Function that creates a card if the criteria is met.
function createCard() {
    inquirer.prompt([
        {
            type: "list",
            message: "What type of flashcard do you want to create?",
            choices: ["Basic Card", "Cloze Card"],
            name: "cardType"
        }

    ]).then(function (appData) {

        var cardType = appData.cardType;
        console.log(cardType);

        if (cardType === "Basic Card") {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please fill out the front of your card (Your Question).",
                    name: "front"
                },

                {
                    type: "input",
                    message: "Please fill out the back of your card (Your Answer).",
                    name: "back"
                }

            ]).then(function (cardData) {

                var cardObj = {
                    type: "BasicCard",
                    front: cardData.front,
                    back: cardData.back
                };
                BasicCards.push(cardObj);
                fs.writeFile("BasicCards.json", JSON.stringify(BasicCards, null, 2));

                inquirer.prompt([
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (appData) {
                    if (appData.anotherCard === "Yes") {
                        createCard();						
                    } else {						
                        setTimeout(openMenu, 1000);
                    }
                });
            });

        } else {//Else (if the anser isn't Basic it had to be Cloze)
            inquirer.prompt([
                {
                    type: "input",
                    message: "Please type out the full text of your statement (remove cloze in next step).",
                    name: "text"
                },

                {
                    type: "input",
                    message: "Please type the portion of text you want to cloze, replacing it with '...'.",
                    name: "cloze"
                }

            ]).then(function (cardData) {            //once we have the users cloze data run this function

                var cardObj = {						//builds and object from the text and cloze info
                    type: "ClozeCard",
                    text: cardData.text,
                    cloze: cardData.cloze
                };
                if (cardObj.text.indexOf(cardObj.cloze) !== -1) {   
                    ClozeCards.push(cardObj);							
                    fs.writeFile("ClozeCards.json", JSON.stringify(ClozeCards, null, 2)); 
                } else {
                    console.log("Sorry, The cloze must match some word(s) in the text of your statement.");

                }
                inquirer.prompt([					
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (appData) {				
                    if (appData.anotherCard === "Yes") {	
                        createCard();						
                    } else {								
                        setTimeout(openMenu, 1000);
                    }
                });
            });
        }

    });
};

//function used to get the question from the drawnCard in the askQuestions function
function getQuestion(card) {
    if (card.type === "BasicCard") {						
        drawnCard = new BasicCard(card.front, card.back);	
        return drawnCard.front;								
    } else if (card.type === "ClozeCard") {					
        drawnCard = new ClozeCard(card.text, card.cloze)	
        return drawnCard.clozeRemoved();
    }
};

//Allow the user to determine which type of cards to run.
function whichTypeOfCard(){
    inquirer.prompt([
        {
            type: "list",
            message: "What type of flashcard do you want to run?",
            choices: ["Basic Card", "Cloze Card"],
            name: "cardType"
        }
    ]).then(function (appData) {
        var cardType = appData.cardType;
        if (cardType === "Basic Card") {
            console.log("Let's get started with the Basics...")
            BasicCardsQuestions();
        } else {
            console.log("Let's get started with the Cloze...")
            ClozeCardsQuestions();
        }
    });
}
// //function to ask questions from all stored card in the library
function BasicCardsQuestions() {
    if (count < BasicCards.length) {					
        playedCard = getQuestion(BasicCards[count]);	
        inquirer.prompt([						
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
        ]).then(function (answer) {					
        	//if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === BasicCards[count].back || answer.question === BasicCards[count].cloze) {
                console.log(colors.green("You are correct."));
            } else {
            	//check to see if current card is Cloze or Basic
                if (drawnCard.front !== undefined) { //if card has a front then it is a Basic card
                    console.log(colors.red("Sorry, the correct answer was ") + BasicCards[count].back + ".");
                } else { // otherwise it is a Cloze card
                    console.log(colors.red("Sorry, the correct answer was ") + BasicCards[count].cloze + ".");
                }
            }
            count++; 		
            BasicCardsQuestions(); 
        });
    } else {
        console.log("\r\nThanks for playing dude/dudette!");
      	count=0;			//reset counter to 0 once loop ends
      	openMenu();			
    }
};

function ClozeCardsQuestions() {
    if (count < ClozeCards.length) {                  
        playedCard = getQuestion(ClozeCards[count]);  
        inquirer.prompt([                       
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
        ]).then(function (answer) {                 
            //if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === ClozeCards[count].back || answer.question === ClozeCards[count].cloze) {
                console.log(colors.green("You are correct."));
            } else {
                //check to see if current card is Cloze or Basic
                if (drawnCard.front !== undefined) { //if card has a front then it is a Basic card
                    console.log(colors.red("Sorry, the correct answer was ") + ClozeCards[count].back + ".");
                } else { // otherwise it is a Cloze card
                    console.log(colors.red("Sorry, the correct answer was ") + ClozeCards[count].cloze + ".");
                }
            }
            count++;        
            ClozeCardsQuestions(); 
        });
    } else {
        console.log("\r\nThanks for playing dude/dudette!");
        count=0;            //reset counter to 0 once loop ends
        openMenu();         
    }
};

