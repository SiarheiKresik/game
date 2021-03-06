import Fight from '../fight/fight';
import FightUnit from '../fightUnit/fightUnit';
import Scoreboard from '../scoreboard/scoreboard';
import $ from 'jquery';

export default class GameManager {
	constructor(userData) {
		this.monsterGroupsCounter = 0;
		this.userData = userData;
		this.lvlGenerator();
	}

	async lvlGenerator() {
		let diffucult = 1;
		let player = this.generateGroupOfUnits('player', diffucult);

		while (this.isGroupAlive(player)) {
			$('.loader').show();
			$('.loader_inner').show();
			setTimeout(() => {
				$('.loader_inner').fadeOut('slow');
				$('.loader').delay(400).fadeOut('slow');
			}, 1000);
			let monster = this.generateGroupOfUnits('monster', diffucult);
			diffucult = diffucult * 1.5;
			this.monsterGroupsCounter++;
			let fight = await new Fight(player, monster);
			player = fight.attacker;
			if (this.monsterGroupsCounter > 1000) {
				throw new Error('emergency exit from GameManager lvlCycle');
			}
		}

		const currentScore = this.calcScore();
		setTimeout(() => {
			this.showScore(currentScore);
		}, 1000);
	}

	generateGroupOfUnits(typeGroup, diffucult) {
		const unitGroup = [];
		unitGroup.typeGroup = typeGroup;
		for (let i = 0; i < 3; i++) {
			unitGroup.push(new FightUnit(typeGroup, diffucult));
		}
		return unitGroup;
	}

	isGroupAlive(groupOfUnits) {
		return groupOfUnits.some(unit => unit.hp > 0);
	}

	calcScore() {
		return this.monsterGroupsCounter * 10;
	}

	showScore(score) {
		Scoreboard.chkAndUpdateTop10LocalStorageRecords('top10score', score * 1, this.userData);
		Scoreboard.createTableOfRecordsFromLocalStore('top10score');
	}

}
