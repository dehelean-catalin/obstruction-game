"use strict";

(function () {
	const urlSearchParams = new URLSearchParams(window.location.search);

	const firstPlayer = urlSearchParams.get("first");
	let formula = urlSearchParams.get("formula");

	const rowsCount = Number(formula[0]);
	const colsCount = Number(formula[1]);

	const board = document.querySelector("[data-board]");

	initializeBoard(board, rowsCount, colsCount);

	board.addEventListener("click", (e) => makeMove(e, firstPlayer, formula));

	const baseUrl = "http://localhost:8081/api";

	document.addEventListener("DOMContentLoaded", fetchData);

	async function makeMove(e) {
		const xMove = document.createElement("p");

		const oMove = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		oMove.setAttribute("width", "100");
		oMove.setAttribute("height", "100");

		const circleElement = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle"
		);
		circleElement.setAttribute("cx", "50");
		circleElement.setAttribute("cy", "50");
		circleElement.setAttribute("r", "50");
		circleElement.setAttribute("fill", "blue");

		oMove.appendChild(circleElement);

		const move = firstPlayer == "on" ? "X" : "O";
		const computerMove = firstPlayer == "on" ? "O" : "X";

		if (e.target.tagName.toLowerCase() !== "div") {
			return;
		}

		if (e.target.querySelector("p")) {
			console.log("Position is taken by X");
			return;
		}

		if (e.target.querySelector("circle")) {
			console.log("Position is taken by 0");
			return;
		}

		const strPosition = e.target.getAttribute("data-cell");

		const index = calculateFormulaIndex(strPosition, colsCount);

		const newFormula = formula.split("");
		newFormula[index] = move;

		e.target.append(firstPlayer == "on" ? xMove : oMove);
		formula = newFormula.join("");

		const data = await fetchData(`${baseUrl}?formula=${formula}`);

		if (data === "EROARE_TABLA") {
			e.target.removeChild(firstPlayer == "on" ? xMove : oMove);
			newFormula[index] = "_";
			formula = newFormula.join("");
			return;
		}

		if (data.includes("FINAL")) {
			const position = data[0] + data[1];
			const cpMoveElement = document.querySelector(`[data-cell='${position}']`);
			const newComputerIndex = calculateFormulaIndex(data, colsCount);
			newFormula[newComputerIndex] = computerMove;

			cpMoveElement.append(firstPlayer == "on" ? oMove : xMove);
			formula = newFormula.join("");

			setTimeout(() => alert("Ai pierdut"), 10);

			return;
		}

		if (data.includes("NU_EXISTA")) {
			alert("Ai castigat");
			return;
		}

		const cpMoveElement = document.querySelector(`[data-cell='${data}']`);
		const newComputerIndex = calculateFormulaIndex(data, colsCount);

		newFormula[newComputerIndex] = computerMove;

		cpMoveElement.append(firstPlayer == "on" ? oMove : xMove);
		formula = newFormula.join("");
	}
})();

function calculateFormulaIndex(strPosition, colsCount) {
	const position = Number(strPosition);
	const rowIndex = Math.floor(position / 10);
	const colIndex = position % 10;

	const index = rowIndex * colsCount + colIndex;

	return index + 2;
}

function initializeBoard(board, rowsCount, colsCount) {
	for (let i = 0; i < rowsCount; i++) {
		const row = document.createElement("div");
		row.setAttribute("data-row", i);

		board.appendChild(row);

		for (let j = 0; j < colsCount; j++) {
			const cell = document.createElement("div");
			cell.setAttribute("data-cell", `${i}${j}`);
			cell.classList.add("board-cell", colsCount > 6 ? "small" : "big");

			row.appendChild(cell);
		}
	}
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
