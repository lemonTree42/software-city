import {FrontYard, Metrics} from '../../processed/javaItems/returnObjectInterfaces';

export interface QuarterObject {
    quarter: {
        hidden: boolean,
        depth: number,
        position: {
            x: number,
            y: number
        }
        dimension: {
            width: number,
            height: number,
        }
        name: string,
        content: CityItemObject[],
    }
}

export interface CityItemObject {
    building?: Building,
    street?: Street,
}

interface Building {
    hidden: boolean,
    name: string,
    depth: number,
    position: {
        x: number,
        y: number,
    },
    dimension: {
        width: number,
        height: number,
    }
    type: string,
    metrics: Metrics,
    frontYards: FrontYard[],
}

interface Street {
    hidden: boolean,
    depth: number,
    nestingDepth: number,
    position: {
        x: number,
        y: number,
    }
    dimension: {
        width: number,
        height: number,
    }
}
