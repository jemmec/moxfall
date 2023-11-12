import clsx from "clsx";
import React from "react";
import MOXFIELD_API, { DeckResponse, RefreshResponse, addCardToMainboard } from "../lib/moxfield";
import { ALLOWED_HOSTS, getQueryString, inferCardFromUrl } from "../lib/scryfall";

const Content = () => {
    const dropRef = React.useRef<HTMLDivElement>(null);
    const [publicDeckId, setPublicDeckId] = React.useState<string | null>(null);
    const [prepare, setPrepare] = React.useState<boolean>(false);
    const [auth, setAuth] = React.useState<RefreshResponse | null>(null);
    const [deck, setDeck] = React.useState<DeckResponse | null>(null);
    const [isHovering, setIsHovering] = React.useState<"add" | "cancel" | "none">("none");

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

        setPrepare(false);
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
        setPrepare(false);
    };

    const handleMouseEnterDoc = (event: MouseEvent) => {
        event.preventDefault();
        setPrepare(false);
    };

    /**
     * Only create the drop listeners if we have ALL the parts...
     */
    React.useEffect(() => {
        if (!dropRef.current || !deck || !auth || !publicDeckId) {
            removeListeners();
            return;
        }

        dropRef.current.addEventListener("drop", handleDrop);
        dropRef.current.addEventListener("mouseleave", handleMouseLeaveDoc);
        dropRef.current.addEventListener("mouseenter", handleMouseEnterDoc);
        document.addEventListener("dragover", handleDragOverDoc);
        document.addEventListener("mouseleave", handleMouseLeaveDoc);
        document.addEventListener("mouseenter", handleMouseEnterDoc);

        return () => {
            removeListeners();
        };
    }, [dropRef, dropRef.current, deck, auth, publicDeckId]);

    const removeListeners = () => {
        if (dropRef.current) {
            dropRef.current.removeEventListener("drop", handleDrop);
            dropRef.current.removeEventListener("mouseleave", handleMouseLeaveDoc);
            dropRef.current.removeEventListener("mouseenter", handleMouseEnterDoc);
            document.removeEventListener("dragover", handleDragOverDoc);
            document.removeEventListener("mouseleave", handleMouseLeaveDoc);
            document.removeEventListener("mouseenter", handleMouseEnterDoc);
        }
    };

    return (
        <div
            ref={dropRef}
            className={clsx(
                "group/drop fixed top-0 left-0 w-screen h-screen z-[9999] pointer-events-none",
                {
                    "pointer-events-auto": prepare
                }
            )}
            style={{ display: prepare ? "block" : "none" }}
        >
            <div className="p-8 gap-8 flex flex-col w-full h-full">
                <div
                    className={clsx("w-full h-full", {
                        "bg-green-600 bg-opacity-10": isHovering === "add"
                    })}
                    onDragEnter={() => setIsHovering("add")}
                    onDragLeave={() => setIsHovering("none")}
                >
                    <div className="w-full h-full border-4 border-dashed border-opacity-80 border-green-600 flex justify-center items-center">
                        <h1 className="text-green-600 text-6xl font-bold">ADD CARD</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Content;
