import clsx from "clsx";
import React from "react";

const Content = () => {
    const dropRef = React.useRef<HTMLDivElement>(null);

    const [prepare, setPrepare] = React.useState<boolean>(false);

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
