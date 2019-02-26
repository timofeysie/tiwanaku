export interface IEntity {
    id: number;
    // wikidata
    cognitive_bias: string;
    cognitive_biasDescription: string;
    cognitive_biasLabel: string;
	lang: string;
	// WikiMedia
	wikiMedia_label: string;
	wikiMedia_description: string;
	wikiMedia_category: string;
	sortName: string;
	detailState: string;
	descriptionState: string;
	itemState: string;
	backupTitle: string;
}
