import clsx from "clsx";
import React from "react";
import MOXFIELD_API, { DeckResponse, RefreshResponse, addCardToMainboard } from "../lib/moxfield";
import { ALLOWED_HOSTS, getQueryString, inferCardFromUrl } from "../lib/scryfall";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

function Content() {
    const [publicDeckId, setPublicDeckId] = React.useState<string | null>(null);
    const [auth, setAuth] = React.useState<RefreshResponse | null>(null);
    const [deck, setDeck] = React.useState<DeckResponse | null>(null);

    const [{ canDrop }] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            collect: (monitor) => ({
                canDrop: monitor.canDrop()
            })
        }),
        []
    );

    React.useEffect(() => {
        const handleLocationChange = () => {
            const route = location.pathname;
            if (!route.includes("decks")) {
                setPublicDeckId(null);
                return;
            }
            const end = route.split("/").pop() ?? null;

            setPublicDeckId(end);
        };

        document.addEventListener("locationchanged", handleLocationChange);

        return () => {
            document.removeEventListener("locationchanged", handleLocationChange);
        };
    }, []);

    const handleCardDrop = React.useCallback(
        async (url: URL) => {
            if (!auth || !deck) {
                return;
            }

            const card = await inferCardFromUrl(url);

            if (card === null) {
                console.error("Scryfall card was null");
                return;
            }

            const query = getQueryString(card);

            //using details from the scryfall card, fetch the moxfield card...
            const results = await MOXFIELD_API.getMoxfieldCardsSearch(query, auth.access_token);

            if (results.status || results.code) {
                console.error(
                    `Failed get card from moxfield search ${results.code}, query was ${query}`
                );
                return;
            }

            if ((!results.data || results.data.length < 1) && !results.exactMatch) {
                console.error(`Got correct response but there was no card?`);
                return;
            }

            const res = await addCardToMainboard(
                deck,
                results.exactMatch ? results.exactMatch : results.data[0],
                auth.access_token
            );

            if (!res.ok) {
                console.error(`Failed to add card to mainboard: ${res.error}`);
                return;
            }

            //SUCCESSFULL!
            console.log(`Moxfall: Added ${card.name}`);
        },
        [auth, deck]
    );

    /**
     * Fetch access token for user
     */
    React.useEffect(() => {
        (async () => {
            try {
                const res = await MOXFIELD_API.refresh().catch((err) => console.error(err));

                if (!res || !res.access_token || res.access_token === "") {
                    return;
                }

                setAuth(res);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    /**
     * Fetch the current deck
     */
    React.useEffect(() => {
        if (!auth || !publicDeckId) {
            if (deck) {
                setDeck(null);
            }
            return;
        }

        (async () => {
            const res = await MOXFIELD_API.deck(publicDeckId, auth.access_token).catch((err) =>
                console.error(err)
            );

            if (!res || !res.id || res.id === "") {
                return;
            }

            setDeck(res);
        })();
    }, [auth, publicDeckId]);

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        const data = event.dataTransfer?.getData("text/plain");

        if (!data) {
            return;
        }

        let url = null;
        try {
            url = new URL(data);
        } catch (err) {
            return;
        }

        if (
            !url ||
            !url.host ||
            !ALLOWED_HOSTS.includes(url.host) ||
            !url.pathname ||
            url.pathname === ""
        ) {
            return;
        }

        handleCardDrop(new URL(url));
    };

    return (
        <div
            className="fixed flex-col top-0 left-0 w-screen h-screen z-[9999]"
            style={{ pointerEvents: canDrop ? "auto" : "none" }}
        >
            <div className="flex h-[calc(100%-256px)] w-full">
                <Dropzone
                    text="MAINBOARD"
                    onDrop={(e) => {
                        console.log("Dropped", e);
                    }}
                    class="w-full h-full flex justify-center items-center text-green-700"
                    drop="bg-green-600 bg-opacity-10 text-opacity-30"
                    over="bg-green-600 bg-opacity-30 text-opacity-60"
                ></Dropzone>
                <Dropzone
                    text="CONSIDERING"
                    onDrop={(e) => {
                        console.log("Dropped", e);
                    }}
                    class="w-full h-full flex justify-center items-center text-blue-700"
                    drop="bg-blue-600 bg-opacity-10 text-opacity-30"
                    over="bg-blue-600 bg-opacity-30 text-opacity-60"
                ></Dropzone>
            </div>
            <Dropzone
                text="CANCEL"
                onDrop={(e) => {}}
                class="w-full h-[256px] flex justify-center items-center text-red-700"
                drop="bg-red-600 bg-opacity-10 text-opacity-30"
                over="bg-red-600 bg-opacity-30 text-opacity-60"
            ></Dropzone>
        </div>
    );
}

type URLDropPayload = {
    urls: string;
};

function Dropzone(props: {
    onDrop?: (arg: URLDropPayload) => void | undefined;
    class?: string | undefined;
    drop?: string | undefined;
    over?: string | undefined;
    text: string;
}) {
    const { onDrop } = props;
    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            drop(item: URLDropPayload) {
                if (onDrop) {
                    onDrop(item);
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop()
            })
        }),
        [props]
    );

    return (
        <div
            ref={drop}
            className={clsx(
                "flex justify-center items-center",
                props.class,
                canDrop && props.drop,
                isOver && props.over
            )}
        >
            {(canDrop || isOver) && <h1 className="text-8xl font-bold">{props.text}</h1>}
        </div>
    );
}

export default Content;
