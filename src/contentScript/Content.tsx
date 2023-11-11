import clsx from "clsx";
import React from "react";
import API, { DeckResponse, RefreshResponse } from "../lib/api-defs";

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

    if (auth === null || deck === null) {
        return <></>;
    }

    return (
        <div
            ref={dropRef}
            className={clsx(
                "group/drop absolute inset-0 flex justify-center items-center z-[9999] pointer-events-none",
                {
                    "pointer-events-auto bg-cyan-400 bg-opacity-20": prepare
                }
            )}
        ></div>
    );
};

export default Content;
