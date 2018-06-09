import KeyboardController from '../KeyboardController/KeyboardController';

export default class Fight {
	constructor(attacker, defender, generator) {
		this.attacker = attacker;
		this.defender = defender;
		this.round = 0;
		this.enableSelectingFlag = false;

		this.selectedUnit = this.attacker[0];
		this.activeUnit = this.attacker[0];

		this.selectedUnitIndex = 0;
		this.activeUnitIndex = 0;
		this.unitsAttackerCoordinates = [{ x: 200, y: 50 }, { x: 0, y: 360 }, { x: 400, y: 360 }];
		this.unitsDefenderCoordinates = [{ x: 900, y: 50 }, { x: 700, y: 360 }, { x: 1100, y: 360 }];

		this.generatorlvl = generator;

		this.canvas = document.getElementById('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.gameLoopRunning = false;
		this.fightModulCycle();

		return {
			'attacker': this.attacker,
			'defender': this.defender
		};
	}

	fightModulCycle() {
		this.showLoadingScreen();
		this.generateGameField();
		this.startGameLoop();
	}

	showLoadingScreen() {
		console.log('loading screen');
	}

	generateGameField() {
		console.log('generateGameField()');
	}

	startGameLoop() {
		const that = this;
		let now;
		let dt = 0;
		let last = timestamp();
		let step = 1 / 60;

		function timestamp() {
			return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
		}

		function frame() {
			if (that.gameLoopRunning) {
				now = timestamp();

				dt = dt + Math.min(1, (now - last) / 1000);
				while (dt > step) {
					dt = dt - step;
					that.update();
				}
				that.render();
				last = now;
				requestAnimationFrame(frame);
			}
		}

		this.gameLoopRunning = true;
		requestAnimationFrame(frame);
	}

	update() {
		if (this.isFightNotOver()) {
			this.updateSelecting();
			this.updateImpact();
		}
		else {
			this.gameLoopRunning = false;
			if (this.isGroupAlive(this.attacker)) {
				this.generatorlvl.next();
			}
		}
	}

	updateSelecting() {
		if (KeyboardController.pressedKeys.nextTarget) {
			KeyboardController.pressedKeys.nextTarget = false;
			this.selectedUnit = this.nextTarget();
		}
		else {
			if (KeyboardController.pressedKeys.prevTarget) {
				this.selectedUnit = this.prevTarget();
				KeyboardController.pressedKeys.prevTarget = false;
			}
		}

	}

	updateImpact() {
		if (KeyboardController.pressedKeys.impact) {
			this.impact(this.activeUnit, this.selectedUnit);
			KeyboardController.pressedKeys.impact = false;
			this.activeUnit = this.nextActiveUnit();
		}
	}

	render() {
		this.clearCanvas();
		this.drawSelectedUnitFlag();
		this.drawActiveUnitFlag();
		this.drawAttackerUnits();
		this.drawDefenderUnits();
		this.drawSelectAndActiveUnitsInfoBars(this.activeUnit, this.selectedUnit);
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawUnit(unit, posX, posY) {
		this.ctx.drawImage(unit.sprites.legs.image, unit.sprites.legs.sX, unit.sprites.legs.sY, unit.sprites.legs.width, unit.sprites.legs.height, unit.sprites.legs.dX + posX, unit.sprites.legs.dY + posY, unit.sprites.legs.width, unit.sprites.legs.height);
		this.ctx.drawImage(unit.sprites.body.image, unit.sprites.body.sX, unit.sprites.body.sY, unit.sprites.body.width, unit.sprites.body.height, unit.sprites.body.dX + posX, unit.sprites.body.dY + posY, unit.sprites.body.width, unit.sprites.body.height);
		this.ctx.drawImage(unit.sprites.head.image, unit.sprites.head.sX, unit.sprites.head.sY, unit.sprites.head.width, unit.sprites.head.height, unit.sprites.head.dX + posX, unit.sprites.head.dY + posY, unit.sprites.head.width, unit.sprites.head.height);
		this.ctx.drawImage(unit.sprites.hands.image, unit.sprites.hands.sX, unit.sprites.hands.sY, unit.sprites.hands.width, unit.sprites.hands.height, unit.sprites.hands.dX + posX, unit.sprites.hands.dY + posY, unit.sprites.hands.width, unit.sprites.hands.height);
	}

	drawSelectedUnitFlag() {
		let coord = this.getUnitObjCoordinates(this.selectedUnit);
		let x = coord.x;
		let y = coord.y;

		this.ctx.save();
		this.ctx.fillStyle = 'green';
		this.ctx.fillRect(x, y, 175, 275);
		this.ctx.restore();
	}

	drawActiveUnitFlag() {
		const coord = this.getUnitObjCoordinates(this.activeUnit);
		const x = coord.x;
		const y = coord.y;

		this.ctx.save();
		this.ctx.fillStyle = 'yellow';
		this.ctx.fillRect(x + 10, y + 5, 155, 265);
		this.ctx.restore();
	}

	getUnitObjCoordinates(unitObj) {
		let x;
		let y;
		if (this.attacker.indexOf(unitObj) !== -1) {
			let index = this.attacker.indexOf(unitObj);
			x = this.unitsAttackerCoordinates[index].x;
			y = this.unitsAttackerCoordinates[index].y;
		}
		else {
			let index = this.defender.indexOf(unitObj);
			x = this.unitsDefenderCoordinates[index].x;
			y = this.unitsDefenderCoordinates[index].y;
		}
		return { x: x, y: y };
	}

	drawAttackerUnits() {
		this.attacker.forEach((unit, index) => {
			this.drawUnit(this.attacker[index], this.unitsAttackerCoordinates[index].x, this.unitsAttackerCoordinates[index].y);
		});
	}

	drawDefenderUnits() {
		this.defender.forEach((unit, index) => {
			this.drawUnit(this.defender[index], this.unitsDefenderCoordinates[index].x, this.unitsDefenderCoordinates[index].y);
		});
	}

	drawSelectAndActiveUnitsInfoBars(activeUnit, selectedUnit) {
		const coordActive = this.getUnitObjCoordinates(activeUnit);
		const xActive = coordActive.x;
		const yActive = coordActive.y;

		const coordSelected = this.getUnitObjCoordinates(selectedUnit);
		const xSelected = coordSelected.x;
		const ySelected = coordSelected.y;

		this.ctx.save();

		this.ctx.fillStyle = 'white';
		const widthBar = 200;
		const heightBar = 50;
		this.ctx.fillRect(xActive, yActive - heightBar, widthBar, heightBar);
		if (activeUnit !== selectedUnit) {
			this.ctx.fillRect(xSelected, ySelected - heightBar, widthBar, heightBar);
		}

		this.ctx.fillStyle = 'black';
		this.ctx.font = '15px Arial';
		this.ctx.fillText(activeUnit.name, xActive, yActive - heightBar + 20);
		this.ctx.font = '25px Arial';
		this.ctx.fillText('HP ' + activeUnit.hp, xActive, yActive - heightBar + 40);
		if (activeUnit !== selectedUnit) {
			this.ctx.font = '15px Arial';
			this.ctx.fillText(selectedUnit.name, xSelected, ySelected - heightBar + 20);
			this.ctx.font = '25px Arial';
			this.ctx.fillText('HP ' + selectedUnit.hp, xSelected, ySelected - heightBar + 40);
		}

		this.ctx.restore();
	}

	isFightNotOver() {
		return this.isGroupAlive(this.attacker) && this.isGroupAlive(this.defender);
	}

	isGroupAlive(groupOfUnits) {
		return groupOfUnits.some(unit => unit.hp > 0);
	}

	isUnitAlive(unit) {
		return unit.hp > 0;
	}

	impact(atackerUnit, target) {
		target.hp = target.hp - 60;
	}

	nextTarget() {
		this.selectedUnitIndex++;
		if (this.selectedUnitIndex > this.attacker.length * 2 - 1) {
			this.selectedUnitIndex = 0;
		}
		if (this.selectedUnitIndex < this.attacker.length) {
			return this.attacker[this.selectedUnitIndex];
		}
		else {
			return this.defender[this.selectedUnitIndex - 3];
		}
	}

	prevTarget() {
		this.selectedUnitIndex--;
		if (this.selectedUnitIndex < 0) {
			this.selectedUnitIndex = this.attacker.length * 2 - 1;
		}
		if (this.selectedUnitIndex < this.attacker.length) {
			return this.attacker[this.selectedUnitIndex];
		}
		else {
			return this.defender[this.selectedUnitIndex - 3];
		}
	}

	nextActiveUnit() {
		this.activeUnitIndex++;
		if (this.activeUnitIndex > this.attacker.length * 2 - 1) {
			this.round++;
			this.activeUnitIndex = 0;
		}
		if (this.activeUnitIndex < this.attacker.length) {
			return this.attacker[this.activeUnitIndex];
		}
		else {
			return this.defender[this.activeUnitIndex - 3];
		}
	}

}