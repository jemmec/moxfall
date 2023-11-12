import clsx from "clsx";
import React from "react";
import MOXFIELD_API, { DeckResponse, RefreshResponse } from "../lib/moxfield";
import SCRYFALL_API from "../lib/scryfall";
import { reduxGetState } from ".";
import { addCardToMainboard } from "../lib/moxfield/addCardToMainboard";

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
        if (!auth || auth === null) {
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
        if (!dropRef.current || !auth || !deck) {
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
    }, [dropRef.current, auth, deck]);

    const handleAddCard = React.useCallback(async () => {
        if (!auth || !deck) {
            return;
        }

        const cardId = "DjJZN"; /*Arcane Signet*/

        const res = await addCardToMainboard(deck, cardId, auth.access_token);

        if (!res.ok) {
            console.error(res.error);
            return;
        }

        console.log("Successfully added card to mainboard :-)");
    }, [auth, deck]);

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
                    onClick={() => printReduxState()}
                >
                    <h3>Print Redux state</h3>
                </button>
            </div>
        </div>
    );
};

export default Content;
