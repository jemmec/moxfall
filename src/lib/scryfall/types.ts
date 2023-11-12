export type ScryfallError = {
    object: "error";
    code: string;
    status: number;
    warnings: string[];
    details: string;
};

export type ScryfallCard = {
    object: "card";
    artist: string;
    scryfall_id: string;
    oracle_id: string;
    set: string;
    name: string;
    set_name: string;
    set_id: string;
    collector_number: string;
};

export type ScryfallResponse = ScryfallCard | ScryfallError;
