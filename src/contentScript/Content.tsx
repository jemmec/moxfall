import clsx from "clsx";
import React from "react";
import MOXFIELD_API, { DeckResponse, RefreshResponse, addCardToMainboard } from "../lib/moxfield";
import { ALLOWED_HOSTS, getQueryString, inferCardFromUrl } from "../lib/scryfall";

const Content = () => {
    const dropRef = React.useRef<HTMLDivElement>(null);
    const [prepare, setPrepare] = React.useState<boolean>(false);
    const [auth, setAuth] = React.useState<RefreshResponse | null>(null);
    const [deck, setDeck] = React.useState<DeckResponse | null>(null);

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

            if (!results.data || results.data.length < 1 || !results.exactMatch) {
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
            console.log(`SUCCESSFULLY ADDED ${card.name} TO THE MAINBOARD!`);
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
     * Fetch the current deck...
     */
    React.useEffect(() => {
        if (!auth) {
            return;
        }

        //get publicDeckId from URL params
        const deckId = window.location.pathname.split("/").pop();

        if (!deckId) {
            return;
        }

        (async () => {
            const res = await MOXFIELD_API.deck(deckId, auth.access_token).catch((err) =>
                console.error(err)
            );

            if (!res || !res.id || res.id === "") {
                return;
            }

            setDeck(res);
        })();
    }, [auth]);

    React.useEffect(() => {
        if (!dropRef.current || !deck || !auth) {
            return;
        }

        const handleDrop = (event: DragEvent) => {
            setPrepare(false);
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

        const handleDragOverDoc = (event: DragEvent) => {
            event.preventDefault();
            event.dataTransfer!.dropEffect = "copy";
            setPrepare(true);
        };

        const handleMouseLeaveDoc = (event: MouseEvent) => {
            event.preventDefault();
            if (!prepare) {
                return;
            }
            setPrepare(false);
        };

        const handleMouseEnterDoc = (event: MouseEvent) => {
            event.preventDefault();
            if (!prepare) {
                return;
            }
            setPrepare(false);
        };

        dropRef.current.addEventListener("drop", handleDrop);

        document.addEventListener("dragover", handleDragOverDoc);
        document.addEventListener("mouseleave", handleMouseLeaveDoc);
        document.addEventListener("mouseenter", handleMouseEnterDoc);

        return () => {
            if (dropRef.current) {
                dropRef.current.removeEventListener("drop", handleDrop);

                document.removeEventListener("dragover", handleDragOverDoc);
                document.removeEventListener("mouseleave", handleMouseLeaveDoc);
                document.removeEventListener("mouseenter", handleMouseEnterDoc);
            }
        };
    }, [dropRef, dropRef.current, deck, auth]);

    return (
        <div
            ref={dropRef}
            className={clsx(
                "group/drop absolute inset-0 flex justify-center z-[9999] pointer-events-none",
                {
                    "pointer-events-auto bg-cyan-400 bg-opacity-20": prepare
                }
            )}
        ></div>
    );
};

export default Content;
