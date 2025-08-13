import { fabric } from 'fabric';

const BASE_COST = 570.00; // 650 EGP base price for a t-shirt
const COST_PER_WORD = 25; // 25 EGP per word after one free word
const COST_PER_LOGO = 25; // 25 EGP per logo after one free logo

interface CustomObject extends fabric.Object {
    cost?: number;
    type?: 'text' | 'logo';
}

class CostEngine {
    calculate(objects: fabric.Object[]): { totalCost: number, extraCost: number } {
        let totalCost = BASE_COST;
        let extraCost = 0; // Track extra cost
        let freeWordsUsed = 0;
        let freeLogosUsed = 0;

        // Defensive check
        if (!Array.isArray(objects)) {
            return { totalCost, extraCost };
        }

        objects.forEach(obj => {
            const customObj = obj as CustomObject;

            // Recalculate cost based on new logic
            if (customObj.type === 'text' && customObj instanceof fabric.IText) {
                const words = customObj.text?.split(/\s+/).filter(word => word.length > 0) || [];
                let wordCost = 0;
                words.forEach(() => {
                    if (freeWordsUsed < 1) { // One free word
                        freeWordsUsed++;
                    } else {
                        wordCost += COST_PER_WORD;
                    }
                });
                extraCost += wordCost;  // Accumulate extra cost
                customObj.cost = wordCost;

            } else if (customObj.type === 'logo') {
                let logoCost = 0;
                if (freeLogosUsed < 1) { // One free logo
                    freeLogosUsed++;
                } else {
                    logoCost = COST_PER_LOGO;
                }
                extraCost += logoCost; // Accumulate extra cost
                customObj.cost = logoCost;
            }

            totalCost += customObj.cost || 0;
        });

        return { totalCost, extraCost };
    }
}

export const costEngine = new CostEngine();
