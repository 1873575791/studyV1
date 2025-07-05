import { useEffect, useState } from "react"

export const useCellInfo = () => {
    const [info, setInfo] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        window.addEventListener("resize", () => {
            setInfo({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        });
        return () => {
            window.removeEventListener("resize", () => {
                setInfo({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            });
        };
    }, []);

    return {info};
}