class GenerateAndMoveTiles {
    /**
     * Constructor function for the GenerateAndMoveTiles class
     *
     * This function sets up the initial state of the game, including the tile height, tile speed, and the game interval.
     * It also calls the initializeHighScore function to set up the high score.
     */
    constructor() {
        this.tileHeight = window.innerHeight / 4;
        this.tileSpeed = 0.2;
        this.prevRandomNum = 0;
        this.gameInterval = null;
        this.score = 0;
        this.scoreElem = document.querySelector(".score");
        this.highScoreElem = document.querySelector(".game_high_score_value");
        this.initializeHighScore();
        this.gameTiles = document.querySelector(".game-tiles-container");
        this.tilesContainer1 = document.querySelector(".tiles-container1");
        this.tilesContainer2 = document.querySelector(".tiles-container2");
        this.tileRowHeight = {};
        this.tileRowPosition = {};
    }

    /**
     * This function initializes the high score by checking if the local storage has a high score value.
     * If it does, it sets the high score value to that value.
     * If it doesn't, it sets the high score value to 0.
     */
    initializeHighScore() {
        if (!localStorage?.getItem('highScore')) {
            localStorage.setItem('highScore', 0);
        }
        this.highScoreElem.innerHTML = localStorage.getItem('highScore');
    }

    /**
     * This function generates a random number between 0 and 3, but ensures that the number is not the same as the previous number.
     * It does this by using a do-while loop to keep generating numbers until it finds one that is not the same as the previous number.
     */
    getRandomNum() {
        let pressable;
        do {
            pressable = Math.floor(Math.random() * 4);
        } while (pressable === this.prevRandomNum);
        this.prevRandomNum = pressable;
        return pressable;
    }

    /**
     * This function creates a tile row and appends it to the specified container.
     * It creates a div element with the class "tile-row", and then creates 4 div elements with the class "tile" and appends them to the row.
     * It also sets the attribute "tile-clicked" to "false" on each tile.
     * It then appends the row to the specified container.
     */
    createTileRow(container) {
        const tileRow = document.createElement("div");
        tileRow.className = "tile-row";
        const randomNum = this.getRandomNum();

        for (let i = 0; i < 4; i++) {
            const tile = document.createElement("div");
            tile.className = `tile${randomNum === i ? " pressable" : ""}`;
            tile.setAttribute("tile-clicked", "false");
            tile.addEventListener("click", () => this.handleTileClick(tile));
            tileRow.appendChild(tile);
        }

        container.appendChild(tileRow);
    }

    /**
     * This function handles the click event on a tile.
     * If the tile is pressable, it sets the attribute "tile-clicked" to "true" and calls the registerTap function with the arguments (tile, 0).
     * If the tile is not pressable, it calls the registerTap function with the arguments (tile, 2).
     */
    handleTileClick(tile) {
        if (tile.classList.contains("pressable")) {
            tile.setAttribute("tile-clicked", "true");
            this.registerTap(tile, 0);
        } else {
            this.registerTap(tile, 2);
        }
    }

    /**
     * This function generates the specified number of tile rows and appends them to the specified container.
     */
    generateTileRows(container, count = 10) {
        for (let i = 0; i < count; i++) {
            this.createTileRow(container);
        }
    }

    /**
     * This function starts the game by resetting the game state, generating the tile rows, setting the tile row positions, and starting the game interval.
     */
    playGame() {
        gsap.to(this.gameTiles, { translateY: window.innerHeight });
        gsap.to(this.scoreElem, { top: 0 });
        this.resetGame();
        this.generateTileRows(this.tilesContainer1);
        this.generateTileRows(this.tilesContainer2);
        this.setTileRowPositions();
        this.startGameInterval();
    }

    /**
     * This function resets the game state by setting the score to 0, clearing the tile containers, and resetting the tile speed.
     */
    resetGame() {
        this.score = 0;
        this.tilesContainer1.innerHTML = "";
        this.tilesContainer2.innerHTML = "";
    }

    /**
     * This function sets the initial positions of the tile rows.
     * It sets the top position of each tile row to be negative its height, and then sets the top position of the second row to be negative the height of both rows.
     */
    setTileRowPositions() {
        this.tileRowHeight = {
            row1: this.tilesContainer1.clientHeight,
            row2: this.tilesContainer2.clientHeight,
        };
        this.tileRowPosition = {
            row1: -this.tileRowHeight.row1 - window.innerHeight,
            row2: -(this.tileRowHeight.row1 + this.tileRowHeight.row2) - window.innerHeight,
        };
        this.tilesContainer1.style.top = `${this.tileRowPosition.row1}px`;
        this.tilesContainer2.style.top = `${this.tileRowPosition.row2}px`;
    }

    /**
     * This function starts the game interval, which updates the game state every 10 milliseconds.
     */
    startGameInterval() {
        this.gameInterval = setInterval(() => {
            this.updateScore();
            this.updateTilePositions();
            this.checkBelowScreen();
        }, 10);
    }

    /**
     * This function updates the score by incrementing it by 1 and then updating the high score.
     */
    updateScore() {
        this.score++;
        const highScore = Math.max(this.score, localStorage.getItem('highScore'));
        localStorage.setItem('highScore', highScore);
        this.highScoreElem.innerHTML = highScore;
    }

    /**
     * This function updates the tile positions by moving the tile rows up by 2 pixels each frame.
     * If the top of the first row is above the bottom of the screen, it resets the position of the first row.
     * If the top of the second row is above the bottom of the screen, it resets the position of the second row.
     */
    updateTilePositions() {
        this.tileRowPosition.row1 += 20 * this.tileSpeed;
        this.tileRowPosition.row2 += 20 * this.tileSpeed;

        if (this.tileRowPosition.row1 >= 0) {
            this.resetTileRowPosition('row1', this.tilesContainer1);
        }

        if (this.tileRowPosition.row2 >= 0) {
            this.resetTileRowPosition('row2', this.tilesContainer2);
        }

        gsap.to(this.tilesContainer1, { duration: 0, ease: 'none', top: `${this.tileRowPosition.row1}px`, opacity: 1 });
        gsap.to(this.tilesContainer2, { duration: 0, ease: 'none', top: `${this.tileRowPosition.row2}px`, opacity: 1 });
    }

    /**
     * This function resets the position of the specified tile row by setting its top position to be negative its height, and then setting the top position of the second row to be negative the height of both rows.
     */
    resetTileRowPosition(row, container) {
        this.tileRowPosition[row] = -this.tileRowHeight[row] + this.tileRowPosition[row === 'row1' ? 'row2' : 'row1'];
        container.innerHTML = "";
        this.generateTileRows(container);
        this.tileSpeed += 0.05;
    }

    /**
     * This function checks if there are any tiles below the screen and if so, it calls the registerTap function with the arguments (tile, 1).
     */
    checkBelowScreen() {
        const c1Showing = this.tileRowPosition.row1 > this.tileRowPosition.row2;
        document.querySelectorAll(`.tiles-container${c1Showing ? 1 : 2} .tile.pressable`).forEach((elem) => {
            if (Math.abs(this.tileRowPosition.row1) - 2 <= elem.offsetTop && elem.getAttribute("tile-clicked") === "false") {
                this.registerTap(elem, 1);
            }
            if (Math.abs(this.tileRowPosition.row2) - 2 <= elem.offsetTop && elem.getAttribute("tile-clicked") === "false") {
                this.registerTap(elem, 1);
            }
        });
    }

    /**
     * This function animates the score by scaling it up and then back down.
     */
    animateScore() {
        gsap.to(this.scoreElem, { duration: 0.3, scale: 1.2 });
        gsap.to(this.scoreElem, { delay: 0.3, duration: 0.7, ease: 'elastic', scale: 1 });
    }

    /**
     * This function registers a tap on a tile.
     * If the tile is pressable, it increments the score and calls the animateScore function.
     * If the tile is not pressable, it stops the game and calls the stopGame function.
     */
    registerTap(elem, type) {
        switch (type) {
            case 0:
                gsap.to(elem, { duration: 0.3, opacity: 0 });
                this.score++;
                this.animateScore();
                break;
            case 1:
                this.adjustTileRowPosition();
                break;

