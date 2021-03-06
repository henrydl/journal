export class Activity {
	startTime: Date;
	
	constructor(readonly category: Category, startTime: Date = null, label: string = '') {
		this.startTime = startTime || new Date();
	}
}

export class Category {
	#classes: string[];
	color: string;

	constructor(readonly name: string, readonly description: string, readonly icon: string = 'work', readonly quotes: string[]) {
		this.color = name.toLowerCase();
		this.#classes = [];
		this.#classes.push('bg-' + this.color);
		this.#classes.push('text-' + this.color);
	}
}

import * as quotes from '../quotes';
export const Categories = {
	Productivity: new Category('Productivity', 'Working, producing, or making art.', 'work', quotes.productivity),
	Eating: new Category('Eating', 'ALL BEINGS MUST INGEST NUTRIENTS.', 'fastfood', quotes.eating),
	Exercise: new Category('Exercise', "It's important to keep your body from atrophying.", 'fitness_center', quotes.exercise),
	Sleep: new Category('Sleep', 'zzzzzzzz', 'hotel', quotes.sleep),
	Leisure: new Category('Leisure', 'Your time to relax.', 'sports_esports', quotes.leisure),
	Social: new Category('Social', 'Connecting with others mitigates symptoms of isolation.', 'people', quotes.social),
}