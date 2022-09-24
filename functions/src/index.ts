import * as functions from "firebase-functions";

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const consonantsPerPlayer = 7;
const vowelsPerPlayer = 4;

export const createGame = functions.https.onRequest((request, response) => {

    let ATiles: any = {};
    let AConsonants: any = {};
    let AVowels: any = {};
    let BTiles: any = {};
    let BConsonants: any = {};
    let BVowels: any = {};
    let newTileNum = null
    let i;

    let ref = admin.database().ref('tiles');

    ref.on('value', function(snapshot: any) {
        let tiles = snapshot.exportVal();
        let consonants = tiles['consonants'];
        let vowels = tiles['vowels'];
        console.log(vowels);

        // 1. Fetch Consonants for Player A
        for (i = 0; i < consonantsPerPlayer; i++) {
            do {
                newTileNum =  Math.floor(Math.random() * Object.keys(consonants).length + 1);           
            } while (AConsonants[newTileNum])
            AConsonants[newTileNum] = consonants[newTileNum];
        }
        
        // 2. Fetch Consonants for Player B
        for (i = 0; i < consonantsPerPlayer; i++) {
            do {
                newTileNum =  Math.floor(Math.random() * Object.keys(consonants).length + 1);
            } while (AConsonants[newTileNum] || BConsonants[newTileNum])
            BConsonants[newTileNum] = consonants[newTileNum];
        }

        // 3. Fetch Vowels for Player B
        for (i = 0; i < vowelsPerPlayer; i++) {
            do {
                newTileNum =  Math.floor(Math.random() * Object.keys(vowels).length + 1);
            } while (BVowels[newTileNum])
            BVowels[newTileNum] = vowels[newTileNum];
        }
        
        // 4. Fetch Vowels for Player A
        for (i = 0; i < vowelsPerPlayer; i++) {
            do {
                newTileNum =  Math.floor(Math.random() * Object.keys(vowels).length + 1);
            } while (BVowels[newTileNum] || AVowels[newTileNum])
            AVowels[newTileNum] = vowels[newTileNum];
        }

        // 5. Combine Consonants and Vowels for each player
        ATiles.consonants = Object.values(AConsonants).valueOf();
        ATiles.vowels = Object.values(AVowels).valueOf();
        BTiles.consonants = Object.values(BConsonants).valueOf();
        BTiles.vowels = Object.values(BVowels).valueOf();

        console.log("ATiles:");
        console.log(ATiles);
        console.log("BTiles:");
        console.log( BTiles);
        response.send(ATiles);

    });
    
    
});
