"use strict";

(function () {
	const form = document.querySelector("[data-form='form']");

	function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData(form);

		const gridSize = formData.get("grid-size");

		const size = generateMoves(gridSize);
		const gameMoves = createMoves(size);

		formData.set("formula", gridSize + gameMoves);
		formData.delete("grid-size");

		const queryString = "?" + new URLSearchParams(formData).toString();

		window.location.href = "game.html" + queryString;
	}

	function generateMoves(gridSize) {
		const size = Number(gridSize);

		const colsCount = size % 10;
		const rowsCount = Math.floor(size / 10);

		return colsCount * rowsCount;
	}

	function createMoves(size) {
		return "_".repeat(size);
	}

	form.addEventListener("submit", handleSubmit);
})();
