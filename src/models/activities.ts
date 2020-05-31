export class Activity {
	constructor(readonly category: Category, label: string = '', startTime: Date = new Date()) {

	}
}

export class Category {
	#classes: string[];
	color: string;

	constructor(readonly name: string, readonly description: string, readonly icon: string = 'work') {
		this.color = name.toLowerCase();
		this.#classes = [];
		this.#classes.push('bg-' + this.color);
		this.#classes.push('text-' + this.color);
	}
}

export const Categories = {
	Productivity: new Category('Productivity', 'Working, producing, or making art.', 'work'),
	Eating: new Category('Eating', 'ALL BEINGS MUST INGEST NUTRIENTS.', 'fastfood'),
	Exercise: new Category('Exercise', "It's important to keep your body from atrophying.", 'fitness_center'),
	Sleep: new Category('Sleep', 'zzzzzzzz', 'hotel'),
	Leisure: new Category('Leisure', 'Your time to relax.', 'sports_esports'),
	Social: new Category('Social', 'Connecting with others mitigates symptoms of isolation.', 'people'),
}