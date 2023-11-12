import clsx from "clsx";
import React from "react";
import API, { DeckResponse, RefreshResponse } from "../lib/api-defs";
import { reduxDispatch, reduxGetState } from ".";

const Content = () => {
    const dropRef = React.useRef<HTMLDivElement>(null);
    const [prepare, setPrepare] = React.useState<boolean>(false);
    const [auth, setAuth] = React.useState<RefreshResponse | null>(null);
    const [deck, setDeck] = React.useState<DeckResponse | null>(null);

    /**
     * Fetch access token for user
     */
    React.useEffect(() => {
        (async () => {
            try {
                const res = await API.refresh().catch((err) => console.error(err));

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
        if (!auth || auth === null) {
            return;
        }

        //get publicDeckId from URL params
        const deckId = window.location.pathname.split("/").pop();

        if (!deckId) {
            return;
        }

        (async () => {
            const res = await API.deck(deckId, auth.access_token).catch((err) =>
                console.error(err)
            );

            if (!res || !res.id || res.id === "") {
                return;
            }

            setDeck(res);
        })();
    }, [auth]);

    React.useEffect(() => {
        if (!dropRef.current) {
            return;
        }

        const handleDrop = (event: DragEvent) => {
            event.preventDefault();
            const url = event.dataTransfer?.getData("text/plain");
            setPrepare(false);
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

        const handleDragLeaveDoc = (event: DragEvent) => {
            event.preventDefault();
            setPrepare(false);
        };

        dropRef.current.addEventListener("drop", handleDrop);

        document.addEventListener("dragover", handleDragOverDoc);
        document.addEventListener("mouseleave", handleMouseLeaveDoc);
        document.addEventListener("dragleave", handleDragLeaveDoc);

        return () => {
            if (dropRef.current) {
                dropRef.current.removeEventListener("drop", handleDrop);

                document.removeEventListener("dragover", handleDragOverDoc);
                document.removeEventListener("mouseleave", handleMouseLeaveDoc);
                document.removeEventListener("dragleave", handleDragLeaveDoc);
            }
        };
    }, [dropRef.current]);

    const test_addCard = React.useCallback(
        async (cardId: string) => {
            if (!auth || !deck) {
                return;
            }

            const res = await API.mainboard(
                {
                    cardId,
                    quantity: 1,
                    userPrefPrinting: true
                },
                deck.id,
                auth.access_token
            ).catch((err) => console.error(err));

            if (!res || !res.card) {
                console.error("Adding card to mainboard was not successfull");
                return;
            }

            console.log("the card", res.card);
            console.log("the deck", deck);

            console.log("Before dispatch");

            const success = await reduxDispatch({
                type: "ADD_CARD_TO_BOARD_BEGIN",
                deck: {
                    publicId: deck.publicId
                },
                board: "mainboard",
                card: res.card.card,
                quantity: 1
            });

            console.log("After dispatch");

            if (!success) {
                console.log("Failed to redux my dispatch");
                return;
            }
        },
        [auth, deck]
    );

    const printReduxState = async () => {
        const state = await reduxGetState();
        console.log("Redux state: ", state);
    };

    if (auth === null || deck === null) {
        return <></>;
    }

    return (
        <div
            ref={dropRef}
            className={clsx(
                "group/drop absolute inset-0 flex justify-center z-[9999] pointer-events-none",
                {
                    "pointer-events-auto bg-cyan-400 bg-opacity-20": prepare
                }
            )}
        >
            <div className="felx gap-4">
                <button
                    className={clsx(
                        "btn btn-outline btn-outline-primary",
                        "pointer-events-auto h-min"
                    )}
                    onClick={() => test_addCard("DjJZN" /*Arcane Signet*/)}
                >
                    <h3>Add Arcane Signet</h3>
                </button>
                <button
                    className={clsx(
                        "btn btn-outline btn-outline-primary",
                        "pointer-events-auto h-min"
                    )}
                    onClick={() => printReduxState()}
                >
                    <h3>Print Redux state</h3>
                </button>
            </div>
        </div>
    );
};

export default Content;
