"use strict";

(function () {
	const BASE_URL = "http://localhost:8081/api";
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

		let data = await fetchData(`${BASE_URL}?formula=${formula}`);
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
		const data = await fetchData(`${BASE_URL}?formula=${formula}`);

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
		const paragraphs = Array.from(board.getElementsByTagName("p"));
		const svgs = Array.from(board.getElementsByTagName("svg"));

		for (let i = 0; i < paragraphs.length; i++) {
			paragraphs[i].parentNode.removeChild(paragraphs[i]);
		}

		for (let i = 0; i < svgs.length; i++) {
			svgs[i].parentNode.removeChild(svgs[i]);
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
	const svgElement = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"svg"
	);
	svgElement.setAttribute("width", "100");
	svgElement.setAttribute("height", "100");

	const circleElement = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"circle"
	);
	circleElement.setAttribute("cx", "50");
	circleElement.setAttribute("cy", "50");
	circleElement.setAttribute("r", "50");
	circleElement.setAttribute("fill", "blue");

	svgElement.appendChild(circleElement);

	return svgElement;
}

function createPlayerElemet() {
	const playerElement = document.createElement("p");
	playerElement.classList.add("cross");

	return playerElement;
}

function updateFormula(formula, index, move) {
	console.log(formula);
	const newFormula = formula.split("");
	newFormula[index] = move;

	return newFormula.join("");
}

function updateElement(index, element) {
	const cellElement = document.querySelector(`[data-cell='${index}']`);
	cellElement.append(element);
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
	if (target.tagName.toLowerCase() !== "div") {
		return false;
	}

	if (target.querySelector("p")) {
		console.log("Position is taken by X");
		return false;
	}

	if (target.querySelector("circle")) {
		console.log("Position is taken by 0");
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
		console.log(error);
	}
}
