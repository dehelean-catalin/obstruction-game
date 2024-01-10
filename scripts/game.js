"use strict";

(function () {
	const BASE_URL = "https://obstruction-backend-production.up.railway.app/api";
	const ERROR_MESSAGE = "EROARE_TABLA";
	const FINAL_MESSAGE = "FINAL";
	const NOT_FOUND_MESSAGE = "NU_EXISTA";
	const WIN_MESSAGE = "Congratulations you won";
	const LOSE_MESSAGE = "You lost";

	const urlSearchParams = new URLSearchParams(window.location.search);

	const firstPlayer = urlSearchParams.get("first");
	let formula = urlSearchParams.get("formula");
	const name = urlSearchParams.get("name");

	let playerScore = Number(sessionStorage.getItem("playerScore")) ?? 0;
	let computerScore = Number(sessionStorage.getItem("computerScore")) ?? 0;

	setPlayerName(name);
	setScore("player", playerScore);
	setScore("computer", computerScore);

	let playerMove = "X";
	let computerMove = "O";
	const isComputerPlayingFirst = firstPlayer === "no";
	let isFetchPending = false;

	if (isComputerPlayingFirst) {
		computerMove = "X";
		playerMove = "O";
	}

	const { rowsCount, colsCount, positions } = convertFormula(formula);
	const isBoardEmpty = checkEmptyBoard(positions);

	const board = createBoard(rowsCount, colsCount);
	const playBtn = document.querySelector("[data-control=play]");
	const resetBtn = document.querySelector("[data-control=reset]");

	if (isComputerPlayingFirst && isBoardEmpty) {
		makeComputerMove();
	}

	board.addEventListener("click", makePlayerMove);
	resetBtn.addEventListener("click", resetScore);
	playBtn.addEventListener("click", playAgain);

	async function makePlayerMove(e) {
		if (isFetchPending) {
			return;
		}

		if (!isPositionAvailable(e.target)) {
			return;
		}

		const currentPosition = e.target.getAttribute("data-cell");

		const index = calculateFormulaIndex(currentPosition, colsCount);
		formula = updateFormula(formula, index, playerMove);

		let playerElement = createPlayerElemet();
		let computerElement = createComputerElement();

		if (isComputerPlayingFirst) {
			playerElement = createComputerElement();
			computerElement = createPlayerElemet();
		}

		e.target.append(playerElement);

		let data;

		try {
			isFetchPending = true;
			console.log(isFetchPending);
			data = await fetchData(`${BASE_URL}?formula=${formula}`);
		} finally {
			isFetchPending = false;
		}

		console.log(isFetchPending);

		let showEndGameMessage = false;

		if (data.includes(NOT_FOUND_MESSAGE)) {
			alert(WIN_MESSAGE);
			playerScore++;
			sessionStorage.setItem("playerScore", playerScore);
			setScore("player", playerScore);
			return;
		}

		if (data === ERROR_MESSAGE) {
			e.target.removeChild(playerElement);
			formula = updateFormula(formula, index, "_");

			return;
		}

		if (data.includes(FINAL_MESSAGE)) {
			data = data[0] + data[1];
			computerScore++;
			sessionStorage.setItem("computerScore", computerScore);
			setScore("computer", computerScore);
			showEndGameMessage = true;
		}

		const computerIndex = calculateFormulaIndex(data, colsCount);
		formula = updateFormula(formula, computerIndex, computerMove);

		updateElement(data, computerElement);

		if (showEndGameMessage) {
			setTimeout(() => alert(LOSE_MESSAGE), 100);
		}
	}

	async function makeComputerMove() {
		let data;
		isFetchPending = true;

		try {
			data = await fetchData(`${BASE_URL}?formula=${formula}`);
		} finally {
			isFetchPending = false;
		}

		if (data === ERROR_MESSAGE) {
			return;
		}

		const index = calculateFormulaIndex(data, colsCount);
		formula = updateFormula(formula, index, computerMove);

		const computerElement = createPlayerElemet();
		updateElement(data, computerElement);
	}

	// GAME CONTROLS
	function resetScore() {
		sessionStorage.clear();

		playerScore = 0;
		computerScore = 0;

		setScore("player", playerScore);
		setScore("computer", computerScore);
	}

	function playAgain() {
		formula = urlSearchParams.get("formula");
		const imgs = Array.from(board.getElementsByTagName("img"));

		for (let i = 0; i < imgs.length; i++) {
			imgs[i].parentNode.removeChild(imgs[i]);
		}
	}
})();

function setPlayerName(name) {
	document.querySelector("[data-player-name]").textContent = name + ":";
}

function setScore(name, score) {
	const element = document.querySelector(`[data-score=${name}]`);

	if (element) {
		element.textContent = score;
	}
}

function convertFormula(formula) {
	const rowsCount = Number(formula[0]);
	const colsCount = Number(formula[1]);

	const positions = formula.slice(2);

	return { colsCount, rowsCount, positions };
}

function checkEmptyBoard(positions) {
	return !positions.split("").filter((ch) => ch != "_").length;
}

function createComputerElement() {
	const circleElement = document.createElement("img");
	circleElement.setAttribute("src", "assets/circle.svg");
	circleElement.setAttribute("height", "70");
	circleElement.setAttribute("width", "70");
	circleElement.setAttribute("alt", "");
	circleElement.classList.add("zero");

	return circleElement;
}

function createPlayerElemet() {
	const crossElement = document.createElement("img");
	crossElement.setAttribute("src", "assets/cross.svg");
	crossElement.setAttribute("height", "70");
	crossElement.setAttribute("width", "70");
	crossElement.setAttribute("alt", "");
	crossElement.classList.add("zero");

	return crossElement;
}

function updateFormula(formula, index, move) {
	const newFormula = formula.split("");
	newFormula[index] = move;

	return newFormula.join("");
}

function updateElement(index, element) {
	const cellElement = document.querySelector(`[data-cell='${index}']`);

	cellElement?.append(element);
}

function calculateFormulaIndex(currentPosition, colsCount) {
	const position = Number(currentPosition);
	const rowIndex = Math.floor(position / 10);
	const colIndex = position % 10;

	const index = rowIndex * colsCount + colIndex;

	return index + 2;
}

function createBoard(rowsCount, colsCount) {
	const board = document.querySelector("[data-board]");

	for (let i = 0; i < rowsCount; i++) {
		const row = document.createElement("div");
		row.setAttribute("data-row", i);

		board.appendChild(row);

		for (let j = 0; j < colsCount; j++) {
			const cell = document.createElement("div");
			cell.setAttribute("data-cell", `${i}${j}`);
			cell.classList.add(
				"board-cell",
				colsCount > 5 || rowsCount > 5 ? "small" : "big"
			);

			row.appendChild(cell);
		}
	}

	return board;
}

function isPositionAvailable(target) {
	const childrenCount = Array.from(target.children).length;
	const isBoardCell = target.getAttribute("data-cell");

	if (childrenCount || !isBoardCell) {
		return false;
	}

	return true;
}

async function fetchData(url) {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			if (response.status === 400) {
				const error = await response.json();
				return error.message;
			}
		}

		const data = await response.text();

		return data;
	} catch (error) {
		return error.message;
	}
}
